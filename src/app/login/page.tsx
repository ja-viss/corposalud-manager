"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { loginUser, loginObrero } from "@/app/actions";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    const result = await loginUser({ username, password });
    if (result.success) {
      toast({ title: "Éxito", description: result.message });
      router.push('/dashboard');
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setLoading(false);
  };

  const handleObreroLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const cedula = formData.get("cedula") as string;

    const result = await loginObrero(cedula);
     if (result.success) {
      toast({ title: "Éxito", description: result.message });
      router.push('/dashboard'); 
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setLoading(false);
  };


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Image
          src="/image_logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="rounded-lg"
        />
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
                  <Input id="username" name="username" type="text" placeholder="su-usuario" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required disabled={loading} />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="worker">
          <Card>
            <form onSubmit={handleObreroLogin}>
              <CardHeader>
                <CardTitle>Acceso de Obrero</CardTitle>
                <CardDescription>
                  Ingrese su número de Cédula para acceder al sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula-obrero">Cédula de Identidad</Label>
                  <Input id="cedula-obrero" name="cedula" placeholder="V-12345678" required disabled={loading} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
