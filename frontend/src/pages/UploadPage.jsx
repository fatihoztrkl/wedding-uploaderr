import React, { useState } from "react";
import FileUploader from "../components/FileUploader";

export default function UploadPage() {
  const [username, setUsername] = useState("");
  // weddingId URL paramdan alınır; örnek: ?w=abc123
  const params = new URLSearchParams(window.location.search);
  const weddingId = params.get("w") || "demo-wedding";

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Düğün İçerik Yükleme</h1>
      <label className="block mb-2">İsim (gösterilecek isim)</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Adınızı yazınız"
      />
      <FileUploader username={username} weddingId={weddingId} />
    </div>
  );
}
