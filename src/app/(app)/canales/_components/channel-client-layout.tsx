
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        
        // If a channel was deleted, selectedChannel will be stale.
        // Check if the currently selected channel still exists in the new list.
        if (selectedChannel && !channelResult.data.find(c => c.id === selectedChannel.id)) {
            setSelectedChannel(null); // Deselect if it no longer exists
        } else if (selectedChannel) {
            // If it still exists, update its data (e.g., members list)
            const updatedChannel = channelResult.data.find(c => c.id === selectedChannel.id);
            if (updatedChannel) {
                setSelectedChannel(updatedChannel);
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
  
  const handleChannelAction = () => {
    refreshChannels();
  }

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
        {canCreateDirectMessage && !selectedChannel && (
          <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Crear Mensaje Directo
            </span>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-[300px_1fr] flex-1 border rounded-lg overflow-hidden">
        <div className={cn("h-full border-r", selectedChannel && "hidden md:block")}>
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
                onChannelDeleted={handleChannelAction}
                onChannelUpdated={handleChannelAction}
            />
        </div>
      </div>

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
