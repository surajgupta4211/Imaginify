import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalSize = file.size; // Get original file size
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with compression settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "compressed-images",
          quality: "auto:low", // Automatically compress the image
          fetch_format: "auto", // Converts to the best format
          width: 800, // Resize to reduce size while maintaining quality
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const { secure_url, bytes: compressedSize } = result as any; // Get compressed size

    return NextResponse.json({
      originalUrl: (result as any).secure_url,
      compressedUrl: secure_url,
      originalSize,
      compressedSize,
    });
  } catch (error) {
    console.error("Image compression failed", error);
    return NextResponse.json({ error: "Compression failed" }, { status: 500 });
  }
}