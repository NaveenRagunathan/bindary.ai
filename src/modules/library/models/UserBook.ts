import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserBook extends Document {
    userId: string;
    title: string;
    author: string;
    description?: string;
    coverUrl?: string;
    categories: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    pageCount: number;
    estimatedHours: number;
    publishedYear?: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserBookSchema = new Schema<IUserBook>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            trim: true,
        },
        description: {
            type: String,
            default: 'Manually added book',
        },
        coverUrl: {
            type: String,
        },
        categories: {
            type: [String],
            default: ['Uncategorized'],
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate',
        },
        pageCount: {
            type: Number,
            required: [true, 'Page count is required'],
            min: [1, 'Page count must be at least 1'],
        },
        estimatedHours: {
            type: Number,
        },
        publishedYear: {
            type: Number,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Pre-save hook to calculate estimated hours if not provided
UserBookSchema.pre('save', function (next) {
    if (!this.estimatedHours && this.pageCount) {
        // Approx 20 pages per hour reading speed
        this.estimatedHours = Math.ceil(this.pageCount / 20);
    }
    next();
});

// Check if model exists to prevent overwrite during hot reload
const UserBook: Model<IUserBook> =
    mongoose.models.UserBook || mongoose.model<IUserBook>('UserBook', UserBookSchema);

export default UserBook;
