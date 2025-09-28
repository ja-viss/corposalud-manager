
import { getUserById } from "@/app/actions";
import { UserForm } from "../_components/user-form";

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const userResult = await getUserById(id);

  if (!userResult.success || !userResult.data) {
    return <div>Usuario no encontrado</div>;
  }

  return (
     <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
        <p className="text-muted-foreground">Actualice la información del usuario.</p>
      </div>
      <UserForm user={userResult.data} />
    </div>
  );
}
