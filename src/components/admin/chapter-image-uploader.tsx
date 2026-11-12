"use client";

import { DragEvent, useMemo, useState } from "react";

type UploadFile = { id: string; file: File; preview: string; progress: number; state: "ready" | "uploading" | "done" | "error"; message?: string };

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return resolve(file);
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxWidth = 1800;
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) { URL.revokeObjectURL(objectUrl); return resolve(file); }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob || blob.size >= file.size) return resolve(file);
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" }));
      }, "image/webp", 0.82);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    image.src = objectUrl;
  });
}

function putFile(url: string, file: File, onProgress: (value: number) => void, contentType: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("R2 menolak upload (" + xhr.status + "). Periksa CORS bucket."));
    xhr.onerror = () => reject(new Error("Koneksi upload gagal."));
    xhr.send(file);
  });
}

export default function ChapterImageUploader({ chapterId }: { chapterId: string }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const totalSize = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);

  function addFiles(list: FileList | File[]) {
    const accepted = Array.from(list).filter((file) => ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type));
    const next = accepted.slice(0, Math.max(0, 100 - files.length)).map((file) => ({
      id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), progress: 0, state: "ready" as const,
    }));
    setFiles((current) => [...current, ...next]);
    if (accepted.length === 0) setMessage("Pilih gambar JPG, PNG, WebP, atau AVIF.");
  }

  function move(index: number, offset: number) {
    setFiles((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function uploadAll() {
    if (!files.length || busy) return;
    setBusy(true);
    setMessage("");
    const completed: { storageKey: string; publicUrl: string; pageNumber: number }[] = [];
    try {
      for (let index = 0; index < files.length; index++) {
        const item = files[index];
        if (item.state === "done") continue;
        setFiles((current) => current.map((file) => file.id === item.id ? { ...file, state: "uploading" } : file));
        try {
          const compressed = await compressImage(item.file);
          const contentType = compressed.type;
          const presignResponse = await fetch("/api/upload/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ manhwaId: (await fetch("/api/upload/chapter-owner?chapterId=" + chapterId).then(r => r.ok ? r.json() : Promise.reject(new Error("Tidak dapat memeriksa chapter.")))).manhwaId, chapterId, contentType, fileSize: compressed.size }),
          });
          const signed = await presignResponse.json();
          if (!presignResponse.ok) throw new Error(signed.error ?? "Gagal meminta URL upload.");
          await putFile(signed.uploadUrl, compressed, (progress) => setFiles((current) => current.map((file) => file.id === item.id ? { ...file, progress } : file)), contentType);
          completed.push({ storageKey: signed.storageKey, publicUrl: signed.publicUrl, pageNumber: index + 1 });
          setFiles((current) => current.map((file) => file.id === item.id ? { ...file, progress: 100, state: "done" } : file));
        } catch (error) {
          setFiles((current) => current.map((file) => file.id === item.id ? { ...file, state: "error", message: error instanceof Error ? error.message : "Upload gagal" } : file));
          throw error;
        }
      }
      if (completed.length) {
        const response = await fetch("/api/upload/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterId, images: completed }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan urutan gambar.");
      }
      setMessage("Upload dan penyimpanan halaman berhasil.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  }

  return <section className="mt-7 rounded-2xl border border-white/10 bg-[#121620] p-5">
    <h2 className="text-xl font-bold">Upload halaman chapter</h2>
    <p className="mt-1 text-sm text-white/45">Maksimal 100 gambar per batch, 15 MB per gambar. Gambar akan dicoba dikompres menjadi WebP di browser.</p>
    <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`mt-5 rounded-xl border border-dashed p-8 text-center ${dragging ? "border-[#b6f36b] bg-[#b6f36b]/5" : "border-white/20 bg-[#090b10]"}`}>
      <p className="text-sm text-white/65">Tarik gambar ke sini atau pilih dari komputer</p>
      <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-[#b6f36b] px-4 py-2 text-sm font-bold text-[#10140b]">Pilih gambar<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files)}/></label>
    </div>
    <div className="mt-3 flex justify-between text-xs text-white/40"><span>{files.length} gambar</span><span>{(totalSize / 1024 / 1024).toFixed(1)} MB sebelum kompresi</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {files.map((item, index) => <div key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#090b10]">
        <img src={item.preview} alt={item.file.name} className="aspect-[3/4] w-full object-cover"/>
        <div className="p-2"><p className="truncate text-[11px] text-white/65">{index + 1}. {item.file.name}</p><div className="mt-2 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-[#b6f36b]" style={{ width: item.progress + "%" }}/></div><p className="mt-1 text-[10px] text-white/40">{item.state === "done" ? "Selesai" : item.state === "error" ? "Gagal" : item.state === "uploading" ? item.progress + "%" : "Menunggu"}</p>{item.message && <p className="mt-1 text-[10px] text-red-300">{item.message}</p>}
          <div className="mt-2 flex gap-1"><button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30">↑</button><button type="button" disabled={busy || index === files.length - 1} onClick={() => move(index, 1)} className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30">↓</button><button type="button" disabled={busy || item.state === "done"} onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))} className="ml-auto rounded border border-red-400/20 px-2 py-1 text-xs text-red-300 disabled:opacity-30">×</button></div>
        </div>
      </div>)}
    </div>
    {message && <p role="status" className="mt-4 rounded-lg border border-white/10 p-3 text-sm text-white/70">{message}</p>}
    <button type="button" disabled={busy || files.length === 0 || files.every((file) => file.state === "done")} onClick={uploadAll} className="mt-5 rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b] disabled:opacity-40">{busy ? "Mengunggah..." : "Upload semua gambar"}</button>
  </section>;
}
