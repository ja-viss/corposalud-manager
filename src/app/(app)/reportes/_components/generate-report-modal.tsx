"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDays, format } from "date-fns";
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateReport } from "@/app/actions";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface GenerateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReportGenerated: () => void;
}

const formSchema = z.object({
    tipo: z.enum(['Maestro', 'Actividad'], { required_error: "Debe seleccionar un tipo de reporte." }),
    rangoFechas: z.object({
        from: z.date({ required_error: "Debe seleccionar una fecha de inicio." }),
        to: z.date({ required_error: "Debe seleccionar una fecha de fin." }),
    }),
});

export function GenerateReportModal({ isOpen, onClose, onReportGenerated }: GenerateReportModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rangoFechas: {
                from: new Date(),
                to: addDays(new Date(), 7),
            }
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        // TODO: De momento, el 'generadoPor' está quemado. Debe obtenerse del usuario en sesión.
        const result = await generateReport({ ...values, generadoPor: 'Admin' });

        if (result.success) {
            toast({ title: "Éxito", description: result.message });
            onReportGenerated();
            form.reset();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generar Nuevo Reporte</DialogTitle>
                    <DialogDescription>
                        Seleccione los parámetros para generar su reporte.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="tipo" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Reporte</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Maestro">Maestro</SelectItem>
                                        <SelectItem value="Actividad">Actividad</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="rangoFechas" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Rango de Fechas</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                    <>
                                                        {format(field.value.from, "LLL dd, y", { locale: es })} -{" "}
                                                        {format(field.value.to, "LLL dd, y", { locale: es })}
                                                    </>
                                                ) : (
                                                    format(field.value.from, "LLL dd, y", { locale: es })
                                                )
                                            ) : (
                                                <span>Seleccione un rango</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value?.from}
                                            selected={field.value as DateRange}
                                            onSelect={field.onChange}
                                            numberOfMonths={2}
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                         <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary" disabled={isLoading}>Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Generando..." : "Generar Reporte"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
