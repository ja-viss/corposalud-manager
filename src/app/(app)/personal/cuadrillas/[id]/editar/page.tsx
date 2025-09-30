
import { getCrewById } from "@/app/actions";
import { CrewForm } from "../../_components/crew-form";
import { notFound } from "next/navigation";
import { FormHeader } from "../../../_components/form-header";

export default async function EditarCuadrillaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const crewResult = await getCrewById(id);

  if (!crewResult.success || !crewResult.data) {
    return notFound();
  }

  return (
     <div>
      <FormHeader 
        title={`Editar ${crewResult.data.nombre}`}
        description="Actualice la información de la cuadrilla."
        backHref="/personal/cuadrillas"
      />
      <CrewForm crew={crewResult.data} />
    </div>
  );
}
