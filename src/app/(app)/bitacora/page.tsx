
"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Building, ClipboardList, UserCheck, UserX, Activity, User, KeyRound, LogIn, FileText, PlusCircle, FileDown } from "lucide-react";
import { Button } from '@/components/ui/button';
import { getActivityLogs } from "@/app/actions";
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ActivityLog } from "@/lib/types";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// HSL to RGB conversion function
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}


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

export default function BitacoraPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const logResult = await getActivityLogs();
      if (logResult.success && logResult.data) {
        setLogs(logResult.data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    const primaryColorH = 173; // From globals.css --primary
    const primaryColorS = 80;
    const primaryColorL = 30;
    const headerColor = hslToRgb(primaryColorH, primaryColorS, primaryColorL);

    doc.text("Bitácora de Actividad", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Acción', 'Realizado Por', 'Fecha']],
      body: logs.map(log => [
        formatLogMessage(log),
        log.realizadoPor,
        format(new Date(log.fecha), "dd/MM/yyyy HH:mm:ss", { locale: es })
      ]),
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle',
        overflow: 'linebreak',
        halign: 'left',
      },
    });
    doc.save('bitacora-actividad.pdf');
  };

  return (
    <div className="flex-1 space-y-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Bitácora de Actividad</h1>
        <Button size="sm" className="gap-1" onClick={handleExportPDF} disabled={loading || logs.length === 0}>
          <FileDown className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Exportar a PDF
          </span>
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Un resumen de las últimas acciones en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loading ? (
                <p className="text-sm text-muted-foreground">Cargando bitácora...</p>
            ) : logs.length > 0 ? (
              logs.map(log => (
                 <div className="flex items-start" key={log.id}>
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                    {getLogIcon(log.action)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{formatLogMessage(log)}</p>
                    <p className="text-sm text-muted-foreground">
                      Realizado por: {log.realizadoPor} - {formatDistanceToNow(new Date(log.fecha), { addSuffix: true, locale: es })}
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
    </div>
  );
}
