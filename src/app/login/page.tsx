"use client";

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

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
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
        <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Crear Usuario
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Complete el formulario para agregar un nuevo usuario al sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <Input id="nombre" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apellido" className="text-right">Apellido</Label>
                  <Input id="apellido" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cedula" className="text-right">Cédula</Label>
                  <Input id="cedula" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefono" className="text-right">Teléfono</Label>
                  <Input id="telefono" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
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
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
