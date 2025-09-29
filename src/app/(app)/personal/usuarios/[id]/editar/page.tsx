
import { getUserById } from "@/app/actions";
import { UserForm } from "../../_components/user-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/lib/types";

async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const userId = cookieStore.get('session-id')?.value;
    if (!userId) return null;
    const userResult = await getUserById(userId);
    return userResult.success ? userResult.data : null;
}

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [userResult, currentUser] = await Promise.all([
      getUserById(id),
      getCurrentUser()
  ]);

  if (!currentUser) {
    redirect('/login');
  }

  if (!userResult.success || !userResult.data) {
    return <div>Usuario no encontrado</div>;
  }
  
  // Security check: Moderators can only edit Obreros
  if (currentUser.role === 'Moderador' && userResult.data.role !== 'Obrero') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-2xl font-bold">Acceso Denegado</h1>
              <p className="text-muted-foreground">No tiene permiso para editar este usuario.</p>
          </div>
      );
  }

  return (
     <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
        <p className="text-muted-foreground">Actualice la información del usuario.</p>
      </div>
      <UserForm user={userResult.data} currentUserRole={currentUser.role} />
    </div>
  );
}
