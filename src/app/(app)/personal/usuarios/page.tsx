
import { getUsers } from "@/app/actions";
import { UserList } from "./_components/user-list";

export default async function UsuariosPage() {
  const usersResult = await getUsers();
  const initialUsers = usersResult.success ? usersResult.data || [] : [];
  
  return <UserList initialUsers={initialUsers} />;
}
