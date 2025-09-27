"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, UserRole } from "@/lib/types";

const mockUsers: User[] = [
  { id: '1', nombre: 'Juan', apellido: 'Perez', cedula: 'V-12345678', email: 'juan.perez@email.com', telefono: '0414-1234567', role: 'Admin', fechaCreacion: '2023-01-15', creadoPor: 'System', status: 'active' },
  { id: '2', nombre: 'Ana', apellido: 'Gomez', cedula: 'V-87654321', email: 'ana.gomez@email.com', telefono: '0412-8765432', role: 'Moderador', fechaCreacion: '2023-02-20', creadoPor: 'Juan Perez', status: 'active' },
  { id: '3', nombre: 'Carlos', apellido: 'Ruiz', cedula: 'V-11223344', email: 'carlos.ruiz@email.com', telefono: '0416-1122334', role: 'Obrero', fechaCreacion: '2023-03-10', creadoPor: 'Ana Gomez', status: 'active' },
  { id: '4', nombre: 'Maria', apellido: 'Gonzalez', cedula: 'V-22334455', email: 'maria.gonzalez@email.com', telefono: '0424-2233445', role: 'Obrero', fechaCreacion: '2023-03-10', creadoPor: 'Ana Gomez', status: 'inactive' },
  { id: '5', nombre: 'Luis', apellido: 'Martinez', cedula: 'V-33445566', email: 'luis.martinez@email.com', telefono: '0414-3344556', role: 'Obrero', fechaCreacion: '2023-04-01', creadoPor: 'Juan Perez', status: 'active' },
];

export default function UsuariosPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      // Perform delete action here
      console.log(`Deleting user ${showDeleteConfirm.nombre}`);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Gestione los usuarios del sistema.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creado el</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre} {user.apellido}</TableCell>
                  <TableCell>{user.cedula}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Moderador' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-600' : ''}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.fechaCreacion}</TableCell>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setShowDeleteConfirm(user)}
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
              Esta acción es irreversible. Se eliminará permanentemente al usuario {showDeleteConfirm?.nombre} {showDeleteConfirm?.apellido}.
              <br/><br/>
              <strong>Nota:</strong> Un usuario no puede ser eliminado si está asignado a una cuadrilla.
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
