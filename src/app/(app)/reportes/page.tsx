"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, HardHat, FileDown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, getCrews } from "@/app/actions";
import type { Crew, User } from "@/lib/types";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ModeratorReportView } from "./_components/moderator-report-view";

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
  const [isModeratorModalOpen, setIsModeratorModalOpen] = useState(false);

  const handleExportObrerosPDF = async () => {
    setLoading("obreros");
    const result = await getUsers({ role: 'Obrero' });
    if (!result.success || !result.data) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de los obreros.' });
      setLoading(null);
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173;
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    doc.text("Reporte de Obreros", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Nombre', 'Cédula', 'Email', 'Teléfono', 'Status', 'Creado el']],
      body: result.data.map(obrero => [
        `${obrero.nombre} ${obrero.apellido}`,
        obrero.cedula,
        obrero.email,
        obrero.telefono,
        obrero.status,
        format(new Date(obrero.fechaCreacion), "dd/MM/yyyy")
      ]),
      headStyles: { fillColor: headerColor },
      styles: { fontSize: 8 },
    });
    doc.save('reporte-obreros.pdf');
    setLoading(null);
  };
  
  const handleExportCuadrillasCSV = async () => {
      setLoading("cuadrillas");
      const result = await getCrews();
      if (!result.success || !result.data) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron obtener los datos de las cuadrillas.' });
          setLoading(null);
          return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Nombre Cuadrilla,Descripcion,Fecha Creacion,Creado Por,ID Moderadores,Nombres Moderadores,ID Obreros,Nombres Obreros\n";

      result.data.forEach((crew: Crew) => {
          const row = [
              `"${crew.nombre}"`,
              `"${crew.descripcion || ''}"`,
              `"${format(new Date(crew.fechaCreacion), "dd/MM/yyyy")}"`,
              `"${crew.creadoPor}"`,
              `"${crew.moderadores.map(m => m.id).join(';')}"`,
              `"${crew.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(';')}"`,
              `"${crew.obreros.map(o => o.id).join(';')}"`,
              `"${crew.obreros.map(o => `${o.nombre} ${o.apellido}`).join(';')}"`
          ].join(',');
          csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reporte-cuadrillas.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(null);
  };


  return (
    <>
      <div className="space-y-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Reportes Automatizados</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                Visualiza una lista de todos los moderadores con sus datos personales.
              </CardDescription>
            </CardContent>
             <CardContent>
               <Button className="w-full" variant="outline" onClick={() => setIsModeratorModalOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Reporte
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
               <Button className="w-full" onClick={handleExportCuadrillasCSV} disabled={loading === 'cuadrillas'}>
                <FileDown className="mr-2 h-4 w-4" />
                {loading === 'cuadrillas' ? 'Generando...' : 'Exportar a CSV'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <ModeratorReportView
        isOpen={isModeratorModalOpen}
        onClose={() => setIsModeratorModalOpen(false)}
      />
    </>
  );
}
