
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, LogIn, FileText, PlusCircle, UserCheck, UserX } from "lucide-react";
import type { ActivityLog } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const iconMap: { [key: string]: React.ReactNode } = {
  'user-creation': <UserCheck className="h-5 w-5" />,
  'user-login': <LogIn className="h-5 w-5" />,
  'worker-login': <LogIn className="h-5 w-5" />,
  'user-deletion': <UserX className="h-5 w-5" />,
  'db-connection': <Activity className="h-5 w-5" />,
  'report-generation': <FileText className="h-5 w-5" />,
  'crew-creation': <PlusCircle className="h-5 w-5" />,
  default: <Activity className="h-5 w-5" />,
};

function getLogIcon(action: string) {
    const actionPrefix = action.split(':')[0];
    return iconMap[actionPrefix] || iconMap.default;
}

function formatLogMessage(log: ActivityLog): string {
  const [actionPrefix, actionDetail] = log.action.split(':');
  switch (actionPrefix) {
    case 'user-creation':
      return `Nuevo usuario creado: ${actionDetail || 'N/A'}`;
    case 'user-login':
      return `Usuario "${actionDetail || 'N/A'}" ha iniciado sesión.`;
    case 'worker-login':
        return `Obrero con cédula "${actionDetail || 'N/A'}" ha iniciado sesión.`;
    case 'user-deletion':
      return `Usuario con ID "${actionDetail || 'N/A'}" ha sido eliminado.`;
    case 'db-connection':
      return 'Aplicación conectada a la base de datos.';
    default:
      return log.action;
  }
}

interface RecentActivityProps {
    recentActivity: ActivityLog[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <Card>
            <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Un resumen de las últimas acciones en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-6">
                {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map(log => (
                    <div className="flex items-start" key={log.id}>
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                        {getLogIcon(log.action)}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{formatLogMessage(log)}</p>
                        <p className="text-sm text-muted-foreground">
                          Realizado por: {log.realizadoPor} - {isClient ? formatDistanceToNow(new Date(log.fecha), { addSuffix: true, locale: es }) : "..."}
                        </p>
                    </div>
                    </div>
                ))
                ) : (
                <p className="text-sm text-muted-foreground">No hay actividad registrada todavía.</p>
                )}
            </div>
            </CardContent>
        </Card>
    );
}
