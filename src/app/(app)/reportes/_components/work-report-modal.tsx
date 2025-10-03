
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { createWorkReport, updateWorkReport } from "@/app/actions";
import type { Crew, PopulatedWorkReport, PopulatedCrew, ToolEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Users, FileText, FileDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// HSL to RGB conversion function for PDF styling
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

const generateWorkReportPDF = (report: PopulatedWorkReport) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173;
    const headerColor = hslToRgb(primaryColorH, 80, 30);

    const reportId = report?._id?.slice(-6).toUpperCase() ?? 'N/A';
    const reportDate = report?.fecha ? format(new Date(report.fecha), "dd/MM/yyyy", { locale: es }) : 'N/A';
    const crewName = report?.crewId?.nombre ?? 'Cuadrilla no especificada';

    // Header
    doc.setFontSize(18);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text("Reporte de Trabajo", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${crewName} - ${reportDate} (ID: ${reportId})`, 14, 29);

    // Body
    let yPos = 40;

    const addSection = (title: string, body: () => void) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        body();
        yPos += 10;
    };

    addSection("Información General", () => {
        doc.autoTable({
            startY: yPos,
            body: [
                ['Municipio', report.municipio],
                ['Distancia (m)', report.distancia.toString()],
                ['Descripción Cuadrilla', report.crewId?.descripcion || 'N/A'],
                ['Comentarios', report.comentarios || 'Sin comentarios.'],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });
        yPos = (doc as any).lastAutoTable.finalY;
    });
    
    if (report.herramientasUtilizadas && report.herramientasUtilizadas.length > 0) {
        addSection("Herramientas", () => {
            const body = (report.herramientasUtilizadas ?? []).map(tool => {
                const damaged = report.herramientasDanadas?.find(d => d.nombre === tool.nombre)?.cantidad || 0;
                const lost = report.herramientasExtraviadas?.find(l => l.nombre === tool.nombre)?.cantidad || 0;
                return [tool.nombre, tool.cantidad, damaged, lost];
            });

            doc.autoTable({
                startY: yPos,
                head: [['Herramienta', 'Utilizadas', 'Dañadas', 'Extraviadas']],
                body: body,
                theme: 'striped',
                headStyles: { fillColor: headerColor },
            });
            yPos = (doc as any).lastAutoTable.finalY;
        });
    }

     if (report.crewId) {
        addSection("Miembros de la Cuadrilla", () => {
            const moderador = (report.crewId?.moderadores ?? []).map(m => `${m.nombre} ${m.apellido}`).join(', ');
            const obreros = (report.crewId?.obreros ?? []).map(o => `- ${o.nombre} ${o.apellido}`).join('\n');
            doc.setFontSize(9);
            doc.text(`Moderador: ${moderador}`, 14, yPos);
            yPos += 7;
            doc.text("Obreros:", 14, yPos);
            yPos += 5;
            doc.text(obreros, 14, yPos);
        });
    }

    doc.save(`reporte-${crewName.replace(/\s/g, '_')}-${reportDate}.pdf`);
};



interface WorkReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    crews: Crew[];
    report?: PopulatedWorkReport | null;
    onReportSaved: () => void;
}

const toolEntrySchema = z.object({
    nombre: z.string().optional().or(z.literal('')),
    cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa.").default(0),
});

const formSchema = z.object({
    crewId: z.string().min(1, "Debe seleccionar una cuadrilla."),
    municipio: z.string().min(3, "El municipio es requerido."),
    distancia: z.coerce.number().min(0, "La distancia no puede ser negativa."),
    comentarios: z.string().optional(),
    herramientasUtilizadas: z.array(toolEntrySchema).optional(),
    herramientasDanadas: z.array(toolEntrySchema).optional(),
    herramientasExtraviadas: z.array(toolEntrySchema).optional(),
}).superRefine((data, ctx) => {
    const utilizadas = data.herramientasUtilizadas || [];
    
    const hasAtLeastOneTool = utilizadas.some(tool => tool.nombre && tool.nombre.trim() !== '' && tool.cantidad > 0);
    if (!hasAtLeastOneTool) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [`herramientasUtilizadas`],
            message: "Debe registrar al menos una herramienta con una cantidad mayor a cero.",
        });
    }

    utilizadas.forEach((tool, index) => {
        if (!tool.nombre || tool.nombre.trim() === '') return;
        
        if (tool.cantidad <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`herramientasUtilizadas`, index, `cantidad`],
                message: "La cantidad debe ser mayor a 0.",
            });
        }
        
        const cantidadUtilizada = tool.cantidad || 0;
        const cantidadDanada = data.herramientasDanadas?.[index]?.cantidad ?? 0;
        const cantidadExtraviada = data.herramientasExtraviadas?.[index]?.cantidad ?? 0;

        if (cantidadDanada + cantidadExtraviada > cantidadUtilizada) {
             const message = `La suma de dañadas (${cantidadDanada}) y extraviadas (${cantidadExtraviada}) no puede superar el total (${cantidadUtilizada}).`;
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`herramientasDanadas`, index, `cantidad`],
                message: message,
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`herramientasExtraviadas`, index, `cantidad`],
                message: " ",
            });
        }
    });
});


type FormValues = z.infer<typeof formSchema>;

const CrewInfo = ({ crew }: { crew: Crew | PopulatedCrew | null }) => {
  if (!crew) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg p-4">
        <FileText className="h-10 w-10 mb-4" />
        <h3 className="font-semibold">Seleccione una cuadrilla</h3>
        <p className="text-sm">La información de la cuadrilla aparecerá aquí una vez que la seleccione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuadrilla</CardTitle>
          <CardDescription>{crew.nombre}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-sm mb-2">Descripción de Actividad:</h4>
          <p className="text-sm text-muted-foreground">{crew.descripcion || "No hay descripción disponible."}</p>
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
            {Array.isArray(crew.moderadores) && crew.moderadores.map(m => <li key={m.id}>{m.nombre} {m.apellido}</li>)}
          </ul>
          <h4 className="font-semibold text-sm mt-4 mb-2">Obreros:</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {Array.isArray(crew.obreros) && crew.obreros.map(o => <li key={o.id}>{o.nombre} {o.apellido}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};


export function WorkReportModal({ isOpen, onClose, crews, report, onReportSaved }: WorkReportModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCrew, setSelectedCrew] = useState<Crew | PopulatedCrew | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newReportData, setNewReportData] = useState<PopulatedWorkReport | null>(null);
    const isEditing = !!report;


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
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

    const { fields: utilizadasFields, append: utilizadasAppend, remove: utilizadasRemove, update: utilizadasUpdate } = useFieldArray({
        control: form.control, name: "herramientasUtilizadas",
    });
    const { fields: danadasFields, update: danadasUpdate } = useFieldArray({
        control: form.control, name: "herramientasDanadas",
    });
    const { fields: extraviadasFields, update: extraviadasUpdate } = useFieldArray({
        control: form.control, name: "herramientasExtraviadas",
    });

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
                herramientasUtilizadas: report.herramientasUtilizadas?.length ? report.herramientasUtilizadas : [{ nombre: "", cantidad: 0 }],
                herramientasDanadas: report.herramientasDanadas?.length ? report.herramientasDanadas : [{ nombre: "", cantidad: 0 }],
                herramientasExtraviadas: report.herramientasExtraviadas?.length ? report.herramientasExtraviadas : [{ nombre: "", cantidad: 0 }],
            });
        } else {
             form.reset({
                crewId: "",
                municipio: "",
                distancia: 0,
                comentarios: "",
                herramientasUtilizadas: [{ nombre: "", cantidad: 0 }],
                herramientasDanadas: [{ nombre: "", cantidad: 0 }],
                herramientasExtraviadas: [{ nombre: "", cantidad: 0 }],
            });
        }
    }, [isEditing, report, form, isOpen]);
    
    const handleAddTool = () => {
        utilizadasAppend({ nombre: '', cantidad: 0 });
        danadasUpdate(utilizadasFields.length, { nombre: '', cantidad: 0 });
        extraviadasUpdate(utilizadasFields.length, { nombre: '', cantidad: 0 });
    };

    const handleRemoveTool = (index: number) => {
        utilizadasRemove(index);
    };

    async function onSubmit(values: FormValues) {
        setIsLoading(true);

        const finalValues = {
            ...values,
            comentarios: values.comentarios?.trim() || "Reporte sin comentarios",
            herramientasUtilizadas: values.herramientasUtilizadas?.filter(t => t.nombre && t.nombre.trim() !== '' && t.cantidad > 0),
            herramientasDanadas: values.herramientasDanadas?.filter(t => t.nombre && t.nombre.trim() !== ''),
            herramientasExtraviadas: values.herramientasExtraviadas?.filter(t => t.nombre && t.nombre.trim() !== ''),
        };

        let result;
        if (isEditing && report) {
            result = await updateWorkReport(report.id, finalValues);
        } else {
            result = await createWorkReport(finalValues);
        }

        if (result.success && result.data) {
            toast({ title: "Éxito", description: result.message });
            setNewReportData(result.data);
            setShowSuccessModal(true);
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

    const handleExport = () => {
        if (newReportData) {
            generateWorkReportPDF(newReportData);
        }
    };

    return (
        <>
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
                            {/* Main Form Area */}
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
                                    
                                    {/* Mobile Crew Info */}
                                    <div className="block md:hidden mt-4">
                                        <CrewInfo crew={selectedCrew} />
                                    </div>

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
                                        <FormMessage>{form.formState.errors.herramientasUtilizadas?.message}</FormMessage>
                                        <div className="space-y-3 mt-2">
                                            {utilizadasFields.map((field, index) => (
                                                <div key={field.id} className="flex items-start gap-2">
                                                    <FormField control={form.control} name={`herramientasUtilizadas.${index}.nombre`} render={({ field }) => (
                                                        <FormItem className="flex-grow">
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder={`Herramienta #${index + 1}`} {...field} 
                                                                    onKeyDown={handleToolNameKeyDown}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                        danadasUpdate(index, { ...form.getValues(`herramientasDanadas.${index}`), nombre: e.target.value });
                                                                        extraviadasUpdate(index, { ...form.getValues(`herramientasExtraviadas.${index}`), nombre: e.target.value });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`herramientasUtilizadas.${index}.cantidad`} render={({ field }) => (
                                                        <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveTool(index)} disabled={utilizadasFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="mt-3 gap-1" onClick={handleAddTool}><PlusCircle className="h-3.5 w-3.5" />Agregar Herramienta</Button>
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
                                                            <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} /></FormControl><FormMessage />
                                                        </FormItem>
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
                                                            <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cant." {...field} /></FormControl><FormMessage />
                                                        </FormItem>
                                                        )} />
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            {/* Desktop Crew Info */}
                            <ScrollArea className="h-full hidden md:block">
                                <CrewInfo crew={selectedCrew} />
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

            <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¡Reporte Guardado Exitosamente!</AlertDialogTitle>
                    <AlertDialogDescription>
                    El reporte de trabajo ha sido almacenado en el sistema. Puede exportarlo como PDF ahora.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNewReportData(null)}>Cerrar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExport} className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar a PDF
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
