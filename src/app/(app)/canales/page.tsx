import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MessageSquare } from "lucide-react";

export default function CanalesPage() {
  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Canales de Chat</h1>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Crear Canal
          </span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canales Activos</CardTitle>
          <CardDescription>Comunicación unidireccional con las cuadrillas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Anuncios Generales</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Para todo el personal.</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Cuadrilla - N°1</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Canal para la cuadrilla 1.</p>
            </CardContent>
          </Card>
           <Card className="border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center text-center p-6">
              <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-base font-medium">Crear Nuevo Canal</p>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
