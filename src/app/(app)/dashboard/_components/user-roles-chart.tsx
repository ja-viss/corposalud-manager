
"use client"
/**
 * @file user-roles-chart.tsx
 * @description Componente que renderiza un gráfico de barras mostrando la distribución de usuarios por rol.
 * Utiliza la librería Recharts para la visualización de datos.
 *
 * @requires react
 * @requires recharts
 * @requires @/components/ui/card
 * @requires @/components/ui/chart
 */

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

// Configuración del gráfico, define etiquetas y colores para cada serie de datos.
const chartConfig = {
  total: {
    label: "Total",
  },
  Admins: {
    label: "Admins",
    color: "hsl(var(--chart-1))",
  },
  Moderadores: {
    label: "Moderadores",
    color: "hsl(var(--chart-2))",
  },
  Obreros: {
    label: "Obreros",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

/**
 * Props para el componente UserRolesChart.
 * @interface UserRolesChartProps
 * @property {{ role: string; total: number }[]} data - Un array de objetos, donde cada objeto
 * representa un rol y el número total de usuarios en ese rol.
 */
interface UserRolesChartProps {
    data: { role: string; total: number }[];
}

/**
 * Componente que renderiza un gráfico de barras para la distribución de roles.
 *
 * @param {UserRolesChartProps} props - Las props del componente.
 * @returns {JSX.Element} La tarjeta con el gráfico de barras.
 */
export function UserRolesChart({ data }: UserRolesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Personal</CardTitle>
        <CardDescription>Total de usuarios por rol</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="role"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)} // Acorta las etiquetas del eje X (ej. "Mod")
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="total" fill="var(--color-Obreros)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
