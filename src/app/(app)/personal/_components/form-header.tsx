
"use client";
/**
 * @file form-header.tsx
 * @description Componente reutilizable para las cabeceras de los formularios.
 * Muestra un título, una descripción y un botón de "volver" que es visible en dispositivos móviles.
 *
 * @requires react
 * @requires next/link
 * @requires @/components/ui/button
 * @requires lucide-react
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Props para el componente FormHeader.
 * @interface FormHeaderProps
 * @property {string} title - El título principal de la cabecera.
 * @property {string} description - Una breve descripción o subtítulo.
 * @property {string} backHref - La URL a la que debe navegar el botón de "volver".
 */
interface FormHeaderProps {
    title: string;
    description: string;
    backHref: string;
}

/**
 * Componente de cabecera para páginas de formulario (crear/editar).
 *
 * @param {FormHeaderProps} props - Las props del componente.
 * @returns {JSX.Element} La cabecera del formulario.
 */
export function FormHeader({ title, description, backHref }: FormHeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6">
            {/* Botón de volver, solo visible en dispositivos móviles */}
            <Button variant="outline" size="icon" className="md:hidden" asChild>
                <Link href={backHref}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Volver</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
