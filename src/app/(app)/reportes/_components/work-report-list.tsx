"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, FileDown, HardHat, MapPin, Calendar } from "lucide-react";
import type { PopulatedWorkReport } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    const reportId = report?.id?.slice(-6).toUpperCase() ?? 'N/A';
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
        doc.autoTable({
            startY: yPos,
            body: [
                ['Municipio', report.municipio],
                ['Distancia (m)', report.distancia.toString()],
                ['Comentarios', report.comentarios || 'Sin comentarios.'],
                ['Realizado por', report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'N/A'],
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportPDF = (report: PopulatedWorkReport) => {
    generateWorkReportPDF(report);
  };

  return (
    <>
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuadrilla</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Realizado Por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Cargando reportes...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron reportes de trabajo.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.crewId?.nombre || 'N/A'}</TableCell>
                    <TableCell>{report.municipio}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'N/A'}
                    </TableCell>
                    <TableCell>{isClient ? format(new Date(report.fecha), "dd/MM/yyyy") : '...'}</TableCell>
                    <TableCell>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:hidden">
         {loading ? (
            <p className="text-center text-muted-foreground">Cargando reportes...</p>
         ) : reports.length === 0 ? (
            <p className="text-center text-muted-foreground">No se encontraron reportes.</p>
         ) : (
            reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{report.crewId?.nombre || 'Reporte sin cuadrilla'}</CardTitle>
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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <CardDescription>
                          Realizado por: {report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{report.municipio}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{isClient ? format(new Date(report.fecha), "dd MMM, yyyy") : '...'}</span>
                        </div>
                    </CardContent>
                </Card>
            ))
         )}
      </div>
    </>
  );
}
