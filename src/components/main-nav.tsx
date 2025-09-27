"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, HardHat, ClipboardList, MessageSquare, BookText } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/personal/usuarios", label: "Usuarios", icon: Users },
  { href: "/personal/cuadrillas", label: "Cuadrillas", icon: HardHat },
  { href: "/reportes", label: "Reportes", icon: ClipboardList },
  { href: "/canales", label: "Canales", icon: MessageSquare },
  { href: "/bitacora", label: "Bitácora", icon: BookText },
];

export function MainNav() {
  const pathname = usePathname();

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
