import { getRoles } from './actions';
import RoleManager from './RoleManager';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div>
      <RoleManager roles={roles} />
    </div>
  );
}
