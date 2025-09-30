
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { PopulatedWorkReport, ToolEntry } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown, QrCode, HardHat, MapPin, Calendar, Wrench, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QRCode from "react-qr-code";
import { Badge } from "@/components/ui/badge";

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

const formatToolsForQR = (title: string, tools: ToolEntry[] | undefined) => {
    if (!tools || tools.filter(t => t.cantidad > 0).length === 0) return '';
    const header = `--- ${title.toUpperCase()} ---\n`;
    const toolLines = tools
        .filter(t => t.cantidad > 0)
        .map(t => `${t.nombre}: ${t.cantidad}`)
        .join('\n');
    return `${header}${toolLines}\n\n`;
}

const generateReportQRString = (report: PopulatedWorkReport | null): string => {
    if (!report) return "Información no disponible.";

    const crew = report.crewId;
    const moderators = crew ? crew.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(', ') : 'N/A';
    const workers = crew ? crew.obreros.map(o => `${o.nombre} ${o.apellido}`).join(', ') : 'N/A';

    return `
=== REPORTE DE TRABAJO ===
Fecha: ${format(new Date(report.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
Cuadrilla: ${crew?.nombre ?? 'N/A'}
Actividad: ${crew?.descripcion ?? 'N/A'}

=== DETALLES DE LA JORNADA ===
Municipio: ${report.municipio}
Distancia (m): ${report.distancia}
Comentarios: ${report.comentarios}

${formatToolsForQR('Herramientas Utilizadas', report.herramientasUtilizadas)}
${formatToolsForQR('Herramientas Dañadas', report.herramientasDanadas)}
${formatToolsForQR('Herramientas Extraviadas', report.herramientasExtraviadas)}
=== PERSONAL ASIGNADO ===
--- Moderadores ---
${moderators}

--- Obreros ---
${workers}
    `.trim().replace(/(\n\s*\n)+/g, '\n\n'); 
};

function ToolsTable({ title, tools, variant }: { title: string, tools?: ToolEntry[], variant?: "default" | "secondary" | "destructive" | "outline" | null }) {
    const filteredTools = tools?.filter(tool => tool.cantidad > 0);

    if (!filteredTools || filteredTools.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">{title}</h4>
                <Badge variant={variant ?? "secondary"}>{filteredTools.length}</Badge>
            </div>
            <div className="border rounded-md">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Herramienta</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTools.map((tool, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{tool.nombre}</TableCell>
                                <TableCell className="text-right">{tool.cantidad}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}


export function WorkReportsList({ reports }: WorkReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<PopulatedWorkReport | null>(null);

  const handleOpenQRModal = (report: PopulatedWorkReport) => {
    setSelectedReport(report);
  };
  
  const handleCloseQRModal = () => {
    setSelectedReport(null);
  }

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
            <Accordion type="single" collapsible className="w-full space-y-4">
            {reports.map((report) => (
                <AccordionItem value={report.id} key={report.id} className="border bg-card rounded-lg shadow-sm">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-2 sm:gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <HardHat className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">{report.crewId?.nombre ?? 'N/A'}</h3>
                                    <p className="text-sm text-muted-foreground">{report.municipio}</p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 pl-11 sm:pl-0">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(report.fecha), "dd MMM yyyy", { locale: es })}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                       <div className="space-y-6">
                           {/* Job Details */}
                           <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                   <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                   <h4 className="font-semibold text-sm">Detalles de la Actividad</h4>
                               </div>
                                <p className="text-sm text-muted-foreground pl-6 border-l-2 ml-2">
                                    <span className="font-medium text-foreground">Distancia: {report.distancia}m.</span><br/>
                                    {report.comentarios}
                                </p>
                           </div>

                            {/* Tools Tables */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <ToolsTable title="Utilizadas" tools={report.herramientasUtilizadas} variant="secondary" />
                                <ToolsTable title="Dañadas" tools={report.herramientasDanadas} variant="destructive"/>
                                <ToolsTable title="Extraviadas" tools={report.herramientasExtraviadas} variant="outline" />
                            </div>

                           {/* QR Code Button */}
                           <div className="flex justify-end pt-4">
                               <Button variant="outline" size="sm" onClick={() => handleOpenQRModal(report)}>
                                   <QrCode className="mr-2 h-4 w-4" />
                                   Ver QR de Reporte Completo
                               </Button>
                           </div>
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        )}
        
        {/* QR Code Modal */}
        <Dialog open={!!selectedReport} onOpenChange={(isOpen) => !isOpen && handleCloseQRModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reporte: {selectedReport?.crewId?.nombre}</DialogTitle>
                    <DialogDescription>Escanee el código para ver todos los detalles del reporte.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-white rounded-lg my-4">
                   <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={generateReportQRString(selectedReport)}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

