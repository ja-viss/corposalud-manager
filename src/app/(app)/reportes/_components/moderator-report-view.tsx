"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getUsers } from "@/app/actions";
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ModeratorReportViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ModeratorReportView({ isOpen, onClose }: ModeratorReportViewProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [moderators, setModerators] = useState<User[]>([]);

    useEffect(() => {
        if (isOpen) {
            async function fetchModerators() {
                setIsLoading(true);
                const result = await getUsers({ role: 'Moderador' });
                if (result.success && result.data) {
                    setModerators(result.data);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los moderadores.' });
                }
                setIsLoading(false);
            }
            fetchModerators();
        }
    }, [isOpen, toast]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Reporte de Moderadores</DialogTitle>
                    <DialogDescription>
                        Lista completa de todos los moderadores registrados en la aplicación.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Creado el</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Cargando moderadores...</TableCell>
                                </TableRow>
                            ) : moderators.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No se encontraron moderadores.</TableCell>
                                </TableRow>
                            ) : (
                                moderators.map(mod => (
                                    <TableRow key={mod.id}>
                                        <TableCell>{mod.nombre} {mod.apellido}</TableCell>
                                        <TableCell>{mod.cedula}</TableCell>
                                        <TableCell>{mod.email}</TableCell>
                                        <TableCell>{mod.telefono}</TableCell>
                                        <TableCell>
                                           <Badge variant={mod.status === 'active' ? 'default' : 'secondary'} className={mod.status === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}>{mod.status}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(mod.fechaCreacion), "dd/MM/yyyy")}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
