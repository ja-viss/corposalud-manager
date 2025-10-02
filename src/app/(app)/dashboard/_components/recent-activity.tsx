
"use client";
/**
 * @file recent-activity.tsx
 * @description Componente que muestra una lista de las actividades recientes del sistema.
 * Es utilizado en el Dashboard para dar una visión rápida de las últimas acciones.
 *
 * @requires react
 * @requires @/components/ui/card
 * @requires lucide-react
 * @requires @/lib/types
 * @requires date-fns
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, LogIn, FileText, PlusCircle, UserCheck, UserX } from "lucide-react";
import type { ActivityLog } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapeo de acciones a iconos para una representación visual.
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

/**
 * Devuelve un icono basado en el tipo de acción del log.
 * @param {string} action - La cadena de la acción (ej. 'user-creation:john').
 * @returns {React.ReactNode} El componente de icono.
 */
function getLogIcon(action: string) {
    const actionPrefix = action.split(':')[0];
    return iconMap[actionPrefix] || iconMap.default;
}

/**
 * Formatea el mensaje del log para que sea más legible para el usuario.
 * @param {ActivityLog} log - El objeto del log de actividad.
 * @returns {string} El mensaje formateado.
 */
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

/**
 * Props para el componente RecentActivity.
 * @interface RecentActivityProps
 * @property {ActivityLog[]} recentActivity - Una lista de los logs de actividad más recientes.
 */
interface RecentActivityProps {
    recentActivity: ActivityLog[];
}

/**
 * Componente que muestra una tarjeta con la actividad reciente del sistema.
 *
 * @param {RecentActivityProps} props - Las props del componente.
 * @returns {JSX.Element} La tarjeta de actividad reciente.
 */
export function RecentActivity({ recentActivity }: RecentActivityProps) {
    const [isClient, setIsClient] = useState(false);

    // Se utiliza `isClient` para evitar errores de hidratación con `formatDistanceToNow`,
    // que puede devolver valores diferentes en el servidor y en el cliente.
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
