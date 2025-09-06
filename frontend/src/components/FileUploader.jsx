import React, { useState } from "react";
import axios from "axios";

export default function FileUploader({ username, weddingId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  async function handleFile(file) {
    if (!username) {
      alert("Lütfen isim girin.");
      return;
    }
    setStatus("Oturum oluşturuluyor...");
    // 1) backend'e init talebi: kullanıcı klasörü oluşturulsun, resumable upload session dönsün
    const initResp = await axios.post(
      "/backend/init_upload.php",
      {
        weddingId,
        username,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!initResp.data || !initResp.data.uploadUrl) {
      setStatus("Sunucu hatası: uploadUrl yok.");
      return;
    }

    const uploadUrl = initResp.data.uploadUrl;
    setStatus("Yükleme başlıyor...");

    // 2) chunk loop - doğrudan uploadUrl'ye PUT ile göndereceğiz (CORS sorununa dikkat)
    let uploadedBytes = 0;
    const total = file.size;
    for (let start = 0; start < total; start += CHUNK_SIZE) {
      const end = Math.min(total - 1, start + CHUNK_SIZE - 1);
      const chunk = file.slice(start, end + 1);

      const contentRange = `bytes ${start}-${end}/${total}`;

      try {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Range": contentRange,
            "Content-Type": file.type || "application/octet-stream",
          },
          body: chunk,
        });

        // 308 Resume Incomplete veya 200/201 tamamlanma
        if (resp.status === 308) {
          // part uploaded, devam
        } else if (resp.status === 200 || resp.status === 201) {
          // tamamlandı
          uploadedBytes = total;
          setProgress(100);
          break;
        } else {
          // hatalı durum: fallback isteği yap (backend üzerinden chunk gönderimi)
          console.warn("Direct upload responded:", resp.status);
          setStatus("Doğrudan yükleme başarısız, fallback kullanılacak.");
          await fallbackUpload(file, start); // fallback fonksiyon
          break;
        }

        uploadedBytes = end + 1;
        setProgress(Math.floor((uploadedBytes / total) * 100));
      } catch (err) {
        console.error("Chunk upload error", err);
        setStatus("Ağ hatası, fallback deneniyor.");
        await fallbackUpload(file, start);
        break;
      }
    }

    if (uploadedBytes === total) {
      setStatus("Yükleme tamamlandı.");
    }
  }

  // Basit fallback: tüm dosyayı backend'e chunk'lar halinde gönder
  async function fallbackUpload(file, resumeFrom = 0) {
    setStatus("Fallback: sunucu üzerinden yükleniyor...");
    const CH = CHUNK_SIZE;
    const total = file.size;
    for (let start = resumeFrom; start < total; start += CH) {
      const end = Math.min(total, start + CH);
      const chunk = file.slice(start, end);
      const fd = new FormData();
      fd.append("file", chunk);
      fd.append("username", username);
      fd.append("weddingId", weddingId);
      fd.append("filename", file.name);
      fd.append("chunkStart", start);
      fd.append("chunkEnd", end);
      fd.append("totalSize", total);

      const resp = await fetch("/backend/upload_chunk.php", {
        method: "POST",
        body: fd,
      });
      if (!resp.ok) {
        setStatus("Sunucuya gönderme hatası: " + resp.status);
        return;
      }
      const percent = Math.floor((end / total) * 100);
      setProgress(percent);
    }
    setStatus("Yükleme tamamlandı (fallback).");
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFile(e.target.files[0])}
        className="mb-2"
      />
      <div className="w-full bg-gray-200 h-3 rounded mb-2">
        <div
          className="h-3 rounded bg-green-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div>
        {progress}% — {status}
      </div>
    </div>
  );
}
