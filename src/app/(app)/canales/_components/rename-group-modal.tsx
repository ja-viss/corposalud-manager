
"use client";
/**
 * @file rename-group-modal.tsx
 * @description Componente modal que permite a un usuario cambiar el nombre de un canal de grupo.
 *
 * @requires react
 * @requires @/components/ui/*
 * @requires @/hooks/use-toast
 * @requires @/app/actions
 * @requires @/lib/types
 */

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updateChannelName } from "@/app/actions";
import type { Channel } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Props para el componente RenameGroupModal.
 * @interface RenameGroupModalProps
 * @property {boolean} isOpen - Controla la visibilidad del modal.
 * @property {() => void} onClose - Función para cerrar el modal.
 * @property {Channel} channel - El canal de grupo cuyo nombre se va a cambiar.
 * @property {() => void} onNameUpdated - Callback que se ejecuta cuando el nombre se actualiza correctamente.
 */
interface RenameGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Channel;
    onNameUpdated: () => void;
}

/**
 * Componente modal para cambiar el nombre de un grupo de chat.
 *
 * @param {RenameGroupModalProps} props - Las props del componente.
 * @returns {JSX.Element} El diálogo modal.
 */
export function RenameGroupModal({ isOpen, onClose, channel, onNameUpdated }: RenameGroupModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [groupName, setGroupName] = useState(channel.nombre);

    // Actualiza el estado del nombre del grupo si el modal se abre con un canal diferente.
    useEffect(() => {
        if (isOpen) {
            setGroupName(channel.nombre);
        }
    }, [isOpen, channel.nombre]);
    
    /**
     * Maneja el envío del formulario.
     * Llama a la server action `updateChannelName` para guardar el cambio.
     */
    async function handleRename() {
        if (!groupName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'El nombre del grupo no puede estar vacío.' });
            return;
        }

        setIsLoading(true);
        const result = await updateChannelName(channel.id, groupName);

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onNameUpdated(); // Notifica al componente padre que el nombre ha cambiado.
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Nombre del Grupo</DialogTitle>
                    <DialogDescription>
                        Ingrese un nuevo nombre para el grupo "{channel.nombre}".
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <Label htmlFor="new-group-name">Nuevo Nombre</Label>
                    <Input 
                        id="new-group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Escriba el nuevo nombre"
                    />
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                    <Button onClick={handleRename} disabled={isLoading || !groupName.trim()}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
