"use client"

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

interface UserRolesChartProps {
    data: { role: string; total: number }[];
}

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
              tickFormatter={(value) => value.slice(0, 3)}
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
