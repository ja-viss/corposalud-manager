
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
import { createWorkReport, updateWorkReport } from "@/app/actions";
import type { Crew, PopulatedWorkReport, PopulatedCrew, ToolEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Users, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// --- PDF Generation with @react-pdf/renderer ---

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v11/s-0ZQ3_2i_25c9Fh-2Kthw.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helvetica/v11/s-0ZQ3_2i_25c9Fh-2Kthw.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: '#0A534B',
        padding: 20,
        textAlign: 'center',
        color: 'white',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    headerMeta: {
        fontSize: 10,
        color: '#d1d5db',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#323232',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingBottom: 4,
    },
    section: {
        marginBottom: 15,
    },
    crewDescription: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    grid: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb'
    },
    gridColLabel: {
        width: '30%',
        padding: 5,
        backgroundColor: '#f9fafb',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        fontWeight: 'bold',
    },
    gridColValue: {
        width: '70%',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#e5e7eb',
        marginBottom: 10,
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row"
    },
    tableColHeader: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#0A534B',
        color: 'white',
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
        textAlign: 'center',
    },
    membersList: {
        paddingLeft: 10,
    },
    memberItem: {
        marginBottom: 3,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 8,
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey',
    },
});

const WorkReportPDF = ({ report }: { report: PopulatedWorkReport }) => {
    // Ensure data is safe to access
    const reportId = report?.id?.slice(-6).toUpperCase() ?? 'N/A';
    const reportDate = report?.fecha ? format(new Date(report.fecha), "dd/MM/yyyy", { locale: es }) : 'N/A';
    const crewName = report?.crewId?.nombre ?? 'Cuadrilla no especificada';
    const crewDescription = report?.crewId?.descripcion ?? 'No disponible.';
    const herramientasUtilizadas = report?.herramientasUtilizadas ?? [];
    const herramientasDanadas = report?.herramientasDanadas ?? [];
    const herramientasExtraviadas = report?.herramientasExtraviadas ?? [];
    const moderadores = report?.crewId?.moderadores ?? [];
    const obreros = report?.crewId?.obreros ?? [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Reporte de Trabajo</Text>
                    <Text style={styles.headerSubtitle}>{crewName}</Text>
                    <Text style={styles.headerMeta}>{`ID: ${reportId} | Fecha: ${reportDate}`}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción de la Cuadrilla</Text>
                    <Text style={styles.crewDescription}>{crewDescription}</Text>
                </View>

                <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Información General</Text>
                     <View style={styles.grid}>
                        <Text style={styles.gridColLabel}>Municipio</Text><Text style={styles.gridColValue}>{report.municipio}</Text>
                     </View>
                     <View style={styles.grid}>
                        <Text style={styles.gridColLabel}>Distancia (m)</Text><Text style={styles.gridColValue}>{report.distancia.toString()}</Text>
                     </View>
                     <View style={styles.grid}>
                        <Text style={styles.gridColLabel}>Comentarios</Text><Text style={styles.gridColValue}>{report.comentarios || 'Sin comentarios.'}</Text>
                     </View>
                </View>
                
                {herramientasUtilizadas.length > 0 && (
                     <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Herramientas</Text>
                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableColHeader}>Herramienta</Text><Text style={styles.tableColHeader}>Utilizadas</Text><Text style={styles.tableColHeader}>Dañadas</Text><Text style={styles.tableColHeader}>Extraviadas</Text>
                            </View>
                            {herramientasUtilizadas.map((tool: ToolEntry, index: number) => {
                                 const damaged = herramientasDanadas.find(d => d.nombre === tool.nombre)?.cantidad || 0;
                                 const lost = herramientasExtraviadas.find(l => l.nombre === tool.nombre)?.cantidad || 0;
                                return (
                                    <View style={styles.tableRow} key={index}>
                                        <Text style={styles.tableCol}>{tool.nombre}</Text><Text style={styles.tableCol}>{tool.cantidad}</Text><Text style={styles.tableCol}>{damaged}</Text><Text style={styles.tableCol}>{lost}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                {report.crewId && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Miembros de la Cuadrilla</Text>
                         <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Moderador:</Text>
                        <View style={styles.membersList}>
                            {moderadores.map(m => <Text key={m.id} style={styles.memberItem}>- {m.nombre} {m.apellido}</Text>)}
                        </View>
                        <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Obreros:</Text>
                        <View style={styles.membersList}>
                            {obreros.map(o => <Text key={o.id} style={styles.memberItem}>- {o.nombre} {o.apellido}</Text>)}
                        </View>
                    </View>
                )}
                
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

const generateWorkReportPDF = async (report: PopulatedWorkReport) => {
    const blob = await pdf(<WorkReportPDF report={report} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${(report.crewId?.nombre || 'cuadrilla').replace(/\s/g, '_')}-${format(new Date(report.fecha), "yyyy-MM-dd")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            comentarios: values.comentarios?.trim() === '' ? "Reporte sin comentarios" : values.comentarios,
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
            await generateWorkReportPDF(result.data);
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

    

    