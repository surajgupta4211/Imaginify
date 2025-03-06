"use client";
import React, { useState } from "react";
import { filesize } from "filesize";

export default function ImageCompressionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/image-compression", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.compressedUrl) {
        setOriginalUrl(data.originalUrl);
        setCompressedUrl(data.compressedUrl);
        setOriginalSize(data.originalSize);
        setCompressedSize(data.compressedSize);
      } else {
        alert("Image compression failed.");
      }
    } catch (error) {
      console.error("Failed to compress image", error);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;

    fetch(compressedUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "compressed_image.jpg"; // ✅ Set Download File Name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // ✅ Clean up Blob URL
      })
      .catch((error) => console.error("Download failed:", error));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Compression</h1>

      <div className="card bg-base-200 shadow-lg p-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <input
            type="file"
            className="file-input file-input-bordered w-full mb-4"
            onChange={handleFileChange}
          />

          <button className="btn btn-primary w-full" onClick={handleCompress} disabled={loading}>
            {loading ? "Compressing..." : "Compress Image"}
          </button>

          {/* Display Images Horizontally */}
          {originalUrl && compressedUrl && (
            <div className="flex justify-center items-start mt-6 space-x-6">
              {/* Original Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Original</h3>
                <img src={originalUrl} alt="Original Image" className="w-64 h-64 rounded-lg shadow-lg" />
                <p className="text-sm text-gray-400 mt-2">Size: {filesize(originalSize || 0)}</p>
              </div>

              {/* Compressed Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Compressed</h3>
                <img src={compressedUrl} alt="Compressed Image" className="w-64 h-64 rounded-lg shadow-lg" />
                <p className="text-sm text-gray-400 mt-2">Size: {filesize(compressedSize || 0)}</p>

                {/* Download Button */}
                <button
                  className="mt-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  onClick={handleDownload}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          )}

          {originalSize && compressedSize && (
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold">
                Compression:{" "}
                <span className="text-green-500">
                  {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}