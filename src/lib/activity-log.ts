import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';

export async function logActivity(action: string, realizadoPor: string, detalles?: string) {
    try {
        await dbConnect();
        const newLog = new ActivityLog({
            action,
            realizadoPor,
            detalles,
            fecha: new Date(),
        });
        await newLog.save();
    } catch (error) {
        console.error('Error al registrar la actividad:', error);
        // Fail silently so as not to interrupt the user's action
    }
}
