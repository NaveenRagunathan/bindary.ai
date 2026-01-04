import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfileFromDB } from "@/app/actions";
import DashboardContainer from "@/modules/dashboard/components/DashboardContainer";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/api/auth/signin');

    const profile = await getUserProfileFromDB();

    return (
        <DashboardContainer
            initialProfile={profile}
            userName={session.user?.name || 'Reader'}
        />
    );
}



