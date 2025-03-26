"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const MAX_FILE_SIZE = 60 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage("Please upload a video file.");
      return;
    }

    const allowedTypes = ["video/mp4", "video/avi"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only .mp4 and .avi formats are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size too large. Max allowed size is 60MB.");
      return;
    }

    if (title.length > 250) {
      setErrorMessage("Title must be 250 characters or fewer.");
      return;
    }

    if (description.length > 1000) {
      setErrorMessage("Description must be 1000 characters or fewer.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const res = await axios.post("/api/video-upload", formData);
      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            maxLength={250}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Video File (.mp4 or .avi)</span>
          </label>
          <input
            type="file"
            accept=".mp4,.avi"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
