
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserById } from '@/app/actions';
import type { User } from '@/lib/types';
import { PersonalClientLayout } from './_components/personal-client-layout';

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

    return (
        <div className="space-y-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">
                {canManagePersonal ? 'Gestión de Personal' : 'Mis Cuadrillas'}
            </h1>
            
            <PersonalClientLayout showUserTab={user.role === 'Admin'}>
                {children}
            </PersonalClientLayout>
        </div>
    )
}
