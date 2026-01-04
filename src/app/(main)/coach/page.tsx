import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfileFromDB } from "@/app/actions";
import { AICoach } from '@/modules/coach';

export default async function CoachPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/api/auth/signin');

    const profile = await getUserProfileFromDB();

    return (
        <div className="p-8 h-[calc(100vh-2rem)]">
            <AICoach profile={profile} />
        </div>
    );
}
