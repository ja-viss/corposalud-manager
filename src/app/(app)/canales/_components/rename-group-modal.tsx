
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updateChannelName } from "@/app/actions";
import type { Channel } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RenameGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Channel;
    onNameUpdated: () => void;
}

export function RenameGroupModal({ isOpen, onClose, channel, onNameUpdated }: RenameGroupModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [groupName, setGroupName] = useState(channel.nombre);

    useEffect(() => {
        if (isOpen) {
            setGroupName(channel.nombre);
        }
    }, [isOpen, channel.nombre]);
    
    async function handleRename() {
        if (!groupName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'El nombre del grupo no puede estar vacío.' });
            return;
        }

        setIsLoading(true);
        const result = await updateChannelName(channel.id, groupName);

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onNameUpdated();
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

