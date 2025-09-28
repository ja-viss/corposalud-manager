
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createDirectChannel } from "@/app/actions";
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onChannelCreated: () => void;
}

export function CreateChannelModal({ isOpen, onClose, users, currentUser, onChannelCreated }: CreateChannelModalProps) {
    const { toast } = useToast();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const currentUserId = currentUser.id;

    async function handleCreate() {
        if (!selectedUserId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un usuario.' });
            return;
        }

        setIsLoading(true);
        const result = await createDirectChannel(currentUserId, selectedUserId);

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onChannelCreated();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
    }
    
    const availableUsers = users.filter(u => u.id !== currentUserId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Mensaje Directo</DialogTitle>
                    <DialogDescription>
                        Seleccione un usuario para iniciar una conversación privada.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-select">Usuario</Label>
                         <Select onValueChange={setSelectedUserId}>
                            <SelectTrigger id="user-select">
                                <SelectValue placeholder="Seleccionar un usuario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.nombre} {user.apellido} ({user.username})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                    <Button onClick={handleCreate} disabled={isLoading || !selectedUserId}>
                        {isLoading ? 'Creando...' : 'Crear Canal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    