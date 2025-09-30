
'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, User, Building, Hash } from 'lucide-react';
import type { Channel, User as UserType } from '@/lib/types';
import { cn } from "@/lib/utils";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  loading: boolean;
  currentUser: UserType;
  allUsers: UserType[];
}

const getChannelIcon = (type: Channel['type']) => {
  switch (type) {
    case 'GENERAL': return <Users className="h-4 w-4" />;
    case 'ROLE': return <Users className="h-4 w-4" />;
    case 'CREW': return <Building className="h-4 w-4" />;
    case 'DIRECT': return <User className="h-4 w-4" />;
    case 'GROUP': return <Users className="h-4 w-4" />;
    default: return <Hash className="h-4 w-4" />;
  }
};

const getDirectChannelName = (channel: Channel, currentUserId: string, allUsers: UserType[]) => {
    if (channel.type !== 'DIRECT') return channel.nombre;
    const otherMemberId = channel.members.find(id => id !== currentUserId);
    if (!otherMemberId) return "Conversación";
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? `${otherUser.nombre} ${otherUser.apellido}` : "Usuario Eliminado";
}


export function ChannelList({ channels, selectedChannel, onSelectChannel, loading, currentUser, allUsers }: ChannelListProps) {
  const channelGroups = {
    directos: channels.filter(c => c.type === 'DIRECT'),
    grupos: channels.filter(c => c.type === 'GROUP'),
    general: channels.filter(c => c.type === 'GENERAL' || c.type === 'ROLE'),
    cuadrillas: channels.filter(c => c.type === 'CREW'),
  };

  return (
    <ScrollArea className="h-full">
        <div className="p-2 space-y-4">
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-full rounded-md bg-muted animate-pulse" />
                ))
            ) : (
                <>
                    {channelGroups.directos.length > 0 && (
                         <div>
                            <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Mensajes Directos</h3>
                            {channelGroups.directos.map(channel => (
                                <Button
                                key={channel.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2",
                                    selectedChannel?.id === channel.id && "bg-muted font-semibold"
                                )}
                                onClick={() => onSelectChannel(channel)}
                                >
                                {getChannelIcon(channel.type)}
                                {getDirectChannelName(channel, currentUser.id, allUsers)}
                                </Button>
                            ))}
                        </div>
                    )}
                    {channelGroups.grupos.length > 0 && (
                         <div>
                            <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Grupos</h3>
                            {channelGroups.grupos.map(channel => (
                                <Button
                                key={channel.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2",
                                    selectedChannel?.id === channel.id && "bg-muted font-semibold"
                                )}
                                onClick={() => onSelectChannel(channel)}
                                >
                                {getChannelIcon(channel.type)}
                                {channel.nombre}
                                </Button>
                            ))}
                        </div>
                    )}
                    {channelGroups.general.length > 0 && (
                        <div>
                            <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">General</h3>
                            {channelGroups.general.map(channel => (
                                <Button
                                key={channel.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2",
                                    selectedChannel?.id === channel.id && "bg-muted font-semibold"
                                )}
                                onClick={() => onSelectChannel(channel)}
                                >
                                {getChannelIcon(channel.type)}
                                {channel.nombre}
                                </Button>
                            ))}
                        </div>
                    )}
                    {channelGroups.cuadrillas.length > 0 && (
                         <div>
                            <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Cuadrillas</h3>
                            {channelGroups.cuadrillas.map(channel => (
                                <Button
                                key={channel.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2",
                                    selectedChannel?.id === channel.id && "bg-muted font-semibold"
                                )}
                                onClick={() => onSelectChannel(channel)}
                                >
                                {getChannelIcon(channel.type)}
                                {channel.nombre}
                                </Button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </ScrollArea>
  );
}
