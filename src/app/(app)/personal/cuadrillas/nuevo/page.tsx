
import { CrewForm } from '../_components/crew-form';

export default function NuevaCuadrillaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Cuadrilla</h1>
        <p className="text-muted-foreground">Describa la actividad y seleccione los miembros. El nombre se asignará automáticamente.</p>
      </div>
      <CrewForm />
    </div>
  );
}

    