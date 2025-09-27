"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from '@/components/logo';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createUser, loginUser, loginObrero } from "@/app/actions";
import type { UserRole } from '@/lib/types';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    const result = await loginUser({ username, password });
    if (result.success) {
      toast({ title: "Éxito", description: result.message });
      router.push('/dashboard');
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const handleObreroLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cedula = formData.get("cedula") as string;

    const result = await loginObrero(cedula);
     if (result.success) {
      toast({ title: "Éxito", description: result.message });
      router.push('/dashboard'); // O a una página específica para obreros
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      if (data.contrasena !== data.confirmarContrasena) {
          toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." });
          return;
      }

      const result = await createUser({
          nombre: data.nombre as string,
          apellido: data.apellido as string,
          cedula: data.cedula as string,
          email: data.email as string,
          telefono: data.telefono as string,
          username: data.username as string,
          contrasena: data.contrasena as string,
          role: data.role as UserRole,
      });

      if (result.success) {
          toast({ title: "Éxito", description: result.message });
          setOpen(false);
      } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
      }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
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
                  <Input id="username" name="username" type="text" placeholder="su-usuario" required defaultValue="admin"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required defaultValue="password"/>
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
                  <Input id="cedula-obrero" name="cedula" placeholder="V-12345678" required />
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Crear Usuario
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Complete el formulario para agregar un nuevo usuario al sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" name="nombre" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input id="apellido" name="apellido" required />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula</Label>
                    <Input id="cedula" name="cedula" required/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required/>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" name="telefono" required/>
                      </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username-create">Usuario</Label>
                    <Input id="username-create" name="username" required/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="contrasena">Contraseña</Label>
                    <Input id="contrasena" name="contrasena" type="password" required/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirmarContrasena">Confirmar Contraseña</Label>
                    <Input id="confirmarContrasena" name="confirmarContrasena" type="password" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select name="role" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Moderador">Moderador</SelectItem>
                        <SelectItem value="Obrero">Obrero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Guardar Usuario</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
