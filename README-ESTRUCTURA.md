
# Estructura del Proyecto: Gestión CORPOELEC

Este documento detalla la estructura de archivos y directorios del sistema de gestión, explicando el propósito de cada componente clave.

## 🚀 Visión General

El proyecto está construido con Next.js y sigue la convención del **App Router**. La estructura principal se divide en:

-   `src/app`: Contiene las rutas y la lógica principal de la aplicación.
-   `src/components`: Componentes de interfaz de usuario reutilizables (UI).
-   `src/lib`: Funciones de utilidad, tipos de datos y la configuración de la base de datos.
-   `src/models`: Define los esquemas de datos para la base de datos MongoDB.
-   `public`: Almacena archivos estáticos como imágenes y logos.

---

## 📁 `src/app` - El Corazón de la Aplicación

Esta carpeta gestiona las rutas, las páginas y la lógica de negocio.

### Rutas Principales `(app)`

Las rutas protegidas y accesibles solo para usuarios autenticados se encuentran en el grupo `(app)`.

-   **`layout.tsx`**: Define el diseño principal para las páginas autenticadas. Incluye la barra lateral (`Sidebar`), la cabecera (`Header`) y el `UserNav` (menú de usuario). Es responsable de verificar la sesión del usuario.
-   **`/dashboard`**: Página de inicio que muestra estadísticas y resúmenes. La vista se adapta según el rol del usuario (`Admin`, `Moderador`, `Obrero`).
-   **`/personal`**: Sección para la gestión de personal.
    -   **`/usuarios`**: Muestra la lista de usuarios. Permite crear, editar y eliminar.
        -   `page.tsx`: Carga los datos iniciales de los usuarios.
        -   `_components/user-list.tsx`: Renderiza la tabla/lista de usuarios y maneja las interacciones.
        -   `_components/user-form.tsx`: Formulario para crear y editar usuarios.
    -   **`/cuadrillas`**: Muestra la lista de cuadrillas de trabajo.
        -   `page.tsx`: Carga los datos de las cuadrillas.
        -   `_components/crew-list.tsx`: Renderiza la lista de cuadrillas.
        -   `_components/crew-form.tsx`: Formulario para crear y editar cuadrillas.
-   **`/reportes`**: Página para generar reportes generales (PDF) y crear nuevos reportes de trabajo.
    -   `_components/work-report-modal.tsx`: Modal complejo para crear y editar reportes de actividad de las cuadrillas.
-   **`/canales`**: Sistema de chat interno.
    -   `_components/channel-client-layout.tsx`: Orquesta la interfaz de chat.
    -   `_components/channel-list.tsx`: Lista los canales disponibles para el usuario.
    -   `_components/chat-view.tsx`: Muestra los mensajes de un canal y el formulario para enviar nuevos.
-   **`/bitacora`**: Muestra un registro de todas las actividades importantes que ocurren en el sistema.
-   **`/perfil`**: Página donde el usuario puede ver su información personal.

### Rutas Públicas

-   **`/login`**: Página de inicio de sesión. Maneja la autenticación tanto para `Personal` (Admin/Moderador) como para `Obrero`.
-   **`page.tsx` (Raíz)**: Redirige automáticamente a `/login`.
-   **`layout.tsx` (Raíz)**: Layout global que incluye la configuración del tema y las notificaciones (`Toaster`).

### Backend en el Frontend: Server Actions

-   **`actions.ts`**: **Este es el archivo de backend más importante**. Contiene todas las **Server Actions** que interactúan con la base de datos. Cada función aquí es un endpoint de API que puede ser llamado de forma segura desde los componentes del frontend.
    -   **Funciones de Usuario**: `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `loginUser`, `loginObrero`, `updatePassword`.
    -   **Funciones de Cuadrilla**: `getCrews`, `getCrewById`, `createCrew`, `updateCrew`, `deleteCrew`.
    -   **Funciones de Reportes**: `createWorkReport`, `updateWorkReport`, `getWorkReports`.
    -   **Funciones de Canales y Mensajes**: `getChannels`, `getMessages`, `sendMessage`, `deleteMessage`.
    -   **Funciones de Actividad**: `getActivityLogs`, `logActivity`.

---

## 🧩 `src/components` - Bloques de Construcción

Esta carpeta contiene componentes de UI reutilizables, basados en `shadcn/ui`.

-   **`/ui`**: Contiene los componentes base de `shadcn/ui` como `Button`, `Card`, `Input`, `Dialog`, `Table`, etc. Estos son los bloques fundamentales de la interfaz.
-   **`main-nav.tsx`**: Define la navegación principal en la barra lateral, mostrando enlaces según el rol del usuario.
-   **`user-nav.tsx`**: El menú desplegable en la esquina superior derecha, que muestra la información del usuario y el botón de cerrar sesión.
-   **`logo.tsx`**: Componente simple que muestra el logo de la aplicación.

---

## 📚 `src/lib` - Utilidades y Configuración

Aquí se encuentran los archivos de soporte que no son ni componentes ni páginas.

-   **`db.ts`**: **Archivo crítico**. Gestiona la conexión a la base de datos MongoDB usando Mongoose. Implementa un sistema de caché para reutilizar la conexión en entornos de desarrollo.
-   **`types.ts`**: Define todas las interfaces de TypeScript usadas en la aplicación (`User`, `Crew`, `Channel`, `Message`, `WorkReport`, etc.). Es el "contrato" de datos entre el frontend y el backend.
-   **`utils.ts`**: Contiene la función de utilidad `cn` para combinar clases de TailwindCSS de forma segura.
-   **`activity-log.ts`**: Exporta la función `logActivity` para registrar acciones importantes en la bitácora.

---

## 🧱 `src/models` - Esquemas de la Base de Datos

Esta carpeta define la estructura de los datos que se almacenan en MongoDB. Cada archivo corresponde a una "colección" en la base de datos.

-   **`User.ts`**: Define el esquema para los usuarios, incluyendo campos como `nombre`, `cedula`, `role`, `contrasena`, etc.
-   **`Crew.ts`**: Define el esquema para las cuadrillas, relacionando `moderadores` y `obreros`.
-   **`Channel.ts`**: Define los canales de chat, sus tipos y sus miembros.
-   **`Message.ts`**: Define la estructura de cada mensaje enviado en el chat.
-   **`WorkReport.ts`**: Define el esquema para los reportes de trabajo, incluyendo herramientas y detalles de la actividad.
-   **`ActivityLog.ts`**: Define el esquema para los registros de la bitácora.

---

## 🖼️ `public` - Archivos Estáticos

Contiene recursos que se sirven directamente al navegador.

-   **`image_logo.png`**: El logo principal de la aplicación.
-   **`manifest.json`**: Archivo de configuración para la Progressive Web App (PWA).

Este desglose proporciona una guía clara para navegar y entender la arquitectura del proyecto, facilitando el desarrollo y mantenimiento del mismo.
