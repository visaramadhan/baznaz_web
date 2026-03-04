'use server';

import dbConnect from '@/lib/mongodb';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserPermissions() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  await dbConnect();
  
  // Find user to get role name
  const user = await User.findOne({ email: session.user.email });
  if (!user) return [];

  // Find role to get permissions
  const role = await Role.findOne({ name: user.role });
  if (!role) return []; // Should not happen if seeded correctly, maybe fallback to minimal permissions

  return role.permissions;
}

export async function getUserRole() {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as any).role : null;
}
