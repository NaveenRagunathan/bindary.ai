import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserBook from '@/modules/library/models/UserBook';
import { Book } from '@/types';

export const dynamic = 'force-dynamic';

// GET: Fetch all books for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const userBooks = await UserBook.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean();

        // Transform _id to id to match Book interface
        const books: Book[] = userBooks.map((doc: any) => ({
            ...doc,
            id: doc._id.toString(),
            keyTopics: [], // Defaults for interface compatibility
            targetAudience: [],
            prerequisites: []
        }));

        return NextResponse.json(books);
    } catch (error) {
        console.error('Failed to fetch user books:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST: Create a new book for the authenticated user
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Basic validation
        if (!body.title || !body.author || !body.pageCount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        const newBook = await UserBook.create({
            userId: session.user.id,
            title: body.title,
            author: body.author,
            pageCount: body.pageCount,
            difficulty: body.difficulty || 'intermediate',
            categories: body.categories || ['Uncategorized'],
            description: body.description || 'Manually added book',
            publishedYear: new Date().getFullYear(),
        });

        // Convert to application Book interface
        const bookObj = newBook.toObject();
        const responseBook: Book = {
            ...bookObj,
            id: newBook._id.toString(),
            description: bookObj.description || 'Manually added book',
            publishedYear: bookObj.publishedYear || new Date().getFullYear(),
            estimatedHours: bookObj.estimatedHours || 0,
            keyTopics: [],
            targetAudience: [],
                                    prerequisites: []
    };

    return NextResponse.json(responseBook, { status: 201 });
} catch (error) {
    console.error('Failed to create user book:', error);
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
}
}
