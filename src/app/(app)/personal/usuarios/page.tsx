"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { User } from "@/lib/types";
import { getUsers, deleteUser } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';


export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const result = await getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setLoading(false);
    }
    fetchUsers();
  }, [toast]);

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteUser(showDeleteConfirm.id);
       if (result.success) {
        toast({ title: "Éxito", description: result.message });
        setUsers(users.filter(u => u.id !== showDeleteConfirm.id));
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setShowDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">Gestione los usuarios del sistema.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Cédula</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Creado el</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="font-medium">{user.nombre} {user.apellido}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{user.cedula}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.cedula}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Moderador' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{format(new Date(user.fechaCreacion), "dd/MM/yyyy")}</TableCell>
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
                            disabled={user.role === 'Admin'}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
              <strong>Nota:</strong> Un usuario no puede ser eliminado si está asignado a una cuadrilla o si es un Administrador.
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