
import { CrewForm } from '../_components/crew-form';
import { FormHeader } from '../../_components/form-header';

export default function NuevaCuadrillaPage() {
  return (
    <div>
      <FormHeader
        title="Crear Nueva Cuadrilla"
        description="Describa la actividad y seleccione los miembros. El nombre se asignará automáticamente."
        backHref="/personal/cuadrillas"
      />
      <CrewForm />
    </div>
  );
}
