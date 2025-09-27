
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessages, sendMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Channel, Message } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatViewProps {
  channel: Channel | null;
}

export function ChatView({ channel }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channel) return;

    // This is a placeholder for the sender's ID. 
    // In a real app, you'd get this from the authenticated user's session.
    const senderId = "66a9179973719e2730932822"; // Placeholder for Admin user ID

    const result = await sendMessage(channel.id, senderId, newMessage);
    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data!]);
      setNewMessage('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  if (!channel) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-muted/20">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Seleccione un canal</p>
          <p className="text-sm text-muted-foreground">Elija una conversación de la lista para empezar a chatear.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h2 className="text-lg font-semibold">{channel.nombre}</h2>
        {/* Add actions like channel info or delete here */}
      </header>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.senderId.nombre.charAt(0)}{msg.senderId.apellido.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-sm">{msg.senderId.nombre} {msg.senderId.apellido}</p>
                    <p className="text-xs text-muted-foreground">
                       {format(new Date(msg.fecha), "dd MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="p-2 mt-1 rounded-lg bg-card text-sm">
                    <p>{msg.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            placeholder="Escriba su mensaje..."
            className="pr-20"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button type="submit" variant="ghost" size="icon" className="text-primary">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
