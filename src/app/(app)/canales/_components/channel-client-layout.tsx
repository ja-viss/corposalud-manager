
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Channel, User as UserType } from '@/lib/types';
import { getChannels } from '@/app/actions';

import { ChatView } from './chat-view';
import { ChannelList } from './channel-list';
import { CreateChannelModal } from './create-channel-modal';

interface ChannelClientLayoutProps {
  channels: Channel[];
  allUsers: UserType[];
  currentUser: UserType;
}

export function ChannelClientLayout({ channels: initialChannels, allUsers, currentUser }: ChannelClientLayoutProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set the selected channel only if there isn't one already and there are channels available
    if (!selectedChannel && initialChannels.length > 0) {
      setSelectedChannel(initialChannels[0]);
    }
  }, [initialChannels, selectedChannel]);

  const refreshChannels = useCallback(async () => {
    setLoading(true);
    const channelResult = await getChannels();
    if (channelResult.success && channelResult.data) {
      setChannels(channelResult.data);
      // If the currently selected channel no longer exists, reset it.
      if (selectedChannel && !channelResult.data.find(c => c.id === selectedChannel.id)) {
        setSelectedChannel(channelResult.data[0] || null);
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar los canales.' });
    }
    setLoading(false);
  }, [toast, selectedChannel]);

  const handleChannelCreated = () => {
    refreshChannels();
    setIsModalOpen(false);
  };

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
