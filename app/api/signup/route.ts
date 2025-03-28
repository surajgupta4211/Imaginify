import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface Data {
  username: string;
  email: string;
  password: string;
}

prisma.$connect();

export async function POST(request: NextRequest) {
  try {
    const { username, email, password }: Data = await request.json();

    // Check if the email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        {
          status: 400,
        }
      );
    }

    // Check if the username already exists in the database
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        videos: {},
        images: [],
        videoIds: [],
      },
      include: {
        videos: true,
      },
    });

    if (!newUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User creation failed",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
