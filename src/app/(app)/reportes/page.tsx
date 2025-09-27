import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportesPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Reporte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Generado Por</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div>Reporte - N°317</div>
                  <div className="text-xs text-muted-foreground md:hidden">Por: Moderador_1</div>
                </TableCell>
                <TableCell><Badge variant="outline">Actividad</Badge></TableCell>
                <TableCell className="hidden md:table-cell">Moderador_1</TableCell>
                <TableCell className="hidden lg:table-cell">2024-07-30 10:00 AM</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                   <div>Reporte - N°316</div>
                   <div className="text-xs text-muted-foreground md:hidden">Por: Admin</div>
                </TableCell>
                <TableCell><Badge>Maestro</Badge></TableCell>
                <TableCell className="hidden md:table-cell">Admin</TableCell>
                <TableCell className="hidden lg:table-cell">2024-07-29 05:30 PM</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
