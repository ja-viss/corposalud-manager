
import { UserForm } from '../_components/user-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/app/actions';
import type { User } from '@/lib/types';


async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const userId = cookieStore.get('session-id')?.value;
    if (!userId) return null;
    const userResult = await getUserById(userId);
    return userResult.success ? userResult.data : null;
}

export default async function NuevoUsuarioPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
      redirect('/login');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
        <p className="text-muted-foreground">Complete el formulario para agregar un nuevo usuario al sistema.</p>
      </div>
      <UserForm currentUserRole={currentUser.role}/>
    </div>
  );
}
