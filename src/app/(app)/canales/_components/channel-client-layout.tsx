
'use client';
/**
 * @file channel-client-layout.tsx
 * @description Componente principal del lado del cliente para la página de Canales.
 * Orquesta la interfaz completa del chat, incluyendo la lista de canales y la vista de chat.
 * Maneja el estado de la selección de canales y la apertura de modales.
 *
 * @requires react
 * @requires lucide-react
 * @requires @/components/ui/button
 * @requires @/hooks/use-toast
 * @requires @/lib/types
 * @requires @/app/actions
 * @requires @/lib/utils
 * @requires ./chat-view
 * @requires ./channel-list
 * @requires ./create-channel-modal
 */

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

/**
 * Props para el componente ChannelClientLayout.
 * @interface ChannelClientLayoutProps
 * @property {Channel[]} channels - La lista inicial de canales para mostrar.
 * @property {UserType[]} allUsers - Una lista de todos los usuarios del sistema para resolver nombres.
 * @property {UserType} currentUser - El objeto del usuario actualmente autenticado.
 */
interface ChannelClientLayoutProps {
    channels: Channel[];
    allUsers: UserType[];
    currentUser: UserType;
}

/**
 * Obtiene el nombre legible para un canal de mensaje directo.
 * En lugar de mostrar "Conversación Directa", muestra el nombre del otro participante.
 * @param {Channel} channel - El objeto del canal.
 * @param {string} currentUserId - El ID del usuario actual.
 * @param {UserType[]} allUsers - La lista de todos los usuarios para buscar el nombre.
 * @returns {string} El nombre del otro usuario o un nombre por defecto.
 */
const getDirectChannelName = (channel: Channel, currentUserId: string, allUsers: UserType[]) => {
    if (channel.type !== 'DIRECT') return channel.nombre;
    const otherMemberId = channel.members.find(id => id !== currentUserId);
    if (!otherMemberId) return "Conversación";
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? `${otherUser.nombre} ${otherUser.apellido}` : "Usuario Eliminado";
}

/**
 * Componente principal que renderiza la interfaz de chat.
 *
 * @param {ChannelClientLayoutProps} props - Las props del componente.
 * @returns {JSX.Element} El layout de la página de canales.
 */
export function ChannelClientLayout({ channels: initialChannels, allUsers, currentUser }: ChannelClientLayoutProps) {
  // Estado para la lista de canales (puede actualizarse).
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [loading, setLoading] = useState(false);
  // Estado para el canal que está seleccionado actualmente.
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  // Estado para controlar la visibilidad del modal de creación de canal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // En la vista de escritorio, selecciona automáticamente "Anuncios Generales" al cargar.
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !selectedChannel && channels.length > 0) {
      const generalChannel = channels.find(c => c.nombre === "Anuncios Generales");
      setSelectedChannel(generalChannel || channels[0]);
    }
  }, [channels, selectedChannel]);

  /**
   * Función para recargar la lista de canales desde el servidor.
   * Se usa después de crear o eliminar un canal.
   */
  const refreshChannels = useCallback(async () => {
    setLoading(true);
    const channelResult = await getChannels(currentUser.id, currentUser.role);
    if (channelResult.success && channelResult.data) {
        setChannels(channelResult.data);
        
        // Si el canal seleccionado fue eliminado, se deselecciona.
        if (selectedChannel && !channelResult.data.find(c => c.id === selectedChannel.id)) {
            setSelectedChannel(null);
        } else if (selectedChannel) {
            // Si sigue existiendo, se actualizan sus datos (ej. lista de miembros).
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

  /**
   * Callback que se ejecuta cuando un canal ha sido creado exitosamente.
   * Refresca la lista y cierra el modal.
   */
  const handleChannelCreated = () => {
    refreshChannels();
    setIsModalOpen(false);
  };
  
  /**
   * Callback que se ejecuta cuando una acción en un canal (ej. eliminación) ocurre.
   * Refresca la lista de canales para reflejar el cambio.
   */
  const handleChannelAction = () => {
    refreshChannels();
  }

  /**
   * Manejador para cuando un usuario hace clic en un canal de la lista.
   * @param {Channel} channel - El canal seleccionado.
   */
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  }

  /**
   * Manejador para el botón "atrás" en la vista móvil.
   * Deselecciona el canal actual para volver a la lista de canales.
   */
  const handleBackToList = () => {
    setSelectedChannel(null);
  }
  
  // Define si el usuario actual tiene permisos para crear mensajes directos.
  const canCreateDirectMessage = currentUser.role === 'Admin' || currentUser.role === 'Moderador';
  
  /**
   * Determina el título a mostrar en la cabecera de la página.
   * @returns {string} El título dinámico.
   */
  const getPageTitle = () => {
    if (!selectedChannel) return "Canales de Chat";
    if (selectedChannel.type === 'DIRECT') {
        return getDirectChannelName(selectedChannel, currentUser.id, allUsers);
    }
    return selectedChannel.nombre;
  }

  return (
    <>
      {/* Cabecera principal con título y botón de acción */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            {/* Botón de volver para la vista móvil */}
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
        {/* Botón para crear mensaje directo (solo visible para roles autorizados) */}
        {canCreateDirectMessage && !selectedChannel && (
          <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Crear Mensaje Directo
            </span>
          </Button>
        )}
      </div>

      {/* Contenedor principal del chat, dividido en dos columnas en escritorio */}
      <div className="grid md:grid-cols-[300px_1fr] flex-1 border rounded-lg overflow-hidden">
        {/* Columna de la lista de canales. Se oculta en móvil cuando un chat está abierto. */}
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
        
        {/* Columna de la vista del chat. Se oculta en móvil si no hay chat seleccionado. */}
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

      {/* Modal para crear un nuevo canal (directo o grupal) */}
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
