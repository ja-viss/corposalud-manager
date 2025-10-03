
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
import { Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const StrongArmIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M7.5,21.31a.5.5,0,0,1-.4-.2,5.1,5.1,0,0,1-.5-4.4c.5-1.4,1.4-2.8,2.8-3.8.4-.3.9-.2,1.2.2s.2.9-.2,1.2c-1.1.8-1.8,1.9-2.2,3s.1,2.8.9,3.6a.5.5,0,0,1-.1.7A.5.5,0,0,1,7.5,21.31ZM17,2H16a1,1,0,0,0-1,1V6.18A4,4,0,0,0,12,10v3H10a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h7a1,1,0,0,0,1-1V12.5A3.5,3.5,0,0,0,14.5,9,3.49,3.49,0,0,0,17,5.5a3.5,3.5,0,0,0,0-7Z" />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    const result = await loginUser({ username, password });
    if (result.success) {
      toast({ title: "Éxito", description: result.message });
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
      setLoading(false);
    }
  };

  const handleObreroLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const cedula = formData.get("cedula") as string;

    const result = await loginObrero(cedula);
     if (result.success) {
      toast({ title: "Éxito", description: result.message });
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
      setLoading(false);
    }
  };


  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 flex items-center gap-4">
          <Image
            src="/image_logo.png"
            alt="Logo"
            width={150}
            height={150}
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
                  <div className="space-y-2 relative">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required disabled={loading} className="pr-10"/>
                     <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowPassword(prev => !prev)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
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

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={() => setShowSupportDialog(true)}
      >
        <StrongArmIcon className="h-8 w-8" />
        <span className="sr-only">Soporte</span>
      </Button>

      <AlertDialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soporte Técnico</AlertDialogTitle>
            <AlertDialogDescription>
              Si necesita ayuda, puede contactarnos al siguiente número:
              <p className="font-semibold text-lg text-foreground mt-2">+58 412 - 1278416</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSupportDialog(false)}>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
