import { getWorkReportById } from "@/app/actions";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReportDetails } from "./_components/report-details";

export default async function ReporteDetallePage({ params }: { params: { id: string } }) {
  if (!params.id) {
    redirect("/reportes/trabajo");
  }

  const reportResult = await getWorkReportById(params.id);

  if (!reportResult.success || !reportResult.data) {
    return notFound();
  }

  return (
    <div className="space-y-8 py-8">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/reportes/trabajo">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Volver a la lista</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Detalles del Reporte de Trabajo
                </h1>
                <p className="text-muted-foreground">
                    Información completa de la actividad realizada.
                </p>
            </div>
        </div>
      <ReportDetails report={reportResult.data} />
    </div>
  );
}

    