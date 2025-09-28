
import { getCrewById } from "@/app/actions";
import { CrewForm } from "../../_components/crew-form";
import { notFound } from "next/navigation";

export default async function EditarCuadrillaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const crewResult = await getCrewById(id);

  if (!crewResult.success || !crewResult.data) {
    return notFound();
  }

  return (
     <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar {crewResult.data.nombre}</h1>
        <p className="text-muted-foreground">Actualice la información de la cuadrilla.</p>
      </div>
      <CrewForm crew={crewResult.data} />
    </div>
  );
}

    