import { Sidebar } from "@/components/layout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            {/* Main Content Wrapper */}
            {/* Added left margin to account for fixed sidebar */}
            <main className="pl-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
