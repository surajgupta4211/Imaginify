"use client";
import React, { useState } from "react";

// Transformation Options
const transformationsList = [
    { label: "Grayscale", value: [{ effect: "grayscale" }] },
    { label: "Sepia", value: [{ effect: "sepia" }] },
    { label: "Brightness", value: [{ effect: "brightness", value: 50 }] },
    { label: "Contrast", value: [{ effect: "contrast", value: 50 }] },
    { label: "Saturation", value: [{ effect: "saturation", value: 50 }] },
    { label: "Vignette", value: [{ effect: "vignette", value: 50 }] }
];

export default function ImageTransformationPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTransformation, setSelectedTransformation] = useState(transformationsList[0].value);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            // ✅ Validate file type (Only allow JPEG & PNG)
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                setErrorMessage("Invalid file format! Only JPEG and PNG are allowed.");
                setSelectedFile(null);
                return;
            }

            // ✅ Validate file size (Max 10MB)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
            if (file.size > MAX_FILE_SIZE) {
                setErrorMessage("File size too large! Maximum allowed size is 10MB.");
                setSelectedFile(null);
                return;
            }

            setErrorMessage(null);
            setSelectedFile(file);
        }
    };

    const handleTransform = async () => {
        if (!selectedFile) {
            alert("Please select an image before transforming.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("transformations", JSON.stringify(selectedTransformation));

        try {
            const response = await fetch("/api/image-transformation", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.error) {
                setErrorMessage(data.error);
                setLoading(false);
                return;
            }

            if (data.transformedUrl) {
                setOriginalUrl(data.originalUrl);
                setTransformedUrl(data.transformedUrl);
            } else {
                alert("Transformation failed.");
            }
        } catch (error) {
            console.error("Failed to transform image", error);
        }

        setLoading(false);
    };

    const handleDownload = () => {
        if (!transformedUrl) {
            alert("No transformed image available for download.");
            return;
        }

        fetch(transformedUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "transformed_image.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Cloudinary Image Transformation</h1>

            <div className="card bg-base-200 shadow-lg p-6">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <h3 className="label-text">(File Size Limit: 10MB , Allowed File Types: JPEG, PNG )</h3>
                    <input
                        type="file"
                        className="file-input file-input-bordered w-full mb-4"
                        onChange={handleFileChange}
                    />

                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                    {/* Transformation Selection Dropdown */}
                    <select
                        className="select select-bordered w-full mb-4"
                        onChange={(e) => {
                            const selected = transformationsList.find((t) => t.label === e.target.value);
                            if (selected) setSelectedTransformation(selected.value);
                        }}
                    >
                        {transformationsList.map((t) => (
                            <option key={t.label} value={t.label}>
                                {t.label}
                            </option>
                        ))}
                    </select>

                    <button className="btn btn-primary w-full" onClick={handleTransform}>
                        {loading ? "Processing..." : "Transform Image"}
                    </button>

                    {/* Show Images Horizontally */}
                    {originalUrl && transformedUrl && (
                        <div className="flex justify-center items-start mt-6 space-x-6">
                            {/* Original Image */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Original</h3>
                                <img src={originalUrl} alt="Original Image" className="w-64 h-64 rounded-lg shadow-lg" />
                            </div>

                            {/* Transformed Image */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Transformed</h3>
                                <img src={transformedUrl} alt="Transformed Image" className="w-64 h-64 rounded-lg shadow-lg" />

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
                </div>
            </div>
        </div>
    );
}
