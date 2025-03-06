import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({
                success: false,
                message: "Credentials required"
            }, { status: 400 });
        }

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Compare password
        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
            return NextResponse.json({
                success: false,
                message: "Incorrect Credentials"
            }, { status: 401 }); // Changed to 401
        }

        // Generate JWT token
        if (!process.env.TOKEN_SECRET) {
            throw new Error("Missing TOKEN_SECRET in environment variables.");
        }

        const tokenData = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: '1d' });

        const response = NextResponse.json({
            success: true,
            message: "Logged in successfully",
            data: tokenData.username
        }, { status: 200 });

        // Secure cookie settings
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "strict",
            path: "/"
        });

        return response;

    } catch (error: any) {
        console.error("Sign-in Error:", error); // Logs error for debugging

        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}
