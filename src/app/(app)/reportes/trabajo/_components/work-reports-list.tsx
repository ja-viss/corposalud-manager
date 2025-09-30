
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PopulatedWorkReport } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown, Building, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface WorkReportsListProps {
  reports: PopulatedWorkReport[];
}

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    const primaryColorH = 173; 
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    doc.text("Historial de Reportes de Trabajo", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Cuadrilla', 'Municipio', 'Distancia (m)', 'Realizado por', 'Fecha']],
      body: reports.map(report => [
        report.crewId?.nombre ?? 'N/A',
        report.municipio,
        report.distancia,
        report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'Usuario Eliminado',
        format(new Date(report.fecha), "dd/MM/yyyy")
      ]),
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle',
        overflow: 'linebreak',
        halign: 'left',
      },
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

        {/* Desktop Table View */}
        <Card className="hidden md:block">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cuadrilla</TableHead>
                            <TableHead>Municipio</TableHead>
                            <TableHead>Distancia (m)</TableHead>
                            <TableHead>Realizado Por</TableHead>
                            <TableHead>Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                No hay reportes de trabajo registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.crewId?.nombre ?? 'N/A'}</TableCell>
                                    <TableCell>{report.municipio}</TableCell>
                                    <TableCell>{report.distancia}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'Usuario Eliminado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{isClient ? format(new Date(report.fecha), "dd/MM/yyyy") : '...'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="grid gap-4 md:hidden">
            {reports.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay reportes de trabajo registrados.</p>
            ) : (
                reports.map(report => (
                    <Card key={report.id}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold">{report.crewId?.nombre ?? 'N/A'}</h3>
                                <p className="text-sm text-muted-foreground">{report.municipio}</p>
                            </div>
                             <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>Distancia: {report.distancia}m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{report.realizadoPor ? `${report.realizadoPor.nombre} ${report.realizadoPor.apellido}` : 'Usuario Eliminado'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{isClient ? format(new Date(report.fecha), "dd/MM/yyyy") : '...'}</span>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    </div>
  );
}
