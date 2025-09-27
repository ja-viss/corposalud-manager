"use client";

import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createCrew, updateCrew, getUsers } from "@/app/actions";
import type { Crew, User } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CrewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    crew: Crew | null;
    onSave: () => void;
}

const formSchema = z.object({
    moderadores: z.array(z.string()).min(1, "Debe seleccionar al menos un moderador."),
    obreros: z.array(z.string()).min(4, "Debe seleccionar al menos 4 obreros.").max(40, "No puede seleccionar más de 40 obreros."),
});

export function CrewFormModal({ isOpen, onClose, crew, onSave }: CrewFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!crew;
    const [moderadores, setModeradores] = useState<User[]>([]);
    const [obreros, setObreros] = useState<User[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moderadores: [],
            obreros: [],
        },
    });

    useEffect(() => {
        async function fetchUsers() {
            const [modResult, obreroResult] = await Promise.all([
                getUsers({ role: 'Moderador' }),
                getUsers({ role: 'Obrero' })
            ]);
            if (modResult.success) setModeradores(modResult.data || []);
            if (obreroResult.success) setObreros(obreroResult.data || []);
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isEditing && crew) {
            form.reset({
                moderadores: crew.moderadores.map(m => m.id),
                obreros: crew.obreros.map(o => o.id),
            });
        } else {
            form.reset({ moderadores: [], obreros: [] });
        }
    }, [crew, isEditing, form, isOpen]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = { ...values, nombre: crew?.nombre };
        if (isEditing && crew) {
            const result = await updateCrew(crew.id, payload);
            if (result.success) {
                toast({ title: "Éxito", description: result.message });
                onSave();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } else {
            const result = await createCrew(payload);
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
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Editar ${crew?.nombre}` : "Crear Nueva Cuadrilla"}</DialogTitle>
                    <DialogDescription>
                        Seleccione los miembros para {isEditing ? "actualizar la" : "crear una nueva"} cuadrilla. El nombre se asignará automáticamente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <FormField control={form.control} name="moderadores" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Moderadores</FormLabel>
                                    <ScrollArea className="h-48 rounded-md border p-4">
                                        {moderadores.map((mod) => (
                                            <div key={mod.id} className="flex items-center space-x-2 mb-2">
                                                <Checkbox
                                                    id={`mod-${mod.id}`}
                                                    checked={field.value?.includes(mod.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, mod.id])
                                                            : field.onChange(field.value?.filter((value) => value !== mod.id))
                                                    }}
                                                />
                                                <Label htmlFor={`mod-${mod.id}`} className="font-normal">{mod.nombre} {mod.apellido}</Label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="obreros" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Obreros</FormLabel>
                                     <ScrollArea className="h-48 rounded-md border p-4">
                                        {obreros.map((obrero) => (
                                            <div key={obrero.id} className="flex items-center space-x-2 mb-2">
                                                <Checkbox
                                                    id={`obrero-${obrero.id}`}
                                                    checked={field.value?.includes(obrero.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, obrero.id])
                                                            : field.onChange(field.value?.filter((value) => value !== obrero.id))
                                                    }}
                                                />
                                                <Label htmlFor={`obrero-${obrero.id}`} className="font-normal">{obrero.nombre} {obrero.apellido}</Label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                         <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                            <Button type="submit">Guardar Cuadrilla</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
