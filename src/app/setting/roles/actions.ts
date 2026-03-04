'use server';

import dbConnect from '@/lib/mongodb';
import { Role } from '@/models/Role';
import { revalidatePath } from 'next/cache';

export async function getRoles() {
  await dbConnect();
  const roles = await Role.find({}).sort({ name: 1 });
  return JSON.parse(JSON.stringify(roles));
}

export async function createRole(formData: FormData) {
  await dbConnect();
  const name = formData.get('name') as string;
  const permissions = formData.getAll('permissions') as string[];

  try {
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return { success: false, error: 'Role sudah ada' };
    }

    await Role.create({
      name,
      permissions,
      isSystem: false,
    });

    revalidatePath('/setting/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRole(id: string, formData: FormData) {
  await dbConnect();
  const name = formData.get('name') as string;
  const permissions = formData.getAll('permissions') as string[];

  try {
    const role = await Role.findById(id);
    if (!role) {
      return { success: false, error: 'Role tidak ditemukan' };
    }

    // Only update name if it's not a system role or if name is not changed (to avoid locking system role names if we want)
    // Actually, usually system role names shouldn't change.
    if (!role.isSystem) {
        role.name = name;
    }
    
    role.permissions = permissions;
    await role.save();

    revalidatePath('/setting/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRole(id: string) {
  await dbConnect();
  try {
    const role = await Role.findById(id);
    if (!role) {
      return { success: false, error: 'Role tidak ditemukan' };
    }

    if (role.isSystem) {
      return { success: false, error: 'Role sistem tidak dapat dihapus' };
    }

    await Role.findByIdAndDelete(id);
    revalidatePath('/setting/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
