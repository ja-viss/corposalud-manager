
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
import { createWorkReport, updateWorkReport, getWorkReportById } from "@/app/actions";
import type { Crew, PopulatedWorkReport, ToolEntry, PopulatedCrew } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Users, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import QRCode from "react-qr-code";
import ReactDOMServer from 'react-dom/server';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const generateWorkReportPDF = (report: PopulatedWorkReport) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const primaryColorH = 173;
    const headerColor = hslToRgb(primaryColorH, 80, 30);
    const textColor = [255, 255, 255];
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Trabajo', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(report.crewId?.nombre || 'N/A', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`ID: ${report.id.slice(-6).toUpperCase()} | Fecha: ${format(new Date(report.fecha), "dd/MM/yyyy", { locale: es })}`, pageWidth / 2, 34, { align: 'center' });
    

    // --- Body ---
    let startY = 50;

    // Crew Description
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción de la Cuadrilla:', 14, startY);
    startY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const splitDescription = doc.splitTextToSize(report.crewId?.descripcion || 'No disponible.', pageWidth - 28);
    doc.text(splitDescription, 14, startY);
    startY += (splitDescription.length * 5) + 5;


    // Basic Info
    doc.autoTable({
        startY: startY,
        body: [
            ['Municipio', report.municipio],
            ['Distancia (m)', report.distancia.toString()],
            ['Comentarios', report.comentarios || 'Sin comentarios.'],
        ],
        theme: 'grid',
        headStyles: { fillColor: headerColor, textColor: textColor },
        styles: { fontSize: 10, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
    
    // Tools
    if (report.herramientasUtilizadas && report.herramientasUtilizadas.length > 0) {
        doc.autoTable({
            startY: startY,
            head: [['Herramienta', 'Utilizadas', 'Dañadas', 'Extraviadas']],
            body: report.herramientasUtilizadas.map(tool => {
                const damaged = report.herramientasDanadas?.find(d => d.nombre === tool.nombre)?.cantidad || 0;
                const lost = report.herramientasExtraviadas?.find(l => l.nombre === tool.nombre)?.cantidad || 0;
                return [tool.nombre, tool.cantidad, damaged, lost];
            }),
            headStyles: { fillColor: headerColor, textColor: textColor },
        });
        startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Crew Members
    if (report.crewId) {
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.text('Miembros de la Cuadrilla', 14, startY);
        startY += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Moderador: ${report.crewId.moderadores.map(m => `${m.nombre} ${m.apellido}`).join(', ')}`, 14, startY);
        startY += 8;
        
        doc.autoTable({
            startY: startY,
            head: [['Nombre', 'Apellido']],
            body: report.crewId.obreros.map(obrero => [obrero.nombre, obrero.apellido]),
            headStyles: { fillColor: headerColor, textColor: textColor },
        });
    }

    // --- Footer ---
    const qrCodeAsString = ReactDOMServer.renderToString(
        <QRCode value={report.id} size={30} bgColor="#ffffff" fgColor="#000000" />
    );

    const qrX = 14;
    const qrY = pageHeight - 35;
    doc.addSVG(qrCodeAsString, qrX, qrY, 30, 30);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Escanee para ver detalles completos del reporte.', qrX + 35, qrY + 18);
    doc.text(`Página 1 de 1`, pageWidth - 25, pageHeight - 10);

    doc.save(`reporte-${(report.crewId?.nombre || 'cuadrilla').replace(/\s/g, '_')}-${format(new Date(report.fecha), "yyyy-MM-dd")}.pdf`);
};

// HSL to RGB conversion function
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}


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
    
    // Check if at least one tool with a quantity > 0 is provided
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
        
        // Check if quantity is greater than 0
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
    const isEditing = !!report;


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange", // Validar en cada cambio
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
            comentarios: values.comentarios?.trim() === '' ? 'Reporte de trabajo sin comentario' : values.comentarios,
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
            generateWorkReportPDF(result.data);
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
    );
}

    