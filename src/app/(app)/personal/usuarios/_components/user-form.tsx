
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Copy } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createUser, updateUser } from "@/app/actions";
import type { User, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface UserFormProps {
    user?: User | null;
    currentUserRole?: UserRole;
}

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre es demasiado corto"),
    apellido: z.string().min(2, "El apellido es demasiado corto"),
    cedula: z.string().min(7, "La cédula debe ser válida"),
    email: z.string().email("Email inválido"),
    telefono: z.string().min(10, "El teléfono debe ser válido"),
    username: z.string().optional(),
    contrasena: z.string().optional(),
    role: z.enum(['Admin', 'Moderador', 'Obrero']),
});

export function UserForm({ user, currentUserRole }: UserFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const isEditing = !!user;
    const [showPassword, setShowPassword] = useState(false);
    
    const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });

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
    
    const roleWatcher = form.watch('role');

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
        
        if (!isEditing && values.role === 'Admin' && !values.contrasena) {
            form.setError("contrasena", { type: "manual", message: "La contraseña es obligatoria para nuevos Admins." });
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
            
            if (!isEditing && values.role === 'Moderador' && result.data?.generatedPassword) {
                setGeneratedCredentials({
                    username: result.data.username,
                    password: result.data.generatedPassword
                });
                setShowCredentialsDialog(true);
            } else {
                router.push('/personal/usuarios');
                router.refresh();
            }
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }
    
    const canSelectRole = currentUserRole === 'Admin';
    const showCredentialsFields = 
        (isEditing && (roleWatcher === 'Admin' || roleWatcher === 'Moderador')) ||
        (!isEditing && roleWatcher === 'Admin');


    const handleCopyToClipboard = () => {
        const credentialsText = `Usuario: ${generatedCredentials.username}\nContraseña: ${generatedCredentials.password}`;
        navigator.clipboard.writeText(credentialsText);
        toast({ title: 'Copiado', description: 'Credenciales copiadas al portapapeles.' });
    };

    return (
        <>
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
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>
                            <Card>
                            <CardHeader>
                                <CardTitle>Información de la Cuenta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!canSelectRole || isEditing}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Seleccione un rol" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currentUserRole === 'Admin' && <SelectItem value="Admin">Admin</SelectItem>}
                                                {currentUserRole === 'Admin' && <SelectItem value="Moderador">Moderador</SelectItem>}
                                                <SelectItem value="Obrero">Obrero</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                {showCredentialsFields ? (
                                    <>
                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem><FormLabel>Usuario</FormLabel><FormControl><Input {...field} disabled={isEditing} /></FormControl><FormMessage /></FormItem>
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
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground p-4 border-dashed border rounded-lg">
                                       {roleWatcher === 'Obrero' && !isEditing ? 'Las credenciales para Obreros se generan automáticamente (Cédula/Cédula).' :
                                        roleWatcher === 'Moderador' && !isEditing ? 'Las credenciales para Moderadores se generarán automáticamente.' :
                                        'Este rol no requiere credenciales manuales.'}
                                    </div>
                                )}
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

            <AlertDialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¡Moderador Creado Exitosamente!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Guarde estas credenciales en un lugar seguro.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4 space-y-3 rounded-md border bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Usuario</p>
                                <p className="font-mono font-semibold">{generatedCredentials.username}</p>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                             <div>
                                <p className="text-sm text-muted-foreground">Contraseña</p>
                                <p className="font-mono font-semibold">{generatedCredentials.password}</p>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Credenciales
                            </Button>
                        </div>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogAction onClick={() => {
                            setShowCredentialsDialog(false);
                            router.push('/personal/usuarios');
                            router.refresh();
                        }}>
                           Cerrar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
