
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createUser, updateUser } from "@/app/actions";
import type { User, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserFormProps {
    user?: User | null;
}

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    cedula: z.string().min(7, "La cédula debe ser válida"),
    email: z.string().email("Email inválido"),
    telefono: z.string().min(10, "El teléfono debe ser válido"),
    username: z.string().min(4, "El usuario es muy corto"),
    contrasena: z.string().optional(),
    role: z.enum(['Admin', 'Moderador', 'Obrero']),
});

export function UserForm({ user }: UserFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const isEditing = !!user;
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            apellido: "",
            cedula: "",
            email: "",
            telefono: "",
            username: "",
            contrasena: "",
            role: "Obrero",
        },
    });
    
    useEffect(() => {
        if (isEditing && user) {
            form.reset({
                nombre: user.nombre,
                apellido: user.apellido,
                cedula: user.cedula,
                email: user.email,
                telefono: user.telefono,
                username: user.username,
                role: user.role,
                contrasena: "",
            });
        }
    }, [user, isEditing, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSubmit = { ...values, role: values.role as UserRole };
        
        if (!isEditing && !values.contrasena) {
            form.setError("contrasena", { type: "manual", message: "La contraseña es obligatoria para nuevos usuarios." });
            return;
        }
        
        let result;
        if (isEditing && user) {
            result = await updateUser(user.id, dataToSubmit);
        } else {
            result = await createUser(dataToSubmit);
        }
        
        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            router.push('/personal/usuarios');
            router.refresh();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="apellido" render={({ field }) => (
                                <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="cedula" render={({ field }) => (
                                <FormItem><FormLabel>Cédula</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="telefono" render={({ field }) => (
                                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>
                        <Card>
                        <CardHeader>
                            <CardTitle>Información de la Cuenta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="username" render={({ field }) => (
                                <FormItem><FormLabel>Usuario</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="contrasena" render={({ field }) => (
                                <FormItem className="relative">
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder={isEditing ? "Dejar en blanco para no cambiar" : ""} 
                                            {...field} 
                                            className="pr-10"
                                        />
                                    </FormControl>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                                      onClick={() => setShowPassword(prev => !prev)}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Seleccione un rol" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Moderador">Moderador</SelectItem>
                                            <SelectItem value="Obrero">Obrero</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </div>
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/personal/usuarios">Cancelar</Link>
                    </Button>
                    <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
                </div>
            </form>
        </Form>
    );
}
