"use client";
import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { ImageData } from "@/types";
import { RefreshCcw } from "lucide-react"

const BgRemove = () => {
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [from, setFrom] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const [to, setTo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
      setIsGenerating(true);
    }
  }, [uploadedImage]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // File type validation (only JPEG and PNG)
    const validMimeTypes = ["image/jpeg", "image/png"];
    if (!validMimeTypes.includes(file.type)) {
      setErrorMessage("Invalid file format. Only JPEG and PNG are allowed.");
      return;
    }

    // File size validation (Max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size too large. Max size is 5MB.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null); // Reset error message if file is valid
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      setUploadedImage(data.data);
    } catch (error) {
      console.log(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "transformed_image.png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Clean up Blob URL
      })
      .catch((error) => console.error("Download failed:", error));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Object Replace</h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file (File Size Limit: 10MB , Allowed File Types: JPEG, PNG )</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <div className="flex flex-col md:flex-row gap-8">
              <label className="form-control w-full md:w-1/2 mt-4">
                <div className="label">
                  <span className="label-text">From</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter prompt to see result"
                  onChange={(e) => { setIsGenerating(true); setFrom(e.target.value) }}
                  className="input input-bordered w-full"
                />
              </label>
              <label className="form-control w-full md:w-1/2 mt-4">
                <div className="label">
                  <span className="label-text">To</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter prompt to see result"
                  onChange={(e) => { setIsGenerating(true); setTo(e.target.value) }}
                  className="input input-bordered w-full"
                />
              </label>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <div className="flex flex-col md:flex-row">
                <div className="mt-6 relative md:mr-2 w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                  <div className="flex justify-center">
                    {isTransforming && (
                      <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    )}
                    <CldImage
                      width={uploadedImage.width}
                      height={uploadedImage.height}
                      src={uploadedImage.public_id}
                      sizes="100vw"
                      alt="transformed image"
                      crop="fill"
                      aspectRatio="1:1"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsTransforming(false)}
                    />
                  </div>
                </div>

                <div className="mt-6 relative md:ml-2 w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Result:</h3>
                  <div className="flex justify-center">
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    )}
                    <CldImage
                      width={uploadedImage.width}
                      height={uploadedImage.height}
                      src={uploadedImage.public_id}
                      sizes="100vw"
                      alt="transformed image"
                      crop="fill"
                      aspectRatio="1:1"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsGenerating(false)}
                      replace={{
                        from: from,
                        to: to,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BgRemove;
