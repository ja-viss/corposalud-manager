
import { UserForm } from '../_components/user-form';

export default function NuevoUsuarioPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
        <p className="text-muted-foreground">Complete el formulario para agregar un nuevo usuario al sistema.</p>
      </div>
      <UserForm />
    </div>
  );
}
