"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const activeTab = pathname.includes('/cuadrillas') ? 'cuadrillas' : 'usuarios';

    return (
        <div className="space-y-6 py-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
            </div>
            <Tabs value={activeTab} className="w-full">
                <TabsList>
                    <Link href="/personal/usuarios" passHref>
                        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                    </Link>
                    <Link href="/personal/cuadrillas" passHref>
                        <TabsTrigger value="cuadrillas">Cuadrillas</TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>
            {children}
        </div>
    )
}
