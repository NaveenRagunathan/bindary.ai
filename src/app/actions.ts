'use server';

import dbConnect from "@/lib/mongodb";
import User from "@/modules/auth/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserProfile } from "@/types";
import { revalidatePath } from "next/cache";

export async function saveUserProfile(profile: UserProfile) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    await User.findOneAndUpdate(
        { email: session.user.email },
        {
            $set: {
                profile: profile,
                onboardingComplete: true,
                name: profile.name
            }
        },
        { upsert: true, new: true }
    );

    revalidatePath('/');
    return { success: true };
}

/**
 * Fetch user profile from MongoDB.
 * This is the ONLY way to get user profile from DB.
 * Components should receive profile via props, not call this directly.
 */
export async function getUserProfileFromDB(): Promise<UserProfile | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).lean();

    return (user?.profile as UserProfile) || null;
}

