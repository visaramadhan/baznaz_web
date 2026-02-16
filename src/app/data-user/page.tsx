import { getUsers } from './actions';
import UserForm from './UserForm';
import UserList from './UserList';

export const dynamic = 'force-dynamic';

export default async function DataUserPage() {
  const users = await getUsers();

  return (
    <div>
      <UserForm />
      <UserList users={users} />
    </div>
  );
}
