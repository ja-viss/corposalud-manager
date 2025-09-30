
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { createWorkReport } from "@/app/actions";
import type { Crew } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface WorkReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    crews: Crew[];
}

const formSchema = z.object({
    crewId: z.string().min(1, "Debe seleccionar una cuadrilla."),
    municipio: z.string().min(3, "El municipio es requerido."),
    distancia: z.coerce.number().min(0, "La distancia no puede ser negativa."),
    comentarios: z.string().min(10, "Los comentarios son requeridos."),
    herramientasUtilizadas: z.array(z.object({
        nombre: z.string().min(1, "El nombre de la herramienta es requerido."),
    })).optional(),
    herramientasDanadas: z.array(z.object({
        nombre: z.string().min(1, "El nombre de la herramienta es requerido."),
    })).optional(),
    herramientasExtraviadas: z.array(z.object({
        nombre: z.string().min(1, "El nombre de la herramienta es requerido."),
    })).optional(),
});

export function WorkReportModal({ isOpen, onClose, crews }: WorkReportModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            crewId: "",
            municipio: "",
            distancia: 0,
            comentarios: "",
            herramientasUtilizadas: [{ nombre: "" }],
            herramientasDanadas: [{ nombre: "" }],
            herramientasExtraviadas: [{ nombre: "" }],
        },
    });
    
    const { fields: utilizadasFields, append: utilizadasAppend, remove: utilizadasRemove } = useFieldArray({
        control: form.control,
        name: "herramientasUtilizadas",
    });
    const { fields: danadasFields, append: danadasAppend, remove: danadasRemove } = useFieldArray({
        control: form.control,
        name: "herramientasDanadas",
    });
    const { fields: extraviadasFields, append: extraviadasAppend, remove: extraviadasRemove } = useFieldArray({
        control: form.control,
        name: "herramientasExtraviadas",
    });


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const result = await createWorkReport(values);

        if (result.success) {
            toast({ title: "Éxito", description: "Reporte de trabajo creado exitosamente." });
            form.reset();
            onClose();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
    }
    
    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear Reporte de Trabajo</DialogTitle>
                    <DialogDescription>
                        Complete los detalles de la actividad realizada por la cuadrilla.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                       <ScrollArea className="h-[60vh] p-1">
                         <div className="space-y-4 px-4">
                            <FormField control={form.control} name="crewId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuadrilla</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Seleccione una cuadrilla" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {crews.map(crew => (
                                                <SelectItem key={crew.id} value={crew.id}>
                                                    {crew.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="municipio" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Municipio</FormLabel>
                                        <FormControl><Input placeholder="Ej: San Cristóbal" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="distancia" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Distancia (Km)</FormLabel>
                                        <FormControl><Input type="number" placeholder="Ej: 15.5" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="comentarios" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentarios de la Actividad</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describa el trabajo realizado, las condiciones y cualquier observación relevante." rows={5} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <Separator />

                            {/* Herramientas Utilizadas */}
                            <div>
                                <FormLabel>Herramientas Utilizadas</FormLabel>
                                <div className="mt-2 space-y-3">
                                    {utilizadasFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`herramientasUtilizadas.${index}.nombre`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Herramienta #${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => utilizadasRemove(index)} disabled={utilizadasFields.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                 <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={() => utilizadasAppend({ nombre: '' })}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Agregar Herramienta
                                </Button>
                            </div>
                            
                            <Separator />

                             {/* Herramientas Dañadas */}
                            <div>
                                <FormLabel>Herramientas Dañadas</FormLabel>
                                <div className="mt-2 space-y-3">
                                    {danadasFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`herramientasDanadas.${index}.nombre`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Herramienta #${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => danadasRemove(index)} disabled={danadasFields.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                 <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={() => danadasAppend({ nombre: '' })}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Agregar Herramienta
                                </Button>
                            </div>
                            
                            <Separator />

                            {/* Herramientas Extraviadas */}
                            <div>
                                <FormLabel>Herramientas Extraviadas</FormLabel>
                                <div className="mt-2 space-y-3">
                                    {extraviadasFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`herramientasExtraviadas.${index}.nombre`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Herramienta #${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => extraviadasRemove(index)} disabled={extraviadasFields.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                 <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={() => extraviadasAppend({ nombre: '' })}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Agregar Herramienta
                                </Button>
                            </div>
                        </div>
                       </ScrollArea>
                        <DialogFooter className="pt-6">
                            <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar Reporte'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

    
