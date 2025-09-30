
import { getUserById, getUserCrews } from "@/app/actions";
import { UserForm } from "../../_components/user-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User, Crew } from "@/lib/types";
import { FormHeader } from "../../../_components/form-header";

async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const userId = cookieStore.get('session-id')?.value;
    if (!userId) return null;
    const userResult = await getUserById(userId);
    return userResult.success ? userResult.data : null;
}

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [userResult, currentUser, crewsResult] = await Promise.all([
      getUserById(id),
      getCurrentUser(),
      getUserCrews(id)
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

  const userCrews = crewsResult.success ? crewsResult.data : [];

  return (
     <div>
      <FormHeader
        title="Editar Usuario"
        description="Actualice la información del usuario."
        backHref="/personal/usuarios"
      />
      <UserForm 
        user={userResult.data} 
        currentUserRole={currentUser.role}
        crews={userCrews ?? []}
      />
    </div>
  );
}
