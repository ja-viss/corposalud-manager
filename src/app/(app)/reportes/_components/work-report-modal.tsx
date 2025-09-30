
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
import { createWorkReport, getCrewById, updateWorkReport } from "@/app/actions";
import type { Crew, PopulatedWorkReport, ToolEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Users, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface WorkReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    crews: Crew[];
    report?: PopulatedWorkReport | null; // Add report prop for editing
    onReportSaved: () => void;
}

const toolEntrySchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido.").optional().or(z.literal('')),
    cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa.").default(0),
});

const formSchema = z.object({
    crewId: z.string().min(1, "Debe seleccionar una cuadrilla."),
    municipio: z.string().min(3, "El municipio es requerido."),
    distancia: z.coerce.number().min(0, "La distancia no puede ser negativa."),
    comentarios: z.string().min(10, "Los comentarios son requeridos."),
    herramientasUtilizadas: z.array(toolEntrySchema).optional(),
    herramientasDanadas: z.array(toolEntrySchema).optional(),
    herramientasExtraviadas: z.array(toolEntrySchema).optional(),
}).refine((data) => {
    // For each used tool, check if the sum of damaged and lost tools exceeds the used quantity.
    if (!data.herramientasUtilizadas) return true;
    for (let i = 0; i < data.herramientasUtilizadas.length; i++) {
        const utilizada = data.herramientasUtilizadas[i];
        if (!utilizada.nombre) continue; // Skip validation for empty tool names

        const danada = data.herramientasDanadas?.[i]?.cantidad ?? 0;
        const extraviada = data.herramientasExtraviadas?.[i]?.cantidad ?? 0;
        
        if (danada + extraviada > utilizada.cantidad) {
            return false;
        }
    }
    return true;
}, {
    message: "La suma de herramientas dañadas y extraviadas no puede superar el total de utilizadas.",
    path: ["herramientasDanadas"], 
});


type FormValues = z.infer<typeof formSchema>;

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function WorkReportModal({ isOpen, onClose, crews, report, onReportSaved }: WorkReportModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
    const isEditing = !!report;


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            crewId: "",
            municipio: "",
            distancia: 0,
            comentarios: "",
            herramientasUtilizadas: [{ nombre: "", cantidad: 0 }],
            herramientasDanadas: [],
            herramientasExtraviadas: [],
        },
    });

    const { fields: utilizadasFields, append: utilizadasAppend, remove: utilizadasRemove } = useFieldArray({
        control: form.control, name: "herramientasUtilizadas",
    });
    const { fields: danadasFields } = useFieldArray({
        control: form.control, name: "herramientasDanadas",
    });
    const { fields: extraviadasFields } = useFieldArray({
        control: form.control, name: "herramientasExtraviadas",
    });

    const herramientasUtilizadasValues = form.watch('herramientasUtilizadas');
    const crewIdWatcher = form.watch('crewId');

     useEffect(() => {
        const crewToSet = isEditing ? (report?.crewId as Crew) : crews.find(c => c.id === crewIdWatcher);
        setSelectedCrew(crewToSet || null);
    }, [crewIdWatcher, crews, isEditing, report]);


    useEffect(() => {
        if (isEditing && report) {
            form.reset({
                crewId: (report.crewId as Crew)?.id || '',
                municipio: report.municipio,
                distancia: report.distancia,
                comentarios: report.comentarios,
                herramientasUtilizadas: report.herramientasUtilizadas,
                herramientasDanadas: report.herramientasDanadas,
                herramientasExtraviadas: report.herramientasExtraviadas,
            });
        } else {
             form.reset({
                crewId: "",
                municipio: "",
                distancia: 0,
                comentarios: "",
                herramientasUtilizadas: [{ nombre: "", cantidad: 0 }],
                herramientasDanadas: [],
                herramientasExtraviadas: [],
            });
        }
    }, [isEditing, report, form]);
    
     // Sync logic for tool arrays
    useEffect(() => {
        if (!herramientasUtilizadasValues) return;
        
        const currentDanadas = form.getValues('herramientasDanadas') || [];
        const currentExtraviadas = form.getValues('herramientasExtraviadas') || [];

        const newDanadas = herramientasUtilizadasValues.map((tool, index) => ({
            nombre: tool.nombre,
            cantidad: currentDanadas[index]?.cantidad ?? 0,
        }));
        const newExtraviadas = herramientasUtilizadasValues.map((tool, index) => ({
            nombre: tool.nombre,
            cantidad: currentExtraviadas[index]?.cantidad ?? 0,
        }));

        form.setValue('herramientasDanadas', newDanadas, { shouldValidate: true });
        form.setValue('herramientasExtraviadas', newExtraviadas, { shouldValidate: true });

    }, [herramientasUtilizadasValues, form]);


    // Real-time validation logic
    const validateToolQuantities = (index: number) => {
        const utilizadas = form.getValues(`herramientasUtilizadas.${index}.cantidad`) || 0;
        const danadas = form.getValues(`herramientasDanadas.${index}.cantidad`) || 0;
        const extraviadas = form.getValues(`herramientasExtraviadas.${index}.cantidad`) || 0;

        if (danadas + extraviadas > utilizadas) {
            form.setError(`herramientasDanadas.${index}.cantidad`, {
                type: 'manual',
                message: `La suma de dañadas (${danadas}) y extraviadas (${extraviadas}) no puede superar el total (${utilizadas}).`
            });
             form.setError(`herramientasExtraviadas.${index}.cantidad`, {
                type: 'manual',
                message: `La suma de dañadas (${danadas}) y extraviadas (${extraviadas}) no puede superar el total (${utilizadas}).`
            });
        } else {
            form.clearErrors(`herramientasDanadas.${index}.cantidad`);
            form.clearErrors(`herramientasExtraviadas.${index}.cantidad`);
        }
    };


    async function onSubmit(values: FormValues) {
        setIsLoading(true);

        const finalValues = {
            ...values,
            herramientasUtilizadas: values.herramientasUtilizadas?.filter(t => t.nombre && t.nombre.trim() !== ''),
            herramientasDanadas: values.herramientasDanadas?.filter(t => t.nombre && t.nombre.trim() !== ''),
            herramientasExtraviadas: values.herramientasExtraviadas?.filter(t => t.nombre && t.nombre.trim() !== ''),
        };


        let result;
        if (isEditing && report) {
            result = await updateWorkReport(report.id, finalValues);
        } else {
            result = await createWorkReport(finalValues);
        }

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onReportSaved();
            handleClose();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
    }
    
    const handleClose = () => {
        form.reset();
        setSelectedCrew(null);
        onClose();
    }
    
    const handleToolNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Reporte de Trabajo' : 'Crear Reporte de Trabajo'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Actualice los detalles de la actividad.' : 'Complete los detalles de la actividad realizada por la cuadrilla.'}
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[65vh]">
                           {/* Left Column: Form Fields */}
                           <ScrollArea className="h-full pr-4">
                             <div className="space-y-4">
                                <FormField control={form.control} name="crewId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cuadrilla</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una cuadrilla" /></SelectTrigger></FormControl>
                                            <SelectContent>{crews.map(crew => (<SelectItem key={crew.id} value={crew.id}>{crew.nombre}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="municipio" render={({ field }) => (
                                        <FormItem><FormLabel>Municipio</FormLabel><FormControl><Input placeholder="Ej: San Cristóbal" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="distancia" render={({ field }) => (
                                        <FormItem><FormLabel>Distancia (m)</FormLabel><FormControl><Input type="number" placeholder="Ej: 15.5" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="comentarios" render={({ field }) => (
                                    <FormItem><FormLabel>Comentarios de la Actividad</FormLabel><FormControl><Textarea placeholder="Describa el trabajo realizado..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <Separator />
                                <div>
                                    <FormLabel>Herramientas Utilizadas</FormLabel>
                                    <div className="space-y-3 mt-2">
                                        {utilizadasFields.map((field, index) => (
                                            <div key={field.id} className="flex items-start gap-2">
                                                <FormField control={form.control} name={`herramientasUtilizadas.${index}.nombre`} render={({ field }) => (
                                                    <FormItem className="flex-grow"><FormControl><Input placeholder={`Herramienta #${index + 1}`} {...field} onKeyDown={handleToolNameKeyDown} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name={`herramientasUtilizadas.${index}.cantidad`} render={({ field }) => (
                                                    <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} onChange={(e) => { field.onChange(e); validateToolQuantities(index); }} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <Button type="button" variant="destructive" size="icon" onClick={() => utilizadasRemove(index)} disabled={utilizadasFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={() => utilizadasAppend({ nombre: '', cantidad: 0 })}><PlusCircle className="h-3.5 w-3.5" />Agregar Herramienta</Button>
                                    <FormField control={form.control} name="herramientasUtilizadas" render={() => (<FormItem><FormMessage /></FormItem>)} />
                                </div>
                                <Separator />
                                <div>
                                    <FormLabel>Herramientas Dañadas</FormLabel>
                                    <div className="space-y-3 mt-2">
                                        {danadasFields.map((field, index) => (
                                            form.getValues(`herramientasUtilizadas.${index}.nombre`) && (
                                                <div key={field.id} className="flex items-start gap-2">
                                                    <FormItem className="flex-grow"><FormControl><Input disabled value={form.getValues(`herramientasUtilizadas.${index}.nombre`)} /></FormControl></FormItem>
                                                    <FormField control={form.control} name={`herramientasDanadas.${index}.cantidad`} render={({ field }) => (
                                                        <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} onChange={(e) => { field.onChange(e); validateToolQuantities(index); }} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <FormLabel>Herramientas Extraviadas</FormLabel>
                                    <div className="space-y-3 mt-2">
                                        {extraviadasFields.map((field, index) => (
                                             form.getValues(`herramientasUtilizadas.${index}.nombre`) && (
                                                <div key={field.id} className="flex items-start gap-2">
                                                    <FormItem className="flex-grow"><FormControl><Input disabled value={form.getValues(`herramientasUtilizadas.${index}.nombre`)} /></FormControl></FormItem>
                                                    <FormField control={form.control} name={`herramientasExtraviadas.${index}.cantidad`} render={({ field }) => (
                                                        <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} onChange={(e) => { field.onChange(e); validateToolQuantities(index); }} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                </div>
                                             )
                                        ))}
                                    </div>
                                </div>
                             </div>
                           </ScrollArea>
                           {/* Right Column: Crew Info */}
                           <ScrollArea className="h-full">
                               {selectedCrew ? (
                                   <div className="space-y-4">
                                       <Card>
                                           <CardHeader>
                                                <CardTitle>Información de la Cuadrilla</CardTitle>
                                                <CardDescription>{selectedCrew.nombre}</CardDescription>
                                           </CardHeader>
                                           <CardContent>
                                               <h4 className="font-semibold text-sm mb-2">Descripción de Actividad:</h4>
                                               <p className="text-sm text-muted-foreground">{selectedCrew.descripcion || "No hay descripción disponible."}</p>
                                           </CardContent>
                                       </Card>
                                       <Card>
                                           <CardHeader>
                                                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Miembros</CardTitle>
                                                <CardDescription>Personal asignado a esta cuadrilla.</CardDescription>
                                           </CardHeader>
                                           <CardContent>
                                               <h4 className="font-semibold text-sm mb-2">Moderador:</h4>
                                               <ul className="text-sm text-muted-foreground list-disc pl-5">
                                                   {selectedCrew.moderadores.map(m => <li key={m.id}>{m.nombre} {m.apellido}</li>)}
                                               </ul>
                                               <h4 className="font-semibold text-sm mt-4 mb-2">Obreros:</h4>
                                                <ul className="text-sm text-muted-foreground list-disc pl-5 grid grid-cols-2 gap-x-4">
                                                   {selectedCrew.obreros.map(o => <li key={o.id}>{o.nombre} {o.apellido}</li>)}
                                               </ul>
                                           </CardContent>
                                       </Card>
                                   </div>
                               ) : (
                                   <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg p-4">
                                       <FileText className="h-10 w-10 mb-4" />
                                       <h3 className="font-semibold">Seleccione una cuadrilla</h3>
                                       <p className="text-sm">La información de la cuadrilla aparecerá aquí una vez que la seleccione.</p>
                                   </div>
                               )}
                           </ScrollArea>
                       </div>
                        <DialogFooter className="pt-6">
                            <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Reporte')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

    