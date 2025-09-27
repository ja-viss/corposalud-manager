import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Generar Reporte
          </span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <CardDescription>Lista de todos los reportes maestros y de actividad.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Reporte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Generado Por</TableHead>
                <TableHead>Fecha de Generación</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Reporte - N°317</TableCell>
                <TableCell>Actividad</TableCell>
                <TableCell>Moderador_1</TableCell>
                <TableCell>2024-07-30 10:00 AM</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Reporte - N°316</TableCell>
                <TableCell>Maestro</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>2024-07-29 05:30 PM</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
