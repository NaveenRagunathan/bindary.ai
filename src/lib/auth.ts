import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/modules/auth/models/User";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "hello@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                await dbConnect();

                // 1. Check if user exists
                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (user) {
                    // 2. Validate password
                    const isValid = await bcrypt.compare(credentials.password, user.password || "");
                    if (isValid) {
                        return { id: user._id.toString(), email: user.email, name: user.name, image: user.image };
                    }
                    return null; // Invalid password
                } else {
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin', // Custom signin page
    }
};
