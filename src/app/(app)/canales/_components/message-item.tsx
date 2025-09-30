
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PopulatedMessage, User, Channel } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from "lucide-react";

interface MessageItemProps {
    message: PopulatedMessage;
    currentUser: User;
    channel: Channel;
    onDeleteRequest: () => void;
}

export function MessageItem({ message, currentUser, channel, onDeleteRequest }: MessageItemProps) {
    const { senderId, content, fecha } = message;

    const senderName = senderId ? `${senderId.nombre} ${senderId.apellido} (${senderId.role})` : "Usuario Eliminado";
    const senderInitials = senderId ? `${senderId.nombre.charAt(0)}${senderId.apellido.charAt(0)}` : "UE";

    const canDelete = currentUser.role === 'Admin' || (currentUser.role === 'Moderador' && channel.type !== 'DIRECT') || senderId?.id === currentUser.id;

    return (
        <div className="flex items-start gap-3 group relative">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{senderInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-sm">{senderName}</p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(fecha), "dd MMM, HH:mm", { locale: es })}
                    </p>
                </div>
                <div className="p-2 mt-1 rounded-lg bg-card text-sm break-words">
                    <p>{content}</p>
                </div>
            </div>
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
