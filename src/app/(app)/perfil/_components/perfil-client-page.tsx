
"use client";
/**
 * @file perfil-client-page.tsx
 * @description Componente del lado del cliente para la página de "Mi Perfil".
 * Renderiza la información del usuario, las cuadrillas a las que pertenece (si aplica),
 * y un formulario para cambiar la contraseña (solo para Admins).
 *
 * @requires react
 * @requires react-hook-form
 * @requires @hookform/resolvers/zod
 * @requires zod
 * @requires @/components/ui/*
 * @requires @/hooks/use-toast
 * @requires @/app/actions
 * @requires @/lib/types
 * @requires lucide-react
 */

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "@/app/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { User, Crew } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, HardHat } from 'lucide-react';

// Esquema de validación para el formulario de cambio de contraseña.
const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida."),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"] // Indica qué campo mostrará el error.
});

/**
 * Props para el componente PerfilClientPage.
 * @interface PerfilPageProps
 * @property {User} user - El objeto del usuario autenticado.
 * @property {Crew[]} crews - Una lista de las cuadrillas a las que pertenece el usuario.
 */
interface PerfilPageProps {
    user: User;
    crews: Crew[];
}

/**
 * Componente principal de la página de perfil del usuario.
 *
 * @param {PerfilPageProps} props - Las props del componente.
 * @returns {JSX.Element} La página de perfil.
 */
export function PerfilClientPage({ user, crews }: PerfilPageProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Estados para controlar la visibilidad de las contraseñas.
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Configuración del formulario con `react-hook-form` y `zod`.
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  /**
   * Maneja el envío del formulario de cambio de contraseña.
   * @param {z.infer<typeof passwordFormSchema>} values - Los valores del formulario.
   */
  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true);
    const result = await updatePassword(user.id, values.currentPassword, values.newPassword);
    if (result.success) {
      toast({ title: "Éxito", description: result.message });
      form.reset(); // Limpia el formulario después del éxito.
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsLoading(false);
  }

  // Genera las iniciales del usuario para el Avatar.
  const userInitials = user ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}` : "U";
  // Banderas para controlar la visibilidad de secciones según el rol.
  const isWorkerOrModerator = user.role === 'Obrero' || user.role === 'Moderador';
  const isAdmin = user.role === 'Admin';

  return (
    <div className="space-y-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <div className={`grid gap-8 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
            {/* Formulario para cambiar contraseña (solo visible para Admins) */}
            {isAdmin && (
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cambiar Contraseña</CardTitle>
                            <CardDescription>Actualice su contraseña para mantener su cuenta segura.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="currentPassword" render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Contraseña Actual</FormLabel>
                                            <FormControl>
                                                <Input type={showCurrentPassword ? "text" : "password"} {...field} disabled={isLoading} className="pr-10" />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowCurrentPassword(p => !p)}>
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="newPassword" render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Nueva Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type={showNewPassword ? "text" : "password"} {...field} disabled={isLoading} className="pr-10" />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowNewPassword(p => !p)}>
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Confirmar Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type={showConfirmPassword ? "text" : "password"} {...field} disabled={isLoading} className="pr-10" />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmPassword(p => !p)}>
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Sección de Información Personal y Cuadrillas */}
             <div className={`${isAdmin ? 'md:col-span-2' : 'md:col-span-1'}`}>
                <div className="flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Estos son sus datos personales. No pueden ser editados desde esta pantalla.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-semibold">{user.nombre} {user.apellido}</h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" value={user.nombre} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido</Label>
                                    <Input id="apellido" value={user.apellido} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cedula">Cédula</Label>
                                    <Input id="cedula" value={user.cedula} readOnly />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input id="telefono" value={user.telefono} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Input id="role" value={user.role} readOnly />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Tarjeta de "Mis Cuadrillas", visible para Obreros y Moderadores */}
                    {isWorkerOrModerator && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Mis Cuadrillas</CardTitle>
                                <CardDescription>Las cuadrillas a las que estás asignado actualmente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {crews.length > 0 ? (
                                    <ul className="space-y-3">
                                        {crews.map(crew => (
                                            <li key={crew._id} className="flex items-center gap-3 text-sm font-medium">
                                                <HardHat className="h-5 w-5 text-primary" />
                                                <span>{crew.nombre}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aún no has sido asignado a ninguna cuadrilla.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
