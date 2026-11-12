"use client";

import { useState } from "react";

type Preview = {
  sourceUrl: string;
  canonicalUrl: string;
  sourceName: string;
  title: string;
  description: string;
  coverUrl: string;
  note: string;
};

export default function ScraperPreviewForm() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSavedMessage("");
    setPreview(null);
    try {
      const response = await fetch("/api/admin/scraper/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal membaca sumber.");
      setPreview(result as Preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSource() {
    if (!preview) return;
    setSaving(true);
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch("/api/admin/scraper/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: preview.sourceUrl,
          canonicalUrl: preview.canonicalUrl,
          sourceName: preview.sourceName,
          title: preview.title,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan sumber.");
      setSavedMessage(result.message || "Sumber berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-7 max-w-3xl">
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#121620] p-5">
        <label htmlFor="source-url" className="text-sm font-semibold text-white/75">URL halaman sumber</label>
        <input
          id="source-url"
          type="url"
          required
          maxLength={2048}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://contoh-situs.com/judul-komik"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b10] px-4 py-3 text-sm outline-none focus:border-[#b6f36b]/60"
        />
        <p className="mt-2 text-xs leading-5 text-white/40">Tempel URL halaman judul atau halaman informasi komik. Sistem akan mencoba membaca metadata standar dari berbagai situs.</p>
        <button disabled={loading} className="mt-4 rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b] disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Memeriksa sumber..." : "Pratinjau metadata"}
        </button>
      </form>

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      {preview && (
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#121620] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Hasil pratinjau</h2>
            <span className="rounded-full bg-[#b6f36b]/10 px-3 py-1 text-xs text-[#c8ff91]">Metadata ditemukan</span>
          </div>
          {preview.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.coverUrl} alt="Pratinjau cover dari sumber" referrerPolicy="no-referrer" className="mt-4 max-h-72 max-w-48 rounded-xl border border-white/10 object-contain" />
          )}
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="text-xs text-white/40">Judul</dt><dd className="mt-1 font-semibold">{preview.title || "Tidak ditemukan"}</dd></div>
            <div><dt className="text-xs text-white/40">Situs sumber</dt><dd className="mt-1 break-all">{preview.sourceName}</dd></div>
            <div><dt className="text-xs text-white/40">Sinopsis / deskripsi</dt><dd className="mt-1 whitespace-pre-wrap text-white/75">{preview.description || "Tidak ditemukan"}</dd></div>
            <div><dt className="text-xs text-white/40">URL kanonis</dt><dd className="mt-1 break-all text-[#b6f36b]">{preview.canonicalUrl}</dd></div>
            {preview.coverUrl && <div><dt className="text-xs text-white/40">URL cover</dt><dd className="mt-1 break-all text-white/70">{preview.coverUrl}</dd></div>}
          </dl>
          <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">{preview.note}</p>
          <button type="button" onClick={saveSource} disabled={saving} className="mt-4 rounded-xl border border-[#b6f36b]/30 bg-[#b6f36b]/10 px-5 py-3 text-sm font-bold text-[#c8ff91] disabled:opacity-50">
            {saving ? "Menyimpan..." : "Simpan catatan sumber"}
          </button>
          {savedMessage && <p role="status" className="mt-3 text-sm text-[#c8ff91]">{savedMessage}</p>}
        </section>
      )}
    </div>
  );
}
