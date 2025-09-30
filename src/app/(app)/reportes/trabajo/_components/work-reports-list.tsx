"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PopulatedWorkReport } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown, HardHat, Eye, Calendar, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface WorkReportsListProps {
  reports: PopulatedWorkReport[];
}

// HSL to RGB conversion function for PDF header styling
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function WorkReportsList({ reports }: WorkReportsListProps) {
    const [isClient, setIsClient] = useState(false);
    
    useState(() => {
        setIsClient(true);
    });

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173; 
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    doc.text("Historial de Reportes de Trabajo", 14, 15);
    
    const body = reports.map(report => [
        report.crewId?.nombre ?? 'N/A',
        report.municipio,
        report.distancia,
        format(new Date(report.fecha), "dd/MM/yyyy"),
        report.comentarios
    ]);

    doc.autoTable({
      startY: 20,
      head: [['Cuadrilla', 'Municipio', 'Distancia (m)', 'Fecha', 'Comentarios']],
      body: body,
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: {
        cellPadding: 3,
        fontSize: 8,
        valign: 'middle',
        overflow: 'linebreak',
        halign: 'left',
      },
      columnStyles: {
          4: { cellWidth: 60 } // Comments column
      }
    });
    doc.save('historial-reportes-trabajo.pdf');
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Historial de Reportes de Trabajo</h1>
                <p className="text-muted-foreground">Consulta todos los reportes de actividad generados.</p>
            </div>
            <Button size="sm" className="gap-1" onClick={handleExportPDF} disabled={reports.length === 0}>
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar a PDF
                </span>
            </Button>
        </div>

        {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-dashed border-2 rounded-lg p-12">
                <HardHat className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No hay reportes de trabajo</h3>
                <p>Cuando se cree un reporte, aparecerá aquí.</p>
            </div>
        ) : (
            <>
                {/* Desktop Table View */}
                <Card className="hidden md:block">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cuadrilla</TableHead>
                                    <TableHead>Municipio</TableHead>
                                    <TableHead>Distancia (m)</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">{report.crewId?.nombre ?? 'N/A'}</TableCell>
                                        <TableCell>{report.municipio}</TableCell>
                                        <TableCell>{report.distancia}</TableCell>
                                        <TableCell>{isClient ? format(new Date(report.fecha), "dd MMM yyyy", { locale: es }) : '...'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/reportes/trabajo/${report.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver Detalles
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Mobile Card View */}
                <div className="grid gap-4 md:hidden">
                    {reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{report.crewId?.nombre ?? 'N/A'}</CardTitle>
                                </div>
                                 <CardDescription className="flex items-center gap-2 pt-1">
                                    <MapPin className="h-4 w-4" /> {report.municipio}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Fecha:</span>
                                    <span>{isClient ? format(new Date(report.fecha), "dd/MM/yyyy") : '...'}</span>
                                </div>
                                <div className="pt-2">
                                     <Button className="w-full" asChild>
                                        <Link href={`/reportes/trabajo/${report.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Reporte Completo
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </>
        )}
    </div>
  );
}

    