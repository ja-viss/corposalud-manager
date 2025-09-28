"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createDirectChannel, createGroupChannel } from "@/app/actions";
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onChannelCreated: () => void;
}

export function CreateChannelModal({ isOpen, onClose, users, currentUser, onChannelCreated }: CreateChannelModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // State for Direct Message
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // State for Group Chat
    const [groupName, setGroupName] = useState('');
    const [selectedGroupUserIds, setSelectedGroupUserIds] = useState<string[]>([currentUser.id]);

    const [activeTab, setActiveTab] = useState('directo');
    
    const currentUserId = currentUser.id;
    const availableUsers = users.filter(u => u.id !== currentUserId);

    const handleGroupUserSelect = (userId: string) => {
        setSelectedGroupUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    async function handleCreate() {
        setIsLoading(true);
        let result;

        if (activeTab === 'directo') {
            if (!selectedUserId) {
                toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un usuario.' });
                setIsLoading(false);
                return;
            }
            result = await createDirectChannel(currentUserId, selectedUserId);
        } else { // activeTab === 'grupo'
            if (!groupName.trim()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Por favor, ingrese un nombre para el grupo.' });
                setIsLoading(false);
                return;
            }
            if (selectedGroupUserIds.length < 2) { // Creator + at least one other person
                toast({ variant: 'destructive', title: 'Error', description: 'Un grupo debe tener al menos 2 miembros.' });
                setIsLoading(false);
                return;
            }
            result = await createGroupChannel(groupName, selectedGroupUserIds, currentUserId);
        }

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onChannelCreated();
            // Reset states
            setSelectedUserId(null);
            setGroupName('');
            setSelectedGroupUserIds([currentUser.id]);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
        onClose();
    }
    
    const isCreateDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'directo') return !selectedUserId;
        if (activeTab === 'grupo') return !groupName.trim() || selectedGroupUserIds.length < 2;
        return true;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Conversación</DialogTitle>
                    <DialogDescription>
                        Inicie una conversación privada con otro usuario o cree un grupo.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="directo">Mensaje Directo</TabsTrigger>
                        <TabsTrigger value="grupo">Grupo</TabsTrigger>
                    </TabsList>
                    
                    {/* Direct Message Content */}
                    <TabsContent value="directo" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-select">Usuario</Label>
                            <Select onValueChange={setSelectedUserId}>
                                <SelectTrigger id="user-select">
                                    <SelectValue placeholder="Seleccionar un usuario..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.nombre} {user.apellido} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                    
                    {/* Group Chat Content */}
                    <TabsContent value="grupo" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Nombre del Grupo</Label>
                            <Input 
                                id="group-name" 
                                placeholder="Ej: Equipo de Proyecto" 
                                value={groupName} 
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Miembros</Label>
                            <ScrollArea className="h-48 rounded-md border">
                                <div className="p-4 space-y-2">
                                     {availableUsers.map(user => (
                                        <div key={user.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`user-${user.id}`}
                                                onCheckedChange={() => handleGroupUserSelect(user.id)}
                                                checked={selectedGroupUserIds.includes(user.id)}
                                            />
                                            <Label htmlFor={`user-${user.id}`} className="font-normal cursor-pointer">
                                                {user.nombre} {user.apellido} ({user.role})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <p className="text-xs text-muted-foreground">Tú serás incluido automáticamente en el grupo.</p>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                    <Button onClick={handleCreate} disabled={isCreateDisabled()}>
                        {isLoading ? 'Creando...' : 'Crear'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}