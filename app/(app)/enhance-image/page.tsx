"use client";

import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { ImageData } from "@/types";

const EnhanceImage = () => {
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
    setErrorMessage(null);

    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("❌ Only JPEG and PNG files are allowed.");
      return;
    }

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

      if (!res.ok) throw new Error("Failed to upload image");

      const data = await res.json();
      setUploadedImage(data.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("❌ Upload failed. Try again.");
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
        link.download = "enhanced.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Image Enhancer</h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
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
                <div className="mt-6 relative mr-2 w-full md:w-1/2">
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

                {/* Enhanced */}
                <div className="mt-6 relative ml-2 w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Enhanced:</h3>
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
                      alt="Enhanced image"
                      crop="fill"
                      aspectRatio="1:1"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsGenerating(false)}
                      enhance
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

export default EnhanceImage;
