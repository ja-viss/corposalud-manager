
"use client";

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';

interface WorkReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    crews: Crew[];
}

const toolEntrySchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido."),
    cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa.").default(0),
});

const formSchema = z.object({
    crewId: z.string().min(1, "Debe seleccionar una cuadrilla."),
    municipio: z.string().min(3, "El municipio es requerido."),
    distancia: z.coerce.number().min(0, "La distancia no puede ser negativa."),
    comentarios: z.string().min(10, "Los comentarios son requeridos."),
    herramientasUtilizadas: z.array(toolEntrySchema).min(1, "Debe agregar al menos una herramienta utilizada."),
    herramientasDanadas: z.array(toolEntrySchema).optional(),
    herramientasExtraviadas: z.array(toolEntrySchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkReportModal({ isOpen, onClose, crews }: WorkReportModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            crewId: "",
            municipio: "",
            distancia: 0,
            comentarios: "",
            herramientasUtilizadas: [{ nombre: "", cantidad: 0 }],
            herramientasDanadas: [{ nombre: "", cantidad: 0 }],
            herramientasExtraviadas: [{ nombre: "", cantidad: 0 }],
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
    
    const herramientasUtilizadasValues = form.watch('herramientasUtilizadas');

    useEffect(() => {
        if (!herramientasUtilizadasValues) return;

        const utilizadasLength = herramientasUtilizadasValues.length;
        const danadasLength = form.getValues('herramientasDanadas')?.length ?? 0;
        const extraviadasLength = form.getValues('herramientasExtraviadas')?.length ?? 0;

        // Sync Add
        if (utilizadasLength > danadasLength) {
            for (let i = danadasLength; i < utilizadasLength; i++) {
                danadasAppend({ nombre: herramientasUtilizadasValues[i]?.nombre || "", cantidad: 0 });
            }
        }
        if (utilizadasLength > extraviadasLength) {
            for (let i = extraviadasLength; i < utilizadasLength; i++) {
                extraviadasAppend({ nombre: herramientasUtilizadasValues[i]?.nombre || "", cantidad: 0 });
            }
        }
        
        // Sync Remove
        if (utilizadasLength < danadasLength) {
            for (let i = danadasLength - 1; i >= utilizadasLength; i--) {
                danadasRemove(i);
            }
        }
        if (utilizadasLength < extraviadasLength) {
            for (let i = extraviadasLength - 1; i >= utilizadasLength; i--) {
                extraviadasRemove(i);
            }
        }

        // Sync Name values
        herramientasUtilizadasValues.forEach((tool, index) => {
            const danadaValue = form.getValues(`herramientasDanadas.${index}.nombre`);
            const extraviadaValue = form.getValues(`herramientasExtraviadas.${index}.nombre`);

            if (tool.nombre !== danadaValue) {
                form.setValue(`herramientasDanadas.${index}.nombre`, tool.nombre, { shouldDirty: true });
            }
            if (tool.nombre !== extraviadaValue) {
                form.setValue(`herramientasExtraviadas.${index}.nombre`, tool.nombre, { shouldDirty: true });
            }
        });

    }, [herramientasUtilizadasValues, form, danadasAppend, danadasRemove, extraviadasAppend, extraviadasRemove]);

    async function onSubmit(values: FormValues) {
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
    
    const getFilteredCount = (fields: { nombre: string }[] | undefined) => {
        if (!fields) return 0;
        return fields.filter(field => field.nombre.trim() !== '').length;
    };

    const handleToolNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };


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
                                        <FormLabel>Distancia (m)</FormLabel>
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
                                <div className="flex items-center gap-2 mb-2">
                                    <FormLabel>Herramientas Utilizadas</FormLabel>
                                    <Badge variant="secondary">{getFilteredCount(form.getValues('herramientasUtilizadas'))}</Badge>
                                </div>
                                <div className="space-y-3">
                                    {utilizadasFields.map((field, index) => (
                                        <div key={field.id} className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                                            <FormField
                                                control={form.control}
                                                name={`herramientasUtilizadas.${index}.nombre`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow w-full">
                                                        <FormControl>
                                                            <Input 
                                                                placeholder={`Nombre Herramienta #${index + 1}`} 
                                                                {...field} 
                                                                onKeyDown={handleToolNameKeyDown}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name={`herramientasUtilizadas.${index}.cantidad`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-24">
                                                        <FormControl>
                                                            <Input type="number" placeholder="Cant." {...field} />
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
                                 <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={() => utilizadasAppend({ nombre: '', cantidad: 0 })}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Agregar Herramienta
                                </Button>
                                <FormField control={form.control} name="herramientasUtilizadas" render={({ field }) => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            
                            <Separator />

                             {/* Herramientas Dañadas */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FormLabel>Herramientas Dañadas</FormLabel>
                                     <Badge variant="destructive">{getFilteredCount(form.getValues('herramientasDanadas'))}</Badge>
                                </div>
                                <div className="space-y-3">
                                    {danadasFields.map((field, index) => (
                                         form.getValues(`herramientasDanadas.${index}.nombre`) && (
                                            <div key={field.id} className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                                                <FormItem className="flex-grow w-full">
                                                    <FormControl><Input disabled value={form.getValues(`herramientasDanadas.${index}.nombre`)} /></FormControl>
                                                </FormItem>
                                                <FormField
                                                    control={form.control}
                                                    name={`herramientasDanadas.${index}.cantidad`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full sm:w-24">
                                                            <FormControl>
                                                                <Input type="number" placeholder="Cant." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                         )
                                    ))}
                                </div>
                            </div>
                            
                            <Separator />

                            {/* Herramientas Extraviadas */}
                             <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FormLabel>Herramientas Extraviadas</FormLabel>
                                     <Badge variant="outline">{getFilteredCount(form.getValues('herramientasExtraviadas'))}</Badge>
                                </div>
                                <div className="space-y-3">
                                    {extraviadasFields.map((field, index) => (
                                         form.getValues(`herramientasExtraviadas.${index}.nombre`) && (
                                            <div key={field.id} className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                                                <FormItem className="flex-grow w-full">
                                                    <FormControl><Input disabled value={form.getValues(`herramientasExtraviadas.${index}.nombre`)} /></FormControl>
                                                </FormItem>
                                                <FormField
                                                    control={form.control}
                                                    name={`herramientasExtraviadas.${index}.cantidad`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full sm:w-24">
                                                            <FormControl>
                                                                <Input type="number" placeholder="Cant." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                         )
                                    ))}
                                </div>
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
