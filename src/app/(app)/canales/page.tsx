
import type { Channel, User as UserType } from '@/lib/types';
import { getChannels, getUsers, getUserById } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChannelClientLayout } from './_components/channel-client-layout';

async function getCurrentUser() {
    const cookieStore = cookies();
    const userId = cookieStore.get('session-id')?.value;
    if (!userId) {
        return null;
    }
    const userResult = await getUserById(userId);
    if (userResult.success && userResult.data) {
        return userResult.data;
    }
    return null;
}

export default async function CanalesPage() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect('/login');
    }

    const [channelResult, usersResult] = await Promise.all([getChannels(), getUsers()]);

    const channels = channelResult.success ? channelResult.data || [] : [];
    const allUsers = usersResult.success ? usersResult.data || [] : [];

    return <ChannelClientLayout channels={channels} allUsers={allUsers} currentUser={currentUser} />;
}
