

import { getUsers, getUserById } from "@/app/actions";
import { UserList } from "./_components/user-list";
import { cookies } from "next/headers";
import type { User } from '@/lib/types';
import { redirect } from "next/navigation";


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


export default async function UsuariosPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
      redirect('/dashboard');
  }

  const usersResult = await getUsers();
  
  // The getUsers action already filters out the current user.
  const initialUsers = usersResult.success ? usersResult.data || [] : [];
  
  return (
    <div className="space-y-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Usuarios
        </h1>
        <UserList initialUsers={initialUsers} canManageUsers={currentUser.role === 'Admin' || currentUser.role === 'Moderador'} />
    </div>
    );
}


    
