"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from '@/components/logo';
import { verifyDbConnection } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleVerifyConnection = async () => {
    const result = await verifyDbConnection();
    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
       <div className="mb-8">
        <Logo />
      </div>
      <Tabs defaultValue="user" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">Personal</TabsTrigger>
          <TabsTrigger value="worker">Obrero</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Card>
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Acceso de Personal</CardTitle>
                <CardDescription>
                  Ingrese su usuario y contraseña para acceder al sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input id="username" type="text" placeholder="su-usuario" required defaultValue="admin"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required defaultValue="password"/>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full">Iniciar Sesión</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="worker">
          <Card>
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Acceso de Obrero</CardTitle>
                <CardDescription>
                  Ingrese su número de Cédula para acceder al sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula de Identidad</Label>
                  <Input id="cedula" placeholder="V-12345678" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Ingresar</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button variant="outline" onClick={handleVerifyConnection}>
          Verificar Conexión a la Base de Datos
        </Button>
      </div>
    </div>
  );
}
