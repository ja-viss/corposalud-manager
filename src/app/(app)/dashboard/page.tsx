import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Building, ClipboardList, UserCheck, UserX } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";

async function getDashboardStats() {
  await dbConnect();
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const inactiveUsers = totalUsers - activeUsers;
  
  // These are placeholders for now
  const activeCrews = 42; 
  const reportsGenerated = 316;

  return {
    totalUsers,
    activeCrews,
    reportsGenerated,
    activeUsers,
    inactiveUsers,
  };
}


export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 space-y-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Un resumen de las últimas acciones en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Aplicación conectada a la base de datos.</p>
                <p className="text-sm text-muted-foreground">Realizado por: jhonvivasproject</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
