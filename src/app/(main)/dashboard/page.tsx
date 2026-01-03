import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/features/auth/models/User";
import DashboardLogic from "../../../features/dashboard/DashboardLogic";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/api/auth/signin');

    await dbConnect();
    const user = await User.findOne({ email: session.user?.email }).lean();

    // We pass the profile to the client component.
    // If profile has goals, we show Dashboard.
    // If not, we SHOULD show onboarding. 

    // Ideally Onboarding is a separate route /onboarding to exclude the layout.
    // But for now, let's keep the logic simple.

    return (
        <DashboardLogic
            initialProfile={user?.profile || null}
            userName={session.user?.name || 'Reader'}
        />
    );
}


