import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ url: z.string().url().max(2048) });
const MAX_HTML_BYTES = 2 * 1024 * 1024;

function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized === "::" ||
      normalized.startsWith("fc") || normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") || normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
  }
  return true;
}

async function assertPublicUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("URL harus menggunakan HTTP/HTTPS dan tidak boleh berisi kredensial.");
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Alamat lokal tidak dapat diambil.");
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("Alamat IP privat tidak diizinkan.");
  } else {
    const records = await lookup(host, { all: true, verbatim: true });
    if (!records.length || records.some((record) => isPrivateAddress(record.address))) {
      throw new Error("Domain tidak valid atau mengarah ke jaringan privat.");
    }
  }
  return url;
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .trim();
}

function meta(html: string, key: string) {
  const tags = html.match(/<meta\\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attributes: Record<string, string> = {};
    const attributePattern = /([a-zA-Z:-]+)\\s*=\\s*(?:"([^"]*)"|'([^']*)')/g;
    for (const match of tag.matchAll(attributePattern)) {
      attributes[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? "");
    }
    if ((attributes.property || attributes.name || "").toLowerCase() === key.toLowerCase()) {
      return attributes.content || "";
    }
  }
  return "";
}

function firstJsonLd(html: string): Record<string, unknown> | null {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      const candidate = Array.isArray(parsed) ? parsed[0] : parsed;
      if (candidate && typeof candidate === "object") return candidate as Record<string, unknown>;
    } catch { /* Ignore malformed structured data. */ }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login sebagai staf." }, { status: 403 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return NextResponse.json({ error: "Akses scraper hanya untuk staf." }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });

    let target = parsed.data.url;
    let response: Response | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const checked = await assertPublicUrl(target);
      response = await fetch(checked, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "ManhwaHubMetadataPreview/1.0 (+admin source preview)", "Accept": "text/html,application/xhtml+xml" },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return NextResponse.json({ error: "Situs mengirim pengalihan yang tidak valid." }, { status: 422 });
        target = new URL(location, checked).toString();
        continue;
      }
      break;
    }
    if (!response || [301, 302, 303, 307, 308].includes(response.status)) {
      return NextResponse.json({ error: "Terlalu banyak pengalihan URL." }, { status: 422 });
    }
    if (!response.ok) return NextResponse.json({ error: `Situs sumber merespons HTTP ${response.status}.` }, { status: 422 });
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
      return NextResponse.json({ error: "URL sumber bukan halaman HTML." }, { status: 415 });
    }
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_HTML_BYTES) return NextResponse.json({ error: "Halaman sumber terlalu besar untuk dipratinjau." }, { status: 413 });
    const html = await response.text();
    if (new TextEncoder().encode(html).byteLength > MAX_HTML_BYTES) {
      return NextResponse.json({ error: "Halaman sumber terlalu besar untuk dipratinjau." }, { status: 413 });
    }

    const structured = firstJsonLd(html);
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, " ") || "";
    const title = meta(html, "og:title") || meta(html, "twitter:title") ||
      (typeof structured?.name === "string" ? structured.name : "") || decode(titleTag);
    const description = meta(html, "og:description") || meta(html, "description") ||
      (typeof structured?.description === "string" ? structured.description : "");
    const image = meta(html, "og:image") || meta(html, "twitter:image") ||
      (typeof structured?.image === "string" ? structured.image :
        typeof structured?.image === "object" && structured.image && "url" in structured.image ? String((structured.image as {url: unknown}).url) : "");
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || target;
    const sourceName = meta(html, "og:site_name") || new URL(target).hostname;
    const absoluteImage = image ? new URL(image, target).toString() : "";

    if (!title && !description && !absoluteImage) {
      return NextResponse.json({ error: "Metadata tidak ditemukan. Situs mungkin memerlukan adapter khusus." }, { status: 422 });
    }
    return NextResponse.json({
      sourceUrl: target,
      canonicalUrl: new URL(canonical, target).toString(),
      sourceName,
      title: title.slice(0, 180),
      description: description.slice(0, 3000),
      coverUrl: absoluteImage,
      note: "Ini hanya pratinjau metadata. Impor dan publikasi gambar/halaman komik memerlukan izin dari pemegang hak.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tidak dapat membaca situs sumber.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
