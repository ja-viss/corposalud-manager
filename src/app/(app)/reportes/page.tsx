
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, HardHat, FileDown, ClipboardPlus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, getCrews } from "@/app/actions";
import type { Crew, User } from "@/lib/types";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { WorkReportModal } from "./_components/work-report-modal";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
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

export default function ReportesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [isWorkReportModalOpen, setIsWorkReportModalOpen] = useState(false);
  const [allCrews, setAllCrews] = useState<Crew[]>([]);

  const fetchCrewsForModal = async () => {
    const result = await getCrews();
    if (result.success && result.data) {
      setAllCrews(result.data);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de las cuadrillas.' });
    }
  };

  const handleOpenWorkReportModal = async () => {
    await fetchCrewsForModal();
    setIsWorkReportModalOpen(true);
  }

  const generatePdf = (title: string, head: any[], body: any[][], filename: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173;
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    doc.text(title, 14, 15);
    doc.autoTable({
      startY: 20,
      head: head,
      body: body,
      headStyles: { fillColor: headerColor, textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });
    doc.save(filename);
  };

  const handleExportObrerosPDF = async () => {
    setLoading("obreros");
    const result = await getUsers({ role: 'Obrero' });
    if (!result.success || !result.data) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de los obreros.' });
      setLoading(null);
      return;
    }
    
    generatePdf(
      "Reporte de Obreros",
      [['Nombre', 'Cédula', 'Email', 'Teléfono', 'Status', 'Creado el']],
      result.data.map(obrero => [
        `${obrero.nombre} ${obrero.apellido}`,
        obrero.cedula,
        obrero.email,
        obrero.telefono,
        obrero.status,
        format(new Date(obrero.fechaCreacion), "dd/MM/yyyy")
      ]),
      "reporte-obreros.pdf"
    );
    setLoading(null);
  };

  const handleExportModeradoresPDF = async () => {
    setLoading("moderadores");
    const result = await getUsers({ role: 'Moderador' });
    if (!result.success || !result.data) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de los moderadores.' });
      setLoading(null);
      return;
    }

    generatePdf(
      "Reporte de Moderadores",
      [['Nombre', 'Cédula', 'Email', 'Teléfono', 'Status', 'Creado el']],
      result.data.map(moderador => [
        `${moderador.nombre} ${moderador.apellido}`,
        moderador.cedula,
        moderador.email,
        moderador.telefono,
        moderador.status,
        format(new Date(moderador.fechaCreacion), "dd/MM/yyyy")
      ]),
      "reporte-moderadores.pdf"
    );
    setLoading(null);
  };
  
  const handleExportCuadrillasPDF = async () => {
      setLoading("cuadrillas");
      const result = await getCrews();
      if (!result.success || !result.data) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de las cuadrillas.' });
          setLoading(null);
          return;
      }
      
      const body = result.data.flatMap((crew: Crew) => {
        const moderadores = crew.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(', ');
        const obreros = crew.obreros.map(o => `${o.nombre} ${o.apellido}`).join('\n');
        return [[
          crew.nombre,
          crew.descripcion || 'N/A',
          moderadores,
          obreros,
          crew.creadoPor,
          format(new Date(crew.fechaCreacion), "dd/MM/yyyy")
        ]];
      });

      generatePdf(
        "Reporte de Cuadrillas",
        [['Nombre', 'Descripción', 'Moderadores', 'Obreros', 'Creado Por', 'Fecha Creación']],
        body,
        "reporte-cuadrillas.pdf"
      );

      setLoading(null);
  };


  return (
    <>
      <div className="space-y-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Reportes Automatizados</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Reporte de Obreros */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Reporte de Obreros</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Exporta una lista completa de todos los obreros registrados en la aplicación.
              </CardDescription>
            </CardContent>
            <CardContent>
               <Button className="w-full" onClick={handleExportObrerosPDF} disabled={loading === 'obreros'}>
                <FileDown className="mr-2 h-4 w-4" />
                {loading === 'obreros' ? 'Generando...' : 'Exportar a PDF'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Reporte de Moderadores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Reporte de Moderadores</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Exporta una lista de todos los moderadores con sus datos personales.
              </CardDescription>
            </CardContent>
             <CardContent>
               <Button className="w-full" onClick={handleExportModeradoresPDF} disabled={loading === 'moderadores'}>
                <FileDown className="mr-2 h-4 w-4" />
                {loading === 'moderadores' ? 'Generando...' : 'Exportar a PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Reporte de Cuadrillas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Reporte de Cuadrillas</CardTitle>
              <HardHat className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Exporta los detalles, integrantes y actividades de todas las cuadrillas.
              </CardDescription>
            </CardContent>
             <CardContent>
               <Button className="w-full" onClick={handleExportCuadrillasPDF} disabled={loading === 'cuadrillas'}>
                <FileDown className="mr-2 h-4 w-4" />
                {loading === 'cuadrillas' ? 'Generando...' : 'Exportar a PDF'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Reporte de Trabajo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Reporte de Trabajo</CardTitle>
              <ClipboardPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Genera o visualiza reportes de actividad de las cuadrillas.
              </CardDescription>
            </CardContent>
             <CardContent className="flex flex-col sm:flex-row gap-2">
               <Button className="w-full" onClick={handleOpenWorkReportModal}>
                <FileText className="mr-2 h-4 w-4" />
                Crear
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/reportes/trabajo">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <WorkReportModal
        isOpen={isWorkReportModalOpen}
        onClose={() => setIsWorkReportModalOpen(false)}
        crews={allCrews}
      />
    </>
  );
}
