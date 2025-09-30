
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getUserById, getCrews } from '@/app/actions';
import type { User } from '@/lib/types';
import { CrewList } from './_components/crew-list';

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


export default async function CuadrillasPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const initialCrewsResult = await getCrews();
    const initialCrews = initialCrewsResult.success ? initialCrewsResult.data || [] : [];
    
    const canManageCrews = user.role === 'Admin' || user.role === 'Moderador';

    return (
        <div className="space-y-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Gestión de Cuadrillas
            </h1>
            <CrewList 
                initialCrews={initialCrews}
                canManageCrews={canManageCrews}
            />
        </div>
    );
}
