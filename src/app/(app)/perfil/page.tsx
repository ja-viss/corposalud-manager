import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PerfilPage() {
  return (
    <div className="space-y-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Estos son sus datos personales. No pueden ser editados desde esta pantalla.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
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
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" defaultValue="admin@corposalud.com" readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" defaultValue="0412-0000000" readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Input id="role" defaultValue="Admin" readOnly />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
