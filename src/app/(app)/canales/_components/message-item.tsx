
'use client';
/**
 * @file message-item.tsx
 * @description Componente que renderiza una única "burbuja" de mensaje en el chat.
 * Muestra el avatar del remitente, su nombre, el contenido del mensaje y la fecha.
 * También incluye un botón para eliminar el mensaje, visible solo para usuarios con permisos.
 *
 * @requires react
 * @requires @/components/ui/avatar
 * @requires @/components/ui/button
 * @requires @/lib/types
 * @requires date-fns
 * @requires lucide-react
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PopulatedMessage, User, Channel } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from "lucide-react";

/**
 * Props para el componente MessageItem.
 * @interface MessageItemProps
 * @property {PopulatedMessage} message - El objeto del mensaje a renderizar.
 * @property {User} currentUser - El usuario autenticado.
 * @property {Channel} channel - El canal al que pertenece el mensaje.
 * @property {() => void} onDeleteRequest - Callback para solicitar la eliminación del mensaje.
 */
interface MessageItemProps {
    message: PopulatedMessage;
    currentUser: User;
    channel: Channel;
    onDeleteRequest: () => void;
}

/**
 * Componente para renderizar un ítem de mensaje individual en el chat.
 *
 * @param {MessageItemProps} props - Las props del componente.
 * @returns {JSX.Element} Un elemento de mensaje.
 */
export function MessageItem({ message, currentUser, channel, onDeleteRequest }: MessageItemProps) {
    const { senderId, content, fecha } = message;

    // Construye el nombre y las iniciales del remitente. Si el usuario fue eliminado, muestra un texto por defecto.
    const senderName = senderId ? `${senderId.nombre} ${senderId.apellido} (${senderId.role})` : "Usuario Eliminado";
    const senderInitials = senderId ? `${senderId.nombre.charAt(0)}${senderId.apellido.charAt(0)}` : "UE";

    // Determina si el usuario actual tiene permisos para eliminar el mensaje.
    // Permisos: Admin, Moderador (excepto en mensajes directos), o el propio remitente.
    const canDelete = currentUser.role === 'Admin' || (currentUser.role === 'Moderador' && channel.type !== 'DIRECT') || senderId?.id === currentUser.id;

    return (
        <div className="flex items-start gap-3 group relative">
            {/* Avatar del remitente */}
            <Avatar className="h-8 w-8">
                <AvatarFallback>{senderInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                {/* Información del remitente y fecha */}
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-xs truncate">{senderName}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(fecha), "dd MMM, HH:mm", { locale: es })}
                    </p>
                </div>
                {/* Contenido del mensaje */}
                <div className="p-2 mt-1 rounded-lg bg-card text-xs">
                    <p className="break-words">{content}</p>
                </div>
            </div>
            {/* Botón de eliminar, visible al pasar el ratón sobre el mensaje si se tienen permisos */}
            {canDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                    onClick={onDeleteRequest}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar mensaje</span>
                </Button>
            )}
        </div>
    );
}
