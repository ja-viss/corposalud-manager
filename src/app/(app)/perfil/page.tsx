import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
  return (
    <div className="space-y-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Estos son sus datos personales. No pueden ser editados desde esta pantalla.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="https://picsum.photos/seed/1/100/100" alt="Avatar" data-ai-hint="person portrait" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold">Admin Principal</h2>
                        <p className="text-muted-foreground">admin@corpotachira.com</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" defaultValue="Admin" readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input id="apellido" defaultValue="Principal" readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula</Label>
                        <Input id="cedula" defaultValue="V-12345678" readOnly />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" defaultValue="0412-0000000" readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Input id="role" defaultValue="Admin" readOnly />
                    </div>
                </div>
                 <Button variant="outline">Cambiar Contraseña</Button>
            </CardContent>
        </Card>
    </div>
  );
}
