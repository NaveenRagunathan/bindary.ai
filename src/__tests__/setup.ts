import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch for API tests
vi.stubGlobal('fetch', vi.fn());

// Reset mocks between tests
beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
});
