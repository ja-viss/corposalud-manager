

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Channel, User as UserType } from '@/lib/types';
import { getChannels } from '@/app/actions';
import { cn } from '@/lib/utils';

import { ChatView } from './chat-view';
import { ChannelList } from './channel-list';
import { CreateChannelModal } from './create-channel-modal';

interface ChannelClientLayoutProps {
  channels: Channel[];
  allUsers: UserType[];
  currentUser: UserType;
}

const getDirectChannelName = (channel: Channel, currentUserId: string, allUsers: UserType[]) => {
    if (channel.type !== 'DIRECT') return channel.nombre;
    const otherMemberId = channel.members.find(id => id !== currentUserId);
    if (!otherMemberId) return "Conversación";
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? `${otherUser.nombre} ${otherUser.apellido}` : "Usuario Eliminado";
}


export function ChannelClientLayout({ channels: initialChannels, allUsers, currentUser }: ChannelClientLayoutProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // On desktop, select the "Anuncios Generales" channel by default if one isn't already selected
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !selectedChannel && channels.length > 0) {
      const generalChannel = channels.find(c => c.nombre === "Anuncios Generales");
      setSelectedChannel(generalChannel || channels[0]);
    }
  }, [channels, selectedChannel]);


  const refreshChannels = useCallback(async () => {
    setLoading(true);
    const channelResult = await getChannels(currentUser.id, currentUser.role);
    if (channelResult.success && channelResult.data) {
        setChannels(channelResult.data);
        
        if (selectedChannel) {
            const updatedSelectedChannel = channelResult.data.find(c => c.id === selectedChannel.id);
            if (!updatedSelectedChannel) {
                setSelectedChannel(null);
            }
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar los canales.' });
    }
    setLoading(false);
  }, [toast, selectedChannel, currentUser.id, currentUser.role]);

  const handleChannelCreated = () => {
    refreshChannels();
    setIsModalOpen(false);
  };
  
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  }

  const handleBackToList = () => {
    setSelectedChannel(null);
  }

  const canCreateDirectMessage = currentUser.role === 'Admin' || currentUser.role === 'Moderador';
  
  const getPageTitle = () => {
    if (!selectedChannel) return "Canales de Chat";
    if (selectedChannel.type === 'DIRECT') {
        return getDirectChannelName(selectedChannel, currentUser.id, allUsers);
    }
    return selectedChannel.nombre;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            {selectedChannel && (
                <Button variant="ghost" size="icon" className="md:hidden" onClick={handleBackToList}>
                    <ArrowLeft />
                </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {getPageTitle()}
              </h1>
              {!selectedChannel && <p className="text-muted-foreground">Comunicación unidireccional con el personal.</p>}
            </div>
        </div>
        {canCreateDirectMessage && (
          <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Crear Mensaje Directo
            </span>
          </Button>
        )}
      </div>

      <Card className="h-[calc(100vh-15rem)]">
        <CardContent className="p-0 h-full">
          <div className="grid md:grid-cols-[300px_1fr] h-full">
            <div className={cn("h-full", selectedChannel && "hidden md:block")}>
              <ChannelList
                channels={channels}
                selectedChannel={selectedChannel}
                onSelectChannel={handleSelectChannel}
                loading={loading}
                currentUser={currentUser}
                allUsers={allUsers}
              />
            </div>
            
            <div className={cn("h-full", !selectedChannel && "hidden md:flex")}>
                <ChatView 
                    channel={selectedChannel} 
                    currentUser={currentUser} 
                    allUsers={allUsers}
                />
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={allUsers}
        currentUser={currentUser}
        onChannelCreated={handleChannelCreated}
      />
    </>
  );
}
