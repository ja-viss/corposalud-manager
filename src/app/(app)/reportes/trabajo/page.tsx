
import { getWorkReports } from '@/app/actions';
import { WorkReportList } from '@/app/(app)/reportes/trabajo/_components/work-report-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ClipboardPlus } from 'lucide-react';

export default async function WorkReportsPage() {
  const reportsResult = await getWorkReports();
  const initialReports = reportsResult.success ? reportsResult.data || [] : [];

  return (
    <div className="space-y-8 py-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="md:hidden" asChild>
                <Link href="/reportes">
                    <ArrowLeft />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Historial de Reportes de Trabajo</h1>
                <p className="text-muted-foreground">Consulta y exporta los reportes de actividad de las cuadrillas.</p>
            </div>
        </div>
        <Button size="sm" className="gap-1" asChild>
            <Link href="/reportes">
                <ClipboardPlus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Gestionar Reportes
                </span>
            </Link>
        </Button>
      </div>

      <WorkReportList initialReports={initialReports} />
    </div>
  );
}
