import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Building, ClipboardList, UserCheck, UserX, Activity } from "lucide-react";


export default async function BitacoraPage() {

  return (
    <div className="flex-1 space-y-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Bitácora de Actividad</h1>
       <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Un resumen de las últimas acciones en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start">
               <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Aplicación conectada a la base de datos.</p>
                <p className="text-sm text-muted-foreground">Realizado por: jhonvivasproject - Hace 5 minutos</p>
              </div>
            </div>
             <div className="flex items-start">
               <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Nuevo usuario creado: Admin</p>
                <p className="text-sm text-muted-foreground">Realizado por: Sistema - Hace 20 minutos</p>
              </div>
            </div>
             <div className="flex items-start">
               <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Reporte "Reporte - N°315" generado.</p>
                <p className="text-sm text-muted-foreground">Realizado por: Admin - Hace 1 hora</p>
              </div>
            </div>
             <div className="flex items-start">
               <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Usuario "Obrero 1" ha iniciado sesión.</p>
                <p className="text-sm text-muted-foreground">Realizado por: Sistema - Hace 2 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
