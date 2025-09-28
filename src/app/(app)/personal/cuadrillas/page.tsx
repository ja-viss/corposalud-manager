
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
    const showCreateButton = user.role === 'Admin' || user.role === 'Moderador';

    return (
        <CrewList 
            initialCrews={initialCrews}
            canManageCrews={canManageCrews}
            showCreateButton={showCreateButton}
        />
    );
}
