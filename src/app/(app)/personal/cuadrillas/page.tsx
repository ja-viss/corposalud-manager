

import { getCrews, getUserById } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CrewList } from "./_components/crew-list";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getCurrentUser() {
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

    const canManageCrews = user.role === 'Admin' || user.role === 'Moderador';
    const result = await getCrews();
    const initialCrews = result.success && result.data ? result.data : [];

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {canManageCrews ? 'Gestione las cuadrillas de trabajo.' : 'Mis Cuadrillas'}
                    </h2>
                    <p className="text-muted-foreground">
                        {canManageCrews ? 'Cree y administre las cuadrillas.' : 'Estas son las cuadrillas en las que estás asignado.'}
                    </p>
                </div>
                {canManageCrews && (
                   <CrewList initialCrews={initialCrews} canManageCrews={canManageCrews} showCreateButton={true} />
                )}
            </div>
             {!canManageCrews && (
                 <CrewList initialCrews={initialCrews} canManageCrews={canManageCrews} showCreateButton={false} />
            )}
        </>
    );
}
