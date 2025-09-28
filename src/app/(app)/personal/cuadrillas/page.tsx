"use client";

import { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Crew, User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { getCrews, deleteCrew, getUserById } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { CrewFormModal } from "./_components/crew-form-modal";
import { getCookie } from "cookies-next";

export default function CuadrillasPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Crew | null>(null);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

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
  
  const fetchCurrentUser = useCallback(async () => {
    const userId = getCookie('session-id');
    if (userId) {
        const userResult = await getUserById(userId);
        if (userResult.success && userResult.data) {
            setCurrentUser(userResult.data);
        }
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchCrews();
  }, [fetchCrews, fetchCurrentUser]);

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

  const handleOpenModalForCreate = () => {
    setEditingCrew(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (crew: Crew) => {
    setEditingCrew(crew);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCrew(null);
  }
  
  const canManageCrews = currentUser?.role === 'Admin' || currentUser?.role === 'Moderador';


  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {canManageCrews ? 'Cuadrillas' : 'Mis Cuadrillas'}
            </h2>
            <p className="text-muted-foreground">
              {canManageCrews ? 'Gestione las cuadrillas de trabajo.' : 'Estas son las cuadrillas en las que estás asignado.'}
            </p>
        </div>
        {canManageCrews && (
          <Button size="sm" className="gap-1" onClick={handleOpenModalForCreate}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Crear Cuadrilla
            </span>
          </Button>
        )}
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
                  <TableCell colSpan={canManageCrews ? 5 : 4} className="h-24 text-center">
                    Cargando cuadrillas...
                  </TableCell>
                </TableRow>
              ) : crews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageCrews ? 5 : 4} className="h-24 text-center">
                    No se encontraron cuadrillas.
                  </TableCell>
                </TableRow>
              ) : (
                crews.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell className="font-medium">{crew.nombre}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {crew.moderadores.length + crew.obreros.length}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                       {crew.creadoPor}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{format(new Date(crew.fechaCreacion), "dd/MM/yyyy")}</TableCell>
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
                            <DropdownMenuItem onSelect={() => handleOpenModalForEdit(crew)}>Ver/Editar</DropdownMenuItem>
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
      
      {isModalOpen && (
        <CrewFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          crew={editingCrew}
          onSave={() => {
            handleCloseModal();
            fetchCrews();
          }}
        />
      )}

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
