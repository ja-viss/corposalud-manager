"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileDown, HardHat, MapPin, Calendar, Trash2 } from "lucide-react";
import type { PopulatedWorkReport } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteWorkReport } from "@/app/actions";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// HSL to RGB conversion function
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

const generateWorkReportPDF = (report: PopulatedWorkReport) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173;
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    const reportId = report?._id?.slice(-6).toUpperCase() ?? 'N/A';
    const reportDate = report?.fecha ? format(new Date(report.fecha), "dd/MM/yyyy", { locale: es }) : 'N/A';
    const crewName = report?.crewId?.nombre ?? 'Cuadrilla no especificada';

    // Header
    doc.setFontSize(18);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text("Reporte de Trabajo", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${crewName} - ${reportDate} (ID: ${reportId})`, 14, 29);

    // Body
    let yPos = 40;

    const addSection = (title: string, body: () => void) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        body();
        yPos += 10;
    };

    addSection("Información General", () => {
        const realizadoPorInfo = report.realizadoPor
            ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido} (${report.realizadoPor.role})`
            : 'N/A';

        doc.autoTable({
            startY: yPos,
            body: [
                ['Municipio', report.municipio],
                ['Distancia (m)', report.distancia.toString()],
                ['Comentarios', report.comentarios || 'Sin comentarios.'],
                ['Realizado por', realizadoPorInfo],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });
        yPos = (doc as any).lastAutoTable.finalY;
    });
    
    if (report.herramientasUtilizadas && report.herramientasUtilizadas.length > 0) {
        addSection("Herramientas", () => {
            const body = (report.herramientasUtilizadas ?? []).map(tool => {
                const damaged = report.herramientasDanadas?.find(d => d.nombre === tool.nombre)?.cantidad || 0;
                const lost = report.herramientasExtraviadas?.find(l => l.nombre === tool.nombre)?.cantidad || 0;
                return [tool.nombre, tool.cantidad, damaged, lost];
            });

            doc.autoTable({
                startY: yPos,
                head: [['Herramienta', 'Utilizadas', 'Dañadas', 'Extraviadas']],
                body: body,
                theme: 'striped',
                headStyles: { fillColor: headerColor },
            });
            yPos = (doc as any).lastAutoTable.finalY;
        });
    }

     if (report.crewId) {
        addSection("Miembros de la Cuadrilla", () => {
            const moderador = (report.crewId?.moderadores ?? []).map(m => `${m.nombre} ${m.apellido}`).join(', ');
            const obreros = (report.crewId?.obreros ?? []).map(o => `- ${o.nombre} ${o.apellido}`).join('\n');
            doc.setFontSize(9);
            doc.text(`Moderador: ${moderador}`, 14, yPos);
            yPos += 7;
            doc.text("Obreros:", 14, yPos);
            yPos += 5;
            doc.text(obreros, 14, yPos);
            yPos += (obreros.split('\n').length * 4);
        });
    }

    doc.save(`reporte-${crewName.replace(/\s/g, '_')}-${reportDate}.pdf`);
};

interface WorkReportListProps {
  initialReports: PopulatedWorkReport[];
}

export function WorkReportList({ initialReports = [] }: WorkReportListProps) {
  const [reports, setReports] = useState<PopulatedWorkReport[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PopulatedWorkReport | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setReports(initialReports);
  }, [initialReports]);

  const handleExportPDF = (report: PopulatedWorkReport) => {
    generateWorkReportPDF(report);
  };
  
  const handleDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteWorkReport(showDeleteConfirm._id);
      if (result.success) {
        toast({ title: "Éxito", description: result.message });
        setReports(prev => prev.filter(r => r._id !== showDeleteConfirm._id));
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setShowDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando reportes...</p>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <HardHat className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No se encontraron reportes</h3>
              <p className="text-muted-foreground">Parece que aún no se ha creado ningún reporte de trabajo.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report._id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HardHat className="h-5 w-5 text-primary" />
                      {report.crewId?.nombre || 'Reporte sin cuadrilla'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      ID del Reporte: {report._id?.slice(-6).toUpperCase() ?? 'N/A'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge variant="outline">{report.municipio}</Badge>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleExportPDF(report)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              Exportar a PDF
                            </DropdownMenuItem>
                             <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => setShowDeleteConfirm(report)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <div>
                          <span className="font-semibold text-foreground">Fecha:</span>
                          <p>{isClient ? format(new Date(report.fecha), "dd MMM, yyyy") : '...'}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2 md:col-span-1">
                      <MapPin className="h-4 w-4" />
                      <div>
                          <span className="font-semibold text-foreground">Distancia:</span>
                          <p>{report.distancia} metros</p>
                      </div>
                  </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y el reporte no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
