"use client";

import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createUser, updateUser } from "@/app/actions";
import type { User, UserRole } from '@/lib/types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: () => void;
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

export function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!user;

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
        } else {
             form.reset({
                nombre: "",
                apellido: "",
                cedula: "",
                email: "",
                telefono: "",
                username: "",
                contrasena: "",
                role: "Obrero",
            });
        }
    }, [user, isEditing, form, isOpen]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSubmit = { ...values, role: values.role as UserRole };
        
        if (!isEditing && !values.contrasena) {
            form.setError("contrasena", { type: "manual", message: "La contraseña es obligatoria para nuevos usuarios." });
            return;
        }
        
        if (isEditing && user) {
            const result = await updateUser(user.id, dataToSubmit);
            if (result.success) {
                toast({ title: "Éxito", description: result.message });
                onSave();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } else {
            const result = await createUser(dataToSubmit);
            if (result.success) {
                toast({ title: "Éxito", description: result.message });
                onSave();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                    <DialogDescription>
                        Complete el formulario para {isEditing ? "actualizar el" : "agregar un nuevo"} usuario.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 sm:grid-cols-2">
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
                        <FormField control={form.control} name="email" className="sm:col-span-2" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="username" render={({ field }) => (
                            <FormItem><FormLabel>Usuario</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contrasena" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl><Input type="password" placeholder={isEditing ? "Dejar en blanco para no cambiar" : ""} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="role" className="sm:col-span-2" render={({ field }) => (
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
                         <DialogFooter className="sm:col-span-2 pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                            <Button type="submit">Guardar Usuario</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}