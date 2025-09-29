
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createCrew, updateCrew, getUsers } from "@/app/actions";
import type { Crew, User } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface CrewFormProps {
    crew?: Crew | null;
}

const formSchema = z.object({
    descripcion: z.string().optional(),
    moderadores: z.array(z.string()).min(1, "Debe seleccionar al menos un moderador."),
    obreros: z.array(z.string()).min(4, "Debe seleccionar al menos 4 obreros.").max(40, "No puede seleccionar más de 40 obreros."),
});

export function CrewForm({ crew }: CrewFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const isEditing = !!crew;
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            descripcion: "",
            moderadores: [],
            obreros: [],
        },
    });

    useEffect(() => {
        async function fetchUsers() {
            const usersResult = await getUsers({ role: ['Moderador', 'Obrero'] });
            if (usersResult.success) {
                setAllUsers(usersResult.data || []);
            }
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isEditing && crew) {
            form.reset({
                descripcion: crew.descripcion || "",
                moderadores: crew.moderadores.map(m => typeof m === 'string' ? m : m.id),
                obreros: crew.obreros.map(o => typeof o === 'string' ? o : o.id),
            });
        }
    }, [crew, isEditing, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = { ...values, nombre: crew?.nombre };
        
        let result;
        if (isEditing && crew) {
            result = await updateCrew(crew.id, payload);
        } else {
            result = await createCrew(payload);
        }
        
        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            router.push('/personal/cuadrillas');
            router.refresh();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }
    
    const moderadores = allUsers.filter(u => u.role === 'Moderador');
    const obreros = allUsers.filter(u => u.role === 'Obrero');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <Card>
                    <CardHeader><CardTitle>Descripción de Actividad</CardTitle></CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="descripcion" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Actividad de la Cuadrilla</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: Limpieza y mantenimiento del sector Barrio Obrero..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader><CardTitle>Moderadores</CardTitle></CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="moderadores" render={({ field }) => (
                                <FormItem>
                                    <ScrollArea className="h-72">
                                        <div className="p-1">
                                            {moderadores.map((mod) => (
                                                <div key={mod.id} className="flex items-center space-x-2 mb-2 p-2 rounded-md hover:bg-muted">
                                                    <Checkbox
                                                        id={`mod-${mod.id}`}
                                                        checked={field.value?.includes(mod.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, mod.id])
                                                                : field.onChange(field.value?.filter((value) => value !== mod.id))
                                                        }}
                                                    />
                                                    <Label htmlFor={`mod-${mod.id}`} className="font-normal w-full cursor-pointer">{mod.nombre} {mod.apellido}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader><CardTitle>Obreros</CardTitle></CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="obreros" render={({ field }) => (
                                <FormItem>
                                     <ScrollArea className="h-72">
                                         <div className="p-1">
                                            {obreros.map((obrero) => (
                                                <div key={obrero.id} className="flex items-center space-x-2 mb-2 p-2 rounded-md hover:bg-muted">
                                                    <Checkbox
                                                        id={`obrero-${obrero.id}`}
                                                        checked={field.value?.includes(obrero.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, obrero.id])
                                                                : field.onChange(field.value?.filter((value) => value !== obrero.id))
                                                        }}
                                                    />
                                                    <Label htmlFor={`obrero-${obrero.id}`} className="font-normal w-full cursor-pointer">{obrero.nombre} {obrero.apellido}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                     </Card>
                </div>
                
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/personal/cuadrillas">Cancelar</Link>
                    </Button>
                    <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Cuadrilla'}</Button>
                </div>
            </form>
        </Form>
    );
}

    
