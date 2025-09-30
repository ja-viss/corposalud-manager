
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, FileDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Crew } from "@/lib/types";
import { format } from 'date-fns';
import { getCrews, deleteCrew } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Badge } from "@/components/ui/badge";

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

interface CrewListProps {
  initialCrews: Crew[];
  canManageCrews: boolean;
}

export function CrewList({ initialCrews, canManageCrews }: CrewListProps) {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Crew | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCrews = useCallback(async () => {
    setLoading(true);
    const result = await getCrews();
    if (result.success && result.data) {
      setCrews(result.data);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setLoading(false);
  }, [toast]);
  
  useEffect(() => {
    setCrews(initialCrews);
  }, [initialCrews]);

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteCrew(showDeleteConfirm.id);
      if (result.success) {
        toast({ title: "Éxito", description: result.message });
        fetchCrews(); // Refresh crews list
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    const primaryColorH = 173; // From globals.css --primary
    const primaryColorS = 80;
    const primaryColorL = 30;
    const headerColor = hslToRgb(primaryColorH, primaryColorS, primaryColorL);

    doc.text("Listado de Cuadrillas", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Nombre', 'Descripción', 'Miembros', 'Creado por', 'Fecha Creación']],
      body: crews.map(crew => [
        crew.nombre,
        crew.descripcion || 'N/A',
        crew.moderadores.length + crew.obreros.length,
        crew.creadoPor,
        format(new Date(crew.fechaCreacion), "dd/MM/yyyy")
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
      columnStyles: {
        1: { cellWidth: 'auto' } // Description column
      }
    });
    doc.save('listado-cuadrillas.pdf');
  };

  return (
    <>
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {canManageCrews ? 'Gestione las cuadrillas de trabajo.' : 'Mis Cuadrillas'}
            </h2>
            <p className="text-muted-foreground">
              {canManageCrews ? 'Cree y administre las cuadrillas.' : 'Estas son las cuadrillas en las que estás asignado.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
             {canManageCrews && (
              <Button size="sm" asChild className="gap-1">
                <Link href="/personal/cuadrillas/nuevo">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Crear Cuadrilla
                    </span>
                </Link>
              </Button>
            )}
            <Button size="sm" className="gap-1" onClick={handleExportPDF} disabled={loading || crews.length === 0}>
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar a PDF
                </span>
            </Button>
          </div>
        </div>
      
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[30%]">Descripción</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Creado el</TableHead>
                {canManageCrews && (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManageCrews ? 6 : 5} className="h-24 text-center">
                    Cargando cuadrillas...
                  </TableCell>
                </TableRow>
              ) : crews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageCrews ? 6 : 5} className="h-24 text-center">
                    No se encontraron cuadrillas.
                  </TableCell>
                </TableRow>
              ) : (
                crews.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell className="font-medium">{crew.nombre}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{crew.descripcion || 'N/A'}</TableCell>
                    <TableCell>
                      {crew.moderadores.length + crew.obreros.length}
                    </TableCell>
                    <TableCell>
                       {crew.creadoPor}
                    </TableCell>
                    <TableCell>{isClient ? format(new Date(crew.fechaCreacion), "dd/MM/yyyy") : '...'}</TableCell>
                    {canManageCrews && (
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
                            <DropdownMenuItem asChild>
                              <Link href={`/personal/cuadrillas/${crew.id}/editar`}>Editar</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => setShowDeleteConfirm(crew)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
         {loading ? (
            <p className="text-center text-muted-foreground">Cargando cuadrillas...</p>
         ) : crews.length === 0 ? (
            <p className="text-center text-muted-foreground">No se encontraron cuadrillas.</p>
         ) : (
            crews.map((crew) => (
                <Card key={crew.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{crew.nombre}</CardTitle>
                             {canManageCrews && (
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/personal/cuadrillas/${crew.id}/editar`}>Editar</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={() => setShowDeleteConfirm(crew)}
                                    >
                                    Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                         <CardDescription>{crew.descripcion || 'Sin descripción'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Miembros:</span>
                            <Badge variant="secondary">{crew.moderadores.length + crew.obreros.length}</Badge>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Creado por:</span>
                            <span>{crew.creadoPor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha:</span>
                            <span>{isClient ? format(new Date(crew.fechaCreacion), "dd/MM/yyyy") : '...'}</span>
                        </div>
                    </CardContent>
                </Card>
            ))
         )}
      </div>

      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará permanentemente la cuadrilla {showDeleteConfirm?.nombre}. Los miembros no serán eliminados, solo desvinculados.
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

    
