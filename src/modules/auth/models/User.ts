import mongoose, { Schema, Model } from 'mongoose';
import type { UserProfile } from '@/types';

// Interface for User document
export interface IUser {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'user' | 'admin';
    provider?: 'credentials' | 'google' | 'github';

    // Application specific data
    onboardingComplete: boolean;
    profile?: UserProfile;

    createdAt: Date;
    updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        image: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        provider: { type: String, default: 'credentials' },

        onboardingComplete: { type: Boolean, default: false },
        profile: { type: Schema.Types.Mixed }, // Store the complex profile object
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
