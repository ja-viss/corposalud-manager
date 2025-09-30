"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
    title: string;
    description: string;
    backHref: string;
}

export function FormHeader({ title, description, backHref }: FormHeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6">
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
