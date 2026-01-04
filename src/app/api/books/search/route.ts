import { NextRequest, NextResponse } from 'next/server';
import type { Book } from '@/types';

interface OpenLibraryWork {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    subject?: string[];
    number_of_pages_median?: number;
    ratings_average?: number;
}

interface OpenLibraryResponse {
    numFound: number;
    docs: OpenLibraryWork[];
}

function mapToBook(work: OpenLibraryWork, index: number): Book {
    const categories = work.subject?.slice(0, 3) || ['General'];
    const pageCount = work.number_of_pages_median || 250;
    const estimatedHours = Math.round(pageCount / 40); // ~40 pages per hour average

    // Determine difficulty based on page count
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (pageCount > 400) difficulty = 'advanced';
    else if (pageCount > 250) difficulty = 'intermediate';

    return {
        id: `ol-${work.key.replace('/works/', '')}`,
        title: work.title,
        author: work.author_name?.[0] || 'Unknown Author',
        description: `A book about ${categories.slice(0, 2).join(' and ').toLowerCase()}. Explore key concepts and gain new perspectives.`,
        coverUrl: work.cover_i
            ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg`
            : undefined,
        categories,
        difficulty,
        pageCount,
        estimatedHours,
        publishedYear: work.first_publish_year || 2000,
        keyTopics: categories.slice(0, 5),
        targetAudience: ['general readers', 'curious minds'],
        prerequisites: [],
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        if (!query && !category) {
            return NextResponse.json(
                { error: 'Query (q) or category required' },
                { status: 400 }
            );
        }

        let searchQuery = query || '';
        if (category) {
            searchQuery = `subject:${category} ${searchQuery}`.trim();
        }

        // Add self-help/personal development focus
        const fullQuery = `${searchQuery} subject:(self-help OR personal-development OR business OR psychology)`;

        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(fullQuery)}&limit=${limit}&language=eng`,
            {
                headers: {
                    'User-Agent': 'Bindery.ai/1.0 (educationalproject@example.com)',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Open Library API error: ${response.status}`);
        }

        const data: OpenLibraryResponse = await response.json();

        // Filter to books with covers and reasonable data
        const books = data.docs
            .filter((doc) => doc.cover_i && doc.author_name && doc.first_publish_year)
            .slice(0, limit)
            .map((doc, idx) => mapToBook(doc, idx));

        return NextResponse.json({
            total: data.numFound,
            books,
        });
    } catch (error) {
        console.error('Book search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search books' },
            { status: 500 }
        );
    }
}
