"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Crew } from "@/lib/types";

const mockCrews: Crew[] = [
  { id: '1', nombre: 'Cuadrilla - N°1', moderadores: [{ id: '2', nombre: 'Ana', apellido: 'Gomez', cedula: 'V-87654321', email: 'ana.gomez@email.com', telefono: '0412-8765432', role: 'Moderador', fechaCreacion: '2023-02-20', creadoPor: 'Juan Perez', status: 'active' }], obreros: [{ id: '3', nombre: 'Carlos', apellido: 'Ruiz', cedula: 'V-11223344', email: 'carlos.ruiz@email.com', telefono: '0416-1122334', role: 'Obrero', fechaCreacion: '2023-03-10', creadoPor: 'Ana Gomez', status: 'active' }, { id: '5', nombre: 'Luis', apellido: 'Martinez', cedula: 'V-33445566', email: 'luis.martinez@email.com', telefono: '0414-3344556', role: 'Obrero', fechaCreacion: '2023-04-01', creadoPor: 'Juan Perez', status: 'active' }], fechaCreacion: '2023-05-01', creadoPor: 'Juan Perez' },
  { id: '2', nombre: 'Cuadrilla - N°2', moderadores: [{ id: '2', nombre: 'Ana', apellido: 'Gomez', cedula: 'V-87654321', email: 'ana.gomez@email.com', telefono: '0412-8765432', role: 'Moderador', fechaCreacion: '2023-02-20', creadoPor: 'Juan Perez', status: 'active' }], obreros: [], fechaCreacion: '2023-05-15', creadoPor: 'Juan Perez' },
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cuadrillas</CardTitle>
            <CardDescription>Gestione las cuadrillas de trabajo.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Crear Cuadrilla
            </span>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Moderador(es)</TableHead>
                <TableHead>Creado el</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCrews.map((crew) => (
                <TableRow key={crew.id}>
                  <TableCell className="font-medium">{crew.nombre}</TableCell>
                  <TableCell>{crew.moderadores.length + crew.obreros.length}</TableCell>
                  <TableCell>{crew.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(', ')}</TableCell>
                  <TableCell>{crew.fechaCreacion}</TableCell>
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
