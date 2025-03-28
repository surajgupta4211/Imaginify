import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
prisma.$connect();

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json({
        success: false,
        message: "All credentials required",
      }, {
        status: 400,
      });
    }

    // ✅ Server-side password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,25}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        success: false,
        message: "Password must include uppercase, lowercase, numbers, and special characters",
      }, {
        status: 400,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Account not found",
      }, {
        status: 404,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: "Password not updated",
      }, {
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password successfully reset",
    }, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Unable to reset password. Try again later.",
    }, {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

