/**
 * @file utils.ts
 * @description Archivo de funciones de utilidad compartidas en la aplicación.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina y fusiona clases de Tailwind CSS de forma segura.
 * Esta función es una envoltura alrededor de `clsx` y `tailwind-merge`.
 * - `clsx`: Permite construir cadenas de clases condicionalmente.
 * - `tailwind-merge`: Resuelve conflictos entre clases de Tailwind (ej. `p-2` y `p-4` se fusionan a `p-4`).
 *
 * @param {...ClassValue[]} inputs - Una secuencia de cadenas de clases, objetos o arrays.
 * @returns {string} Una cadena de clases de CSS optimizada.
 *
 * @example
 * cn("p-4 font-bold", { "bg-red-500": isError });
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
