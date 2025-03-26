import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getDataFromToken } from '@/helper/getDataFromToken';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect(); // ✅ Move here

    const token = await getDataFromToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const allowedTypes = ["video/mp4", "video/avi"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only .mp4 and .avi formats allowed" }, { status: 400 });
    }

    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 60MB" }, { status: 400 });
    }

    if (title.length > 250) {
        return NextResponse.json({ error: "Title must be 250 characters or less" }, { status: 400 });
      }      

    if (description.length > 1000) {
      return NextResponse.json({ error: "Description must be <= 1000 characters" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "video_uploads",
          resource_type: "video",
          transformation: [{ quality: "auto", fetch_format: "mp4" }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(buffer);
    });

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
        user: { connect: { id: token } },
      },
    });

    await prisma.user.update({
      where: { id: token },
      data: { videoIds: { push: video.id } }
    });

    return NextResponse.json({ success: true, video }, { status: 200 });

  } catch (error: any) {
    console.error("Video upload failed:", error.message);
    return NextResponse.json({ success: false, error: "Video upload failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // ✅ Safe disconnect
  }
}
