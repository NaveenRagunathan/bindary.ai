
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import User from "@/modules/auth/models/User";

// Input validation schema
const registerSchema = z.object({
    email: z
        .string()
        .email("Invalid email format")
        .max(255, "Email too long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    name: z
        .string()
        .max(100, "Name too long")
        .optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        const { email, password, name } = validationResult.data;

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password with strong salt rounds
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with sanitized email
        await User.create({
            email: email.toLowerCase().trim(),
            name: name?.trim() || email.split("@")[0],
            password: hashedPassword,
            onboardingComplete: false,
        });

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input data", errors: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "An error occurred while registering the user" },
            { status: 500 }
        );
    }
}
