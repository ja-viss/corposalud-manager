
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Channel, User as UserType } from '@/lib/types';
import { getChannels, getUsers, getUserById } from '@/app/actions';

import { ChatView } from './_components/chat-view';
import { ChannelList } from './_components/channel-list';
import { CreateChannelModal } from './_components/create-channel-modal';


export default function CanalesPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, you would get this from a session context
      const tempUserResult = await getUserById("66a9179973719e2730932822"); // Placeholder for Admin user
      if (tempUserResult.success) {
        setCurrentUser(tempUserResult.data || null);
      }

      const [channelResult, usersResult] = await Promise.all([getChannels(), getUsers()]);

      if (channelResult.success && channelResult.data) {
        setChannels(channelResult.data);
        if (channelResult.data.length > 0) {
            // Automatically select the first channel, e.g., "Anuncios Generales"
            setSelectedChannel(channelResult.data[0]);
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: channelResult.message });
      }

      if (usersResult.success && usersResult.data) {
        setAllUsers(usersResult.data);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error de red', description: 'No se pudo conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  
  const handleChannelCreated = () => {
      fetchInitialData();
      setIsModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canales de Chat</h1>
          <p className="text-muted-foreground">Comunicación unidireccional con el personal.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Crear Canal
          </span>
        </Button>
      </div>

      <Card className="h-[calc(100vh-15rem)]">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
            <ChannelList
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              loading={loading}
            />
            <ChatView channel={selectedChannel} currentUser={currentUser} />
          </div>
        </CardContent>
      </Card>
      
      {currentUser && (
        <CreateChannelModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            users={allUsers}
            currentUser={currentUser}
            onChannelCreated={handleChannelCreated}
        />
      )}
    </>
  );
}
