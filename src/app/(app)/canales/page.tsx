import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MessageSquare } from "lucide-react";

export default function CanalesPage() {
  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
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
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Anuncios Generales</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Para todo el personal.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Cuadrilla - N°1</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Canal para la cuadrilla 1.</p>
            </CardContent>
          </Card>
           <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center justify-center text-center space-y-2 pb-2">
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Crear Nuevo Canal</CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
