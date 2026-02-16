import { getEmployees } from './actions';
import { getProfile } from '../setting/profil/actions';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';

export const dynamic = 'force-dynamic';

export default async function DataKaryawan() {
  const [employees, profile] = await Promise.all([
    getEmployees(),
    getProfile()
  ]);

  return (
    <div>
      <EmployeeForm profile={profile} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <EmployeeList employees={employees} />
      </div>
    </div>
  );
}
