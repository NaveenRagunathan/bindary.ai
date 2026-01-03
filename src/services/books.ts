import type { Book } from '../types';
import booksData from '../data/books.json';

// Load books from JSON
export function getAllBooks(): Book[] {
    return booksData as Book[];
}

// Get book by ID
export function getBookById(id: string): Book | null {
    const books = getAllBooks();
    return books.find((b) => b.id === id) || null;
}

// Search books by query
export function searchBooks(query: string): Book[] {
    const books = getAllBooks();
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
export function getBooksByCategory(category: string): Book[] {
    const books = getAllBooks();
    return books.filter((book) =>
        book.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
}

// Get all unique categories
export function getAllCategories(): string[] {
    const books = getAllBooks();
    const categories = new Set<string>();

    books.forEach((book) => {
        book.categories.forEach((c) => categories.add(c));
    });

    return Array.from(categories).sort();
}

// Get books by difficulty
export function getBooksByDifficulty(difficulty: Book['difficulty']): Book[] {
    const books = getAllBooks();
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
