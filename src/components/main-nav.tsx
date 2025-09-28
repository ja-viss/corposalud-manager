"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, HardHat, ClipboardList, MessageSquare, BookText } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/types";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ['Admin', 'Moderador', 'Obrero'] },
  { href: "/personal/usuarios", label: "Usuarios", icon: Users, roles: ['Admin'] },
  { href: "/personal/cuadrillas", label: "Cuadrillas", icon: HardHat, roles: ['Admin', 'Moderador'] },
  { href: "/reportes", label: "Reportes", icon: ClipboardList, roles: ['Admin', 'Moderador', 'Obrero'] },
  { href: "/canales", label: "Canales", icon: MessageSquare, roles: ['Admin', 'Moderador', 'Obrero'] },
  { href: "/bitacora", label: "Bitácora", icon: BookText, roles: ['Admin'] },
];

interface MainNavProps {
  userRole: User['role'];
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={{ children: item.label }}
              variant="default"
              size="default"
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
