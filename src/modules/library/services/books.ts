import type { Book } from '@/types';
import booksData from '../data/books.json';
export async function getAllBooks(): Promise<Book[]> {
    const staticBooks = booksData as Book[];

    // Fetch user books from API
    try {
        const res = await fetch('/api/books', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (res.ok) {
            const userBooks = await res.json();
            return [...staticBooks, ...userBooks];
        }
    } catch (error) {
        console.error('Failed to fetch user books:', error);
    }

    return staticBooks;
}

// Get book by ID
export async function getBookById(id: string): Promise<Book | null> {
    const books = await getAllBooks();
    return books.find((b) => b.id === id) || null;
}

// Search books by query (local)
export async function searchBooks(query: string): Promise<Book[]> {
    const books = await getAllBooks();
    const lowerQuery = query.toLowerCase();

    return books.filter(
        (book) =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.categories.some((c) => c.toLowerCase().includes(lowerQuery)) ||
            book.keyTopics.some((t) => t.toLowerCase().includes(lowerQuery))
    );
}

// Filter books by category
export async function getBooksByCategory(category: string): Promise<Book[]> {
    const books = await getAllBooks();
    return books.filter((book) =>
        book.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
    const books = await getAllBooks();
    const categories = new Set<string>();

    books.forEach((book) => {
        book.categories.forEach((c) => categories.add(c));
    });

    return Array.from(categories).sort();
}

// Get books by difficulty
export async function getBooksByDifficulty(difficulty: Book['difficulty']): Promise<Book[]> {
    const books = await getAllBooks();
    return books.filter((book) => book.difficulty === difficulty);
}

// Calculate estimated reading time based on user's speed
export function calculateReadingTime(
    book: Book,
    readingSpeed: 'slow' | 'average' | 'fast'
): { hours: number; days: number } {
    const speedMultiplier = {
        slow: 1.5,
        average: 1,
        fast: 0.7,
    };

    const adjustedHours = book.estimatedHours * speedMultiplier[readingSpeed];
    const days = Math.ceil(adjustedHours / 0.5); // Assuming 30 min/day average

    return {
        hours: Math.round(adjustedHours * 10) / 10,
        days,
    };
}

// Search external books via Open Library API (client-safe function)
export async function searchExternalBooks(
    query: string,
    options?: { category?: string; limit?: number }
): Promise<{ books: Book[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (options?.category) params.set('category', options.category);
    if (options?.limit) params.set('limit', options.limit.toString());

    const response = await fetch(`/api/books/search?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to search books');
    }

    return response.json();
}

// Combined search: local + external
export async function searchAllBooks(
    query: string,
    options?: { includeExternal?: boolean; limit?: number }
): Promise<Book[]> {
    const localResults = await searchBooks(query);

    if (!options?.includeExternal) {
        return localResults;
    }

    try {
        const externalResults = await searchExternalBooks(query, { limit: options.limit || 10 });
        // Combine, prioritizing local results
        return [...localResults, ...externalResults.books];
    } catch {
        // If external search fails, just return local results
        return localResults;
    }
}

