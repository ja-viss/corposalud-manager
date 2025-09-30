
import { UserForm } from '../_components/user-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/app/actions';
import type { User } from '@/lib/types';
import { FormHeader } from '../../_components/form-header';


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
      <FormHeader
        title="Crear Nuevo Usuario"
        description="Complete el formulario para agregar un nuevo usuario al sistema."
        backHref="/personal/usuarios"
      />
      <UserForm currentUserRole={currentUser.role}/>
    </div>
  );
}
