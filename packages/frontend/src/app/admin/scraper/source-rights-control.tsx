"use client";

import { useState } from "react";

export default function SourceRightsControl({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/scraper/rights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rightsStatus: status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal memperbarui status.");
      setMessage("Status tersimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Status izin penggunaan" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#090b10] px-3 py-2 text-xs">
        <option value="unverified">Belum diverifikasi</option>
        <option value="authorized">Diizinkan / berlisensi</option>
        <option value="original">Karya sendiri</option>
        <option value="do_not_publish">Jangan diterbitkan</option>
      </select>
      <button type="button" disabled={busy || status === initialStatus} onClick={save} className="rounded-lg bg-[#b6f36b] px-3 py-2 text-xs font-bold text-[#10140b] disabled:opacity-40">{busy ? "Menyimpan..." : "Simpan status"}</button>
      {message && <span role="status" className="text-xs text-white/60">{message}</span>}
    </div>
  );
}
