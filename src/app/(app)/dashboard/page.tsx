import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Building, ClipboardList, UserCheck, UserX, Activity, LogIn, FileText, PlusCircle } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Crew from "@/models/Crew";
import { getActivityLogs } from "@/app/actions";
import type { ActivityLog } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


async function getDashboardStats() {
  await dbConnect();
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const inactiveUsers = totalUsers - activeUsers;
  const logResult = await getActivityLogs(3);
  
  const activeCrews = await Crew.countDocuments(); 
  const reportsGenerated = 0; // Placeholder until report generation is implemented

  return {
    totalUsers,
    activeCrews,
    reportsGenerated,
    activeUsers,
    inactiveUsers,
    recentActivity: logResult.success ? logResult.data : [],
  };
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


export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 space-y-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+0 desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuadrillas Activas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrews}</div>
            <p className="text-xs text-muted-foreground">+0 creadas esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">+0 hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% del total` : '0% del total'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Inactivo</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
             <p className="text-xs text-muted-foreground">
               {stats.totalUsers > 0 ? `${Math.round((stats.inactiveUsers / stats.totalUsers) * 100)}% del total` : '0% del total'}
             </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Un resumen de las últimas acciones en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-6">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map(log => (
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
