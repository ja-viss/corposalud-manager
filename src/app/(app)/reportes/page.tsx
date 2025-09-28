
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Download, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getReports } from "@/app/actions";
import type { Report } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GenerateReportModal } from "./_components/generate-report-modal";

export default function ReportesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const result = await getReports();
    if (result.success && result.data) {
      setReports(result.data);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los reportes." });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <>
      <div className="space-y-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Generar Reporte
            </span>
          </Button>
        </div>
        
        {/* Desktop Table View */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Reportes Generados</CardTitle>
            <CardDescription>Lista de todos los reportes maestros y de actividad.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Rango de Fechas</TableHead>
                  <TableHead>Generado Por</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Cargando reportes...</TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No se han generado reportes todavía.</TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.nombre}</TableCell>
                      <TableCell>
                        <Badge variant={report.tipo === 'Maestro' ? 'default' : 'secondary'}>{report.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.rangoFechas.from), 'dd/MM/yy')} - {format(new Date(report.rangoFechas.to), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell>{report.generadoPor}</TableCell>
                      <TableCell>
                        {format(new Date(report.fechaCreacion), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => alert(`Descargando ${report.nombre}`)}>
                          <Download className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Mobile Card View */}
        <div className="grid gap-4 md:hidden">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Reportes Generados</CardTitle>
                <CardDescription>Lista de todos los reportes maestros y de actividad.</CardDescription>
            </CardHeader>
             {loading ? (
                <p className="text-center text-muted-foreground">Cargando reportes...</p>
             ) : reports.length === 0 ? (
                <p className="text-center text-muted-foreground">No se han generado reportes todavía.</p>
             ) : (
                reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">
                                    {report.nombre}
                                    <p className="text-sm font-normal text-muted-foreground">
                                        {format(new Date(report.rangoFechas.from), 'dd/MM/yy')} - {format(new Date(report.rangoFechas.to), 'dd/MM/yy')}
                                    </p>
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => alert(`Descargando ${report.nombre}`)}>
                                    <Download className="h-5 w-5"/>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo:</span>
                                <Badge variant={report.tipo === 'Maestro' ? 'default' : 'secondary'}>{report.tipo}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Generado por:</span>
                                <span>{report.generadoPor}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha:</span>
                                <span>{format(new Date(report.fechaCreacion), "dd/MM/yyyy HH:mm")}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>

      </div>

      <GenerateReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportGenerated={() => {
          setIsModalOpen(false);
          fetchReports();
        }}
      />
    </>
  );
}
