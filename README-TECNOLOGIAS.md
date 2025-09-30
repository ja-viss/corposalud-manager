
# Tecnologías y Lenguajes del Proyecto

Este documento describe el stack tecnológico utilizado para construir el sistema de gestión de CORPOELEC.

---

## Frontend

El frontend está construido como una **Single-Page Application (SPA)** moderna, utilizando las últimas características de React y Next.js.

### 1. **Next.js (v14+)**
-   **Framework Principal**: Utilizamos Next.js como el framework de React para producción.
-   **App Router**: La estructura de la aplicación se basa en el App Router, que permite una organización de rutas basada en directorios, layouts anidados y una mejor gestión del estado de carga.
-   **Server Components**: La mayoría de los componentes que obtienen datos se renderizan en el servidor (`"use server"`) para mejorar el rendimiento y la seguridad.
-   **Server Actions**: Toda la comunicación con el backend se realiza a través de Server Actions, eliminando la necesidad de crear una API REST tradicional. Las funciones en `src/app/actions.ts` actúan como endpoints directos.

### 2. **React (v18+)**
-   **Librería de UI**: Es la base sobre la que se construye toda la interfaz de usuario.
-   **Hooks**: Hacemos un uso extensivo de Hooks como `useState`, `useEffect`, `useCallback` y `useContext` para gestionar el estado y el ciclo de vida de los componentes.
-   **Componentes Funcionales**: Toda la aplicación sigue el paradigma de componentes funcionales.

### 3. **TypeScript**
-   **Lenguaje Principal**: Todo el código, tanto en el frontend como en el backend (Server Actions), está escrito en TypeScript.
-   **Seguridad de Tipos**: Proporciona un desarrollo más robusto y menos propenso a errores al verificar los tipos de datos en tiempo de compilación. Las definiciones de tipos se centralizan en `src/lib/types.ts`.

### 4. **Tailwind CSS**
-   **Framework de CSS**: Se utiliza para estilizar la aplicación. Es un framework "utility-first" que permite construir diseños complejos directamente en el HTML/JSX.
-   **Clases Personalizadas**: La configuración se encuentra en `tailwind.config.ts`, y las variables de color y temas (claro/oscuro) están definidas en `src/app/globals.css`.

### 5. **Shadcn/UI**
-   **Biblioteca de Componentes**: Proporciona un conjunto de componentes de UI reutilizables y accesibles (como `Button`, `Card`, `Dialog`, `Table`) que están construidos sobre Radix UI y Tailwind CSS. No es una librería de componentes tradicional, sino un conjunto de recetas que se copian en el proyecto (`src/components/ui`) y que pueden ser personalizadas.

### 6. **Lucide React**
-   **Iconos**: Es la librería de iconos utilizada en toda la aplicación. Proporciona iconos SVG simples, consistentes y ligeros.

---

## Backend y Base de Datos

El backend está integrado dentro del entorno de Next.js (full-stack) y se conecta a una base de datos NoSQL.

### 1. **Node.js**
-   **Entorno de Ejecución**: Next.js se ejecuta sobre Node.js, que gestiona las Server Actions y la conexión con la base de datos.

### 2. **MongoDB**
-   **Base de Datos**: Es la base de datos NoSQL donde se almacena toda la información de la aplicación (usuarios, cuadrillas, reportes, etc.). Su flexibilidad es ideal para el tipo de datos que manejamos.

### 3. **Mongoose**
-   **ODM (Object Data Modeling)**: Es una librería que facilita la interacción con MongoDB.
    -   **Esquemas (`src/models`)**: Permite definir una estructura estricta para los datos (Modelos), añadiendo validaciones y reglas de negocio.
    -   **Conexión (`src/lib/db.ts`)**: Gestiona el pool de conexiones a la base de datos de manera eficiente.

### 4. **bcrypt.js**
-   **Seguridad**: Se utiliza para hashear y verificar las contraseñas de los usuarios antes de guardarlas en la base de datos, garantizando que nunca se almacenen en texto plano.

---

## Librerías Adicionales Clave

-   **`zod`**: Utilizada para la validación de esquemas y formularios. Define la "forma" esperada de los datos y devuelve errores descriptivos si no se cumplen.
-   **`react-hook-form`**: Gestiona el estado de los formularios de manera eficiente, integrándose con `zod` para la validación.
-   **`date-fns`**: Librería para la manipulación y formateo de fechas. Es ligera y modular.
-   **`jspdf` y `jspdf-autotable`**: Se utilizan para la generación de reportes en formato PDF del lado del cliente.
-   **`next-themes`**: Gestiona el cambio entre tema claro y oscuro de la aplicación.
-   **`cookies-next`**: Facilita la gestión de cookies en el servidor y el cliente, utilizada para manejar la sesión del usuario.

Este stack tecnológico ha sido seleccionado por ser moderno, robusto y altamente productivo para el desarrollo de aplicaciones web full-stack.
