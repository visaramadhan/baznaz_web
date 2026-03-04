import { getUsers } from './actions';
import { getRoles } from '@/app/setting/roles/actions';
import UserForm from './UserForm';
import UserList from './UserList';

export const dynamic = 'force-dynamic';

export default async function DataUserPage() {
  const users = await getUsers();
  const roles = await getRoles();

  return (
    <div>
      <UserForm roles={roles} />
      <UserList users={users} roles={roles} />
    </div>
  );
}
