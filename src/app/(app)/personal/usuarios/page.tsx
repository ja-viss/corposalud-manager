

import { getUsers, getUserById } from "@/app/actions";
import { UserList } from "./_components/user-list";
import { cookies } from "next/headers";
import type { User } from '@/lib/types';
import { redirect } from "next/navigation";
import { PersonalClientLayout } from "../_components/personal-client-layout";


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
    <PersonalClientLayout showUserTab={currentUser.role === 'Admin'}>
        <UserList initialUsers={initialUsers} canManageUsers={currentUser.role === 'Admin'} />
    </PersonalClientLayout>
    );
}


    
