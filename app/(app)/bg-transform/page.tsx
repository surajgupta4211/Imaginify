"use client";

import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { ImageData } from "@/types";
import { RefreshCcw } from "lucide-react";

const BgRemove = () => {
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
      setIsGenerating(true);
    }
  }, [uploadedImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorMessage(null); // Clear previous error

    if (!file) return;

    // ✅ Validate type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("❌ Only JPEG and PNG files are allowed.");
      return;
    }

    // ✅ Validate size
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setErrorMessage("File size too large. Max allowed size is 10MB.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setErrorMessage("❌ Upload failed.");
        return;
      }

      const data = await res.json();
      setUploadedImage(data.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("❌ Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const seedRandomizer = () => {
    setIsGenerating(true);
    const num = (seed + 1 + Math.floor(Math.random() * 10)) % 10;
    setSeed(num);
  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${prompt ? `${prompt}.png` : "original.png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Image BackGround Transform
      </h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <label className="form-control w-full mt-4">
              <div className="label">
                <span className="label-text">Enter your Prompt</span>
              </div>
              <input
                type="text"
                placeholder="e.g. beach, sunset, etc."
                onChange={(e) => {
                  setIsGenerating(true);
                  setPrompt(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <div className="flex flex-col md:flex-row">
                {/* Preview */}
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
                      alt="Original image"
                      crop="fill"
                      aspectRatio="1:1"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsTransforming(false)}
                    />
                  </div>
                </div>

                {/* Transformed */}
                <div className="mt-6 relative md:ml-2 w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Transformed:</h3>
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
                      alt="Transformed image"
                      crop="fill"
                      aspectRatio="1:1"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsGenerating(false)}
                      replaceBackground={{ prompt, seed }}
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={seedRandomizer}>
                  <RefreshCcw />
                </button>
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
