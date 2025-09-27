"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Crew } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

// Mock data remains for now until crew creation functionality is implemented
const mockCrews: Crew[] = [
  { id: '1', nombre: 'Cuadrilla - N°1', moderadores: [], obreros: [], fechaCreacion: '2023-05-01', creadoPor: 'Juan Perez' },
  { id: '2', nombre: 'Cuadrilla - N°2', moderadores: [], obreros: [], fechaCreacion: '2023-05-15', creadoPor: 'Juan Perez' },
];

export default function CuadrillasPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Crew | null>(null);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      // Perform delete action here
      console.log(`Deleting crew ${showDeleteConfirm.nombre}`);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Cuadrillas</h2>
            <p className="text-muted-foreground">Gestione las cuadrillas de trabajo.</p>
        </div>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Crear Cuadrilla
          </span>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Miembros</TableHead>
                <TableHead className="hidden lg:table-cell">Creado por</TableHead>
                <TableHead className="hidden lg:table-cell">Creado el</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCrews.map((crew) => (
                <TableRow key={crew.id}>
                  <TableCell className="font-medium">{crew.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell">{crew.moderadores.length + crew.obreros.length}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{crew.creadoPor}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{format(new Date(crew.fechaCreacion), "dd/MM/yyyy")}</TableCell>
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
                        <DropdownMenuItem>Ver/Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setShowDeleteConfirm(crew)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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
