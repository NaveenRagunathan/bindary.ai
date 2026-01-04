import { NavDock } from "@/layout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Skip Link for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-medium"
            >
                Skip to main content
            </a>

            {/* Spatial Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="ambient-glow bg-primary/20 top-[-20%] left-[-20%]" />
                <div className="ambient-glow bg-accent/20 bottom-[-20%] right-[-20%]" style={{ animationDelay: '-10s' }} />
            </div>

            {/* Main Content Wrapper */}
            <main
                id="main-content"
                className="w-full max-w-7xl mx-auto px-6 pb-32 pt-8 min-h-screen relative z-10"
            >
                {children}
            </main>

            <NavDock />
        </div>
    );
}
