

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Paperclip, Send, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessages, sendMessage, deleteMessage, deleteChannel } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { PopulatedMessage, Channel, User } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';


interface ChatViewProps {
  channel: Channel | null;
  currentUser: User | null;
  allUsers: User[];
  onChannelDeleted: () => void;
}

const getDirectChannelName = (channel: Channel, currentUserId: string, allUsers: User[]) => {
    if (channel.type !== 'DIRECT') return channel.nombre;
    const otherMemberId = channel.members.find(id => id !== currentUserId);
    if (!otherMemberId) return "Conversación";
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? `${otherUser.nombre} ${otherUser.apellido}` : "Usuario Eliminado";
}

export function ChatView({ channel, currentUser, allUsers, onChannelDeleted }: ChatViewProps) {
  const [messages, setMessages] = useState<PopulatedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PopulatedMessage | null>(null);
  const [showDeleteChannelConfirm, setShowDeleteChannelConfirm] = useState<Channel | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    if (!channel) return;
    setLoading(true);
    const result = await getMessages(channel.id);
    if (result.success && result.data) {
      setMessages(result.data);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los mensajes.' });
    }
    setLoading(false);
  }, [channel, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channel || !currentUser) return;

    const result = await sendMessage(channel.id, currentUser.id, newMessage);
    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      setNewMessage('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleDeleteMessage = async () => {
    if (showDeleteConfirm) {
      const result = await deleteMessage(showDeleteConfirm.id);
      if (result.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== showDeleteConfirm.id));
        toast({ title: 'Éxito', description: 'Mensaje eliminado.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setShowDeleteConfirm(null);
    }
  };
  
  const handleDeleteChannel = async () => {
    if (showDeleteChannelConfirm && currentUser) {
      const result = await deleteChannel(showDeleteChannelConfirm.id, currentUser.id);
      if (result.success) {
        toast({ title: 'Éxito', description: result.message });
        onChannelDeleted();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setShowDeleteChannelConfirm(null);
    }
  };


  if (!channel || !currentUser) {
    return (
      <div className="flex-col h-full items-center justify-center bg-muted/20 hidden md:flex">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Seleccione un canal</p>
          <p className="text-sm text-muted-foreground">Elija una conversación de la lista para empezar a chatear.</p>
        </div>
      </div>
    );
  }

  const isObreroInNonDirectChannel = currentUser?.role === 'Obrero' && channel.type !== 'DIRECT';
  
  const canPostInChannel = () => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Moderador') return true;
    if (currentUser.role === 'Obrero') {
        // Obreros can only post in direct messages and their own crew channels
        return channel.type === 'DIRECT' || (channel.type === 'CREW' && channel.members.includes(currentUser.id));
    }
    return false;
  }
  
  const isInputDisabled = !canPostInChannel();

  const getInputPlaceholder = () => {
    if (isInputDisabled) {
        if (channel.nombre === "Anuncios Generales" || channel.nombre === "Obreros" || channel.nombre === "Moderadores") {
             return `Solo los administradores y moderadores pueden enviar mensajes aquí.`;
        }
        return "No tienes permiso para enviar mensajes en este canal.";
    }
    return "Escriba su mensaje...";
  }

  const getChannelTitle = () => {
    if (channel.type === 'DIRECT') {
        return getDirectChannelName(channel, currentUser.id, allUsers);
    }
    return channel.nombre;
  }
  
  const canDeleteChannel = channel.isDeletable && currentUser.role === 'Admin';


  return (
    <>
      <div className="flex flex-col h-full bg-muted/20">
        <header className="flex items-center justify-between p-4 border-b bg-card flex-shrink-0">
          <h2 className="text-lg font-semibold">{getChannelTitle()}</h2>
          {canDeleteChannel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Opciones del canal</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive"
                  onSelect={() => setShowDeleteChannelConfirm(channel)}
                >
                  Eliminar Conversación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                {loading ? (
                <div className="flex justify-center items-center h-full">
                    <p>Cargando mensajes...</p>
                </div>
                ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-center text-muted-foreground">
                    <p>No hay mensajes en este canal todavía.<br/>Sé el primero en enviar uno.</p>
                </div>
                ) : (
                messages.map((msg) => {
                    const sender = msg.senderId;
                    const senderName = sender ? `${sender.nombre} ${sender.apellido} (${sender.role})` : "Usuario Eliminado";
                    const senderInitials = sender ? `${sender.nombre.charAt(0)}${sender.apellido.charAt(0)}` : "UE";

                    const canDelete = currentUser.role === 'Admin' || (currentUser.role === 'Moderador' && channel.type !== 'DIRECT') || msg.senderId?.id === currentUser.id;

                    return (
                    <div key={msg.id} className="flex items-start gap-3 group relative">
                        <Avatar className="h-8 w-8">
                        <AvatarFallback>{senderInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <p className="font-semibold text-sm">{senderName}</p>
                            <p className="text-xs text-muted-foreground">
                            {format(new Date(msg.fecha), "dd MMM, HH:mm", { locale: es })}
                            </p>
                        </div>
                        <div className="p-2 mt-1 rounded-lg bg-card text-sm break-words">
                            <p>{msg.content}</p>
                        </div>
                        </div>
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-0 right-0 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                                onClick={() => setShowDeleteConfirm(msg)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar mensaje</span>
                            </Button>
                        )}
                    </div>
                    );
                })
                )}
            </div>
            </ScrollArea>
        </div>
        
        <footer className="p-4 border-t bg-card flex-shrink-0">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              placeholder={getInputPlaceholder()}
              className="pr-20"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isInputDisabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" disabled={isInputDisabled}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button type="submit" variant="ghost" size="icon" className="text-primary" disabled={isInputDisabled || !newMessage.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </footer>
      </div>

       <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este mensaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y el mensaje no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={!!showDeleteChannelConfirm} onOpenChange={() => setShowDeleteChannelConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar esta conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará permanentemente la conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
