"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const activeTab = pathname.includes('/cuadrillas') ? 'cuadrillas' : 'usuarios';

    return (
        <div className="space-y-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Tabs value={activeTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <Link href="/personal/usuarios" passHref>
                            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                        </Link>
                        <Link href="/personal/cuadrillas" passHref>
                            <TabsTrigger value="cuadrillas">Cuadrillas</TabsTrigger>
                        </Link>
                    </TabsList>
                    <div className="mt-6">
                        {children}
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
