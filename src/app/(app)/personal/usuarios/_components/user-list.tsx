
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { User } from "@/lib/types";
import { getUsers, deleteUser } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

interface UserListProps {
  initialUsers: User[];
  currentUser: User;
}

export function UserList({ initialUsers, currentUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setLoading(false);
  }, [toast]);
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteUser(showDeleteConfirm.id);
       if (result.success) {
        toast({ title: "Éxito", description: result.message });
        // Optimistic update
        setUsers(prev => prev.filter(u => u.id !== showDeleteConfirm.id));
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Get theme colors for the PDF
    const primaryColorH = 173; // From globals.css --primary
    const primaryColorS = 80;
    const primaryColorL = 30;
    const headerColor = hslToRgb(primaryColorH, primaryColorS, primaryColorL);
    
    doc.text("Listado de Usuarios", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Nombre', 'Cédula', 'Email', 'Rol', 'Status']],
      body: users.map(user => [
        `${user.nombre} ${user.apellido}`,
        user.cedula,
        user.email,
        user.role,
        user.status
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
    });
    doc.save('listado-usuarios.pdf');
  };
  
  const canCreateUsers = currentUser.role === 'Admin' || currentUser.role === 'Moderador';

  const canManageUser = (user: User) => {
    if (user.id === currentUser.id) return false; // Cannot manage self
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Moderador' && user.role === 'Obrero') return true;
    return false;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">Gestione los usuarios del sistema.</p>
        </div>
        {canCreateUsers && (
          <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1" onClick={handleExportPDF} disabled={loading || users.length === 0}>
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Exportar a PDF
                  </span>
              </Button>
              <Button size="sm" asChild className="gap-1">
                <Link href="/personal/usuarios/nuevo">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Crear Usuario
                  </span>
                </Link>
              </Button>
          </div>
        )}
      </div>
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creado el</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
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
                      {user.nombre} {user.apellido}
                    </TableCell>
                    <TableCell>{user.cedula}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Moderador' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{isClient ? format(new Date(user.fechaCreacion), "dd/MM/yyyy") : '...'}</TableCell>
                    <TableCell>
                      {canManageUser(user) && (
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
                              <Link href={`/personal/usuarios/${user.id}/editar`}>Editar</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => setShowDeleteConfirm(user)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
        {loading ? (
            <p className="text-center text-muted-foreground">Cargando usuarios...</p>
        ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground">No se encontraron usuarios.</p>
        ) : (
            users.map((user) => (
                <Card key={user.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                                {user.nombre} {user.apellido}
                                <p className="text-sm font-normal text-muted-foreground">C.I: {user.cedula}</p>
                            </CardTitle>
                            {canManageUser(user) && (
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
                                    <Link href={`/personal/usuarios/${user.id}/editar`}>Editar</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      className="text-destructive"
                                      onSelect={() => setShowDeleteConfirm(user)}
                                  >
                                      Eliminar
                                  </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Rol:</span>
                            <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Moderador' ? 'secondary' : 'outline'}>
                                {user.role}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}>{user.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Creado:</span>
                            <span>{isClient ? format(new Date(user.fechaCreacion), "dd/MM/yyyy") : '...'}</span>
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
