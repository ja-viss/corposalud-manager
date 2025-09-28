
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/app/actions";
import type { User } from '@/lib/types';
import { PerfilClientPage } from "./_components/perfil-client-page";

async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const userId = cookieStore.get('session-id')?.value;

    if (!userId) {
        return null;
    }

    const userResult = await getUserById(userId);
    if (userResult.success && userResult.data) {
        return userResult.data;
    }

    return null;
}

export default async function PerfilPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return <PerfilClientPage user={user} />;
}
