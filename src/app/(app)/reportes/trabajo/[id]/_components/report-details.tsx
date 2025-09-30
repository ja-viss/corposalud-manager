"use client";

import { useState } from "react";
import type { PopulatedWorkReport, ToolEntry, User } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from "react-qr-code";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, QrCode, Calendar, MapPin, Ruler, MessageSquare, Users, HardHat, Wrench, UserCheck } from "lucide-react";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface ReportDetailsProps {
    report: PopulatedWorkReport;
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


function ToolsTable({ title, tools, variant }: { title: string, tools?: ToolEntry[], variant?: "default" | "secondary" | "destructive" | "outline" | null }) {
    const filteredTools = tools?.filter(tool => tool.cantidad > 0);

    if (!filteredTools || filteredTools.length === 0) {
        return (
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">{title}</h4>
                </div>
                 <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
                    No se reportaron herramientas.
                </div>
            </div>
        );
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
                            <TableRow key={`tool-${title}-${index}`}>
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

function CrewMembersList({ title, members }: { title: string; members: Pick<User, 'nombre' | 'apellido'>[]}) {
    return (
        <div>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                {title === 'Moderadores' ? <UserCheck className="h-4 w-4 text-muted-foreground" /> : <HardHat className="h-4 w-4 text-muted-foreground" />}
                {title}
                <Badge variant="secondary">{members.length}</Badge>
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                {members.map((member, index) => (
                    <li key={`member-${title}-${index}`}>{member.nombre} {member.apellido}</li>
                ))}
            </ul>
        </div>
    )
}


export function ReportDetails({ report }: ReportDetailsProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
    
  useState(() => {
    setIsClient(true);
  });

  const generateQRString = () => {
    if (!report) return "";
    const { crewId, municipio, distancia, comentarios, herramientasUtilizadas, herramientasDanadas, herramientasExtraviadas } = report;
    
    const formatTools = (title: string, tools: ToolEntry[] | undefined) => {
        if (!tools || tools.filter(t => t.cantidad > 0).length === 0) return '';
        const header = `--- ${title.toUpperCase()} ---\n`;
        const toolLines = tools
            .filter(t => t.cantidad > 0)
            .map(t => `${t.nombre}: ${t.cantidad}`)
            .join('\n');
        return `${header}${toolLines}\n\n`;
    };

    const moderators = crewId ? crewId.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(', ') : 'N/A';
    const workers = crewId ? crewId.obreros.map(o => `${o.nombre} ${o.apellido}`).join(', ') : 'N/A';

     return `
=== REPORTE DE TRABAJO ===
Fecha: ${format(new Date(report.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
Cuadrilla: ${crewId?.nombre ?? 'N/A'}
Actividad: ${crewId?.descripcion ?? 'N/A'}

=== DETALLES DE LA JORNADA ===
Municipio: ${municipio}
Distancia (m): ${distancia}
Comentarios: ${comentarios}

${formatTools('Herramientas Utilizadas', herramientasUtilizadas)}
${formatTools('Herramientas Dañadas', herramientasDanadas)}
${formatTools('Herramientas Extraviadas', herramientasExtraviadas)}
=== PERSONAL ASIGNADO ===
--- Moderadores ---
${moderators}

--- Obreros ---
${workers}
    `.trim().replace(/(\\n\\s*\\n)+/g, '\n\n'); 
  };
  
  const generatePDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173; 
    const headerColor = hslToRgb(primaryColorH, 80, 30);
    const margin = 14;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text(`Reporte de Trabajo: ${report.crewId?.nombre ?? 'N/A'}`, margin, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${format(new Date(report.fecha), "dd/MM/yyyy", { locale: es })}`, margin, 26);
    
    let y = 35;

    // Report Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Detalles de la Actividad", margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`- Municipio: ${report.municipio}`, margin + 5, y); y += 6;
    doc.text(`- Distancia Recorrida: ${report.distancia}m`, margin + 5, y); y += 6;
    doc.text(`- Comentarios:`, margin + 5, y); y += 5;
    const comments = doc.splitTextToSize(report.comentarios, doc.internal.pageSize.width - margin * 3);
    doc.text(comments, margin + 10, y);
    y += comments.length * 5 + 5;


    // Crew Info
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Información de la Cuadrilla", margin, y); y += 5;
    doc.setFontSize(10);
    doc.autoTable({
        startY: y,
        theme: 'grid',
        head: [['Moderadores', 'Obreros']],
        body: [[
            report.crewId?.moderadores.map(m => `${m.nombre} ${m.apellido}`).join('\n') ?? 'N/A',
            report.crewId?.obreros.map(o => `${o.nombre} ${o.apellido}`).join('\n') ?? 'N/A'
        ]],
        headStyles: { fillColor: [240, 240, 240], textColor: 40 },
    });
    y = doc.autoTable.previous.finalY + 10;
    
    // Tools
    const tools = (title: string, data: ToolEntry[] | undefined) => {
        const filtered = data?.filter(t => t.cantidad > 0);
        if(!filtered || filtered.length === 0) return;
        
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(title, margin, y); y += 5;
        doc.autoTable({
            startY: y,
            theme: 'striped',
            head: [['Herramienta', 'Cantidad']],
            body: filtered.map(t => [t.nombre, t.cantidad]),
            headStyles: { fillColor: headerColor },
        });
        y = doc.autoTable.previous.finalY + 10;
    }
    
    tools('Herramientas Utilizadas', report.herramientasUtilizadas);
    tools('Herramientas Dañadas', report.herramientasDanadas);
    tools('Herramientas Extraviadas', report.herramientasExtraviadas);


    doc.save(`reporte-${report.crewId?.nombre.replace(/\s+/g, '-') ?? 'trabajo'}-${report.id}.pdf`);
  };
  
  if (!report) return null;

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Details Column */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardHat /> {report.crewId?.nombre ?? 'Cuadrilla no encontrada'}</CardTitle>
                    <CardDescription>{report.crewId?.descripcion ?? 'Sin descripción de actividad.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> <span className="font-semibold">Municipio:</span> {report.municipio}</div>
                        <div className="flex items-center gap-2"><Ruler className="h-4 w-4 text-muted-foreground"/> <span className="font-semibold">Distancia:</span> {report.distancia}m</div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground"/> <span className="font-semibold">Fecha:</span> {isClient ? format(new Date(report.fecha), "dd MMM yyyy, HH:mm", { locale: es }) : '...'}</div>
                        <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-muted-foreground"/> <span className="font-semibold">Reportado por:</span> {report.realizadoPor?.nombre ?? 'Usuario'} {report.realizadoPor?.apellido ?? ''}</div>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground"/> Comentarios</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.comentarios}</p>
                     </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ToolsTable title="Herramientas Utilizadas" tools={report.herramientasUtilizadas} variant="secondary" />
                <ToolsTable title="Herramientas Dañadas" tools={report.herramientasDanadas} variant="destructive"/>
                <ToolsTable title="Herramientas Extraviadas" tools={report.herramientasExtraviadas} variant="outline" />
            </div>
        </div>

        {/* Side Column */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Miembros de la Cuadrilla</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {report.crewId && <CrewMembersList title="Moderadores" members={report.crewId.moderadores} />}
                     <Separator />
                    {report.crewId && <CrewMembersList title="Obreros" members={report.crewId.obreros} />}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button onClick={generatePDF}><FileDown className="mr-2 h-4 w-4"/>Exportar a PDF</Button>
                    <Button variant="outline" onClick={() => setIsQrModalOpen(true)}><QrCode className="mr-2 h-4 w-4"/>Ver Código QR</Button>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* QR Code Modal */}
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reporte: {report.crewId?.nombre}</DialogTitle>
                    <DialogDescription>Escanee el código para ver todos los detalles del reporte.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-white rounded-lg my-4">
                   <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={generateQRString()}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </DialogContent>
        </Dialog>
    </>
  )
}

    