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

    // 1) Validate file type (Only allow JPEG & PNG)
    const validMimeTypes = ["image/jpeg", "image/png"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only JPEG and PNG are allowed." }, { status: 400 });
    }

    // 2) Validate file size (Max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size too large. Max size is 5MB." }, { status: 400 });
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
