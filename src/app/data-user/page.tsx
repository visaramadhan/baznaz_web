import { getUsers } from './actions';
import UserForm from './UserForm';
import UserList from './UserList';

export const dynamic = 'force-dynamic';

export default async function DataUserPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manajemen User</h1>
      
      <UserForm />
      <UserList users={users} />
    </div>
  );
}
