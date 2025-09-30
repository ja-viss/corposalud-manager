
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { addMembersToChannel, removeMembersFromChannel } from "@/app/actions";
import type { User, Channel } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface ManageGroupMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Channel;
    allUsers: User[];
    currentUser: User;
    onMembersUpdated: () => void;
}

export function ManageGroupMembersModal({ isOpen, onClose, channel, allUsers, currentUser, onMembersUpdated }: ManageGroupMembersModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const [usersToAdd, setUsersToAdd] = useState<string[]>([]);
    const [usersToRemove, setUsersToRemove] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('add');

    // Users not in the group
    const availableUsers = allUsers.filter(u => !channel.members.includes(u.id));

    // Users currently in the group (excluding the current admin)
    const currentMembers = allUsers.filter(u => channel.members.includes(u.id) && u.id !== currentUser.id);

    const handleUserSelect = (userId: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    async function handleUpdateMembers() {
        setIsLoading(true);
        let result;

        if (activeTab === 'add') {
            if (usersToAdd.length === 0) {
                toast({ variant: 'destructive', title: 'Error', description: 'No ha seleccionado ningún usuario para añadir.' });
                setIsLoading(false);
                return;
            }
            result = await addMembersToChannel(channel.id, usersToAdd);
        } else { // activeTab === 'remove'
             if (usersToRemove.length === 0) {
                toast({ variant: 'destructive', title: 'Error', description: 'No ha seleccionado ningún usuario para expulsar.' });
                setIsLoading(false);
                return;
            }
            result = await removeMembersFromChannel(channel.id, usersToRemove);
        }

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onMembersUpdated();
            // Reset states
            setUsersToAdd([]);
            setUsersToRemove([]);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
        onClose();
    }
    
    const isUpdateDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'add') return usersToAdd.length === 0;
        if (activeTab === 'remove') return usersToRemove.length === 0;
        return true;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gestionar Miembros del Grupo</DialogTitle>
                    <DialogDescription>
                        Añada o expulse miembros de "{channel.nombre}".
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="add">Añadir Miembro</TabsTrigger>
                        <TabsTrigger value="remove">Expulsar Miembro</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="add" className="space-y-4 py-4">
                         <Label>Seleccione usuarios para añadir</Label>
                        <ScrollArea className="h-48 rounded-md border">
                            <div className="p-4 space-y-2">
                                 {availableUsers.length > 0 ? availableUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`add-user-${user.id}`}
                                            onCheckedChange={() => handleUserSelect(user.id, usersToAdd, setUsersToAdd)}
                                            checked={usersToAdd.includes(user.id)}
                                        />
                                        <Label htmlFor={`add-user-${user.id}`} className="font-normal cursor-pointer">
                                            {user.nombre} {user.apellido} ({user.role})
                                        </Label>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center">No hay más usuarios para añadir.</p>}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="remove" className="space-y-4 py-4">
                        <Label>Seleccione miembros para expulsar</Label>
                        <ScrollArea className="h-48 rounded-md border">
                            <div className="p-4 space-y-2">
                                 {currentMembers.length > 0 ? currentMembers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`remove-user-${user.id}`}
                                            onCheckedChange={() => handleUserSelect(user.id, usersToRemove, setUsersToRemove)}
                                            checked={usersToRemove.includes(user.id)}
                                        />
                                        <Label htmlFor={`remove-user-${user.id}`} className="font-normal cursor-pointer text-destructive">
                                            {user.nombre} {user.apellido} ({user.role})
                                        </Label>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center">No hay miembros para expulsar.</p>}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                    <Button onClick={handleUpdateMembers} disabled={isUpdateDisabled()} className={activeTab === 'remove' ? 'bg-destructive hover:bg-destructive/90' : ''}>
                        {isLoading ? 'Actualizando...' : (activeTab === 'add' ? 'Añadir Miembros' : 'Expulsar Miembros')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
