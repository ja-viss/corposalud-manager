
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/app/actions';
import type { User } from '@/lib/types';

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

export default async function PersonalLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const canManagePersonal = user.role === 'Admin' || user.role === 'Moderador';

    if (!canManagePersonal) {
        // If a user without permissions (like Obrero) tries to access, redirect them.
        redirect('/dashboard');
    }

    return <>{children}</>;
}
