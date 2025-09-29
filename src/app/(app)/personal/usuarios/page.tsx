
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
  
  // Filter out the current user from the list
  const initialUsers = (usersResult.success && usersResult.data)
    ? usersResult.data.filter(user => user.id !== currentUser?.id)
    : [];
  
  return <UserList initialUsers={initialUsers} canManageUsers={currentUser.role === 'Admin' || currentUser.role === 'Moderador'} />;
}
