'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { UserTable } from '@/components/admin/user-table';
import { UserModal } from '@/components/admin/user-modal';
import { ResetPasswordModal } from '@/components/admin/reset-password-modal';
import {
  createUser,
  deleteUser,
  getUsers,
  resetPassword,
  updateUser,
} from '@/lib/api/users';
import { useAuth } from '@/lib/auth/AuthContext';
import type { User } from '@/lib/types';

export default function AdminUsersPage() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | undefined>();
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getUsers();
      if (!cancelled) {
        setUsers(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleSaveUser = async (user: User & { password?: string }) => {
    if (editingUser) {
      const updated = await updateUser(user.id, user);
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      }
    } else {
      const created = await createUser({
        name: user.name,
        email: user.email,
        role: user.role,
        assignedStore: user.assignedStore,
        status: user.status,
        password: user.password ?? 'demo',
        id: user.id || undefined,
      });
      setUsers((prev) => [...prev, created]);
    }
    setShowAddModal(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const removed = await deleteUser(userId);
      if (removed) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (currentUser?.id === userId) {
          await logout();
        }
      }
    }
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user);
    setShowResetPasswordModal(true);
  };

  const handleSaveResetPassword = async (newPassword: string) => {
    if (resetPasswordUser) {
      await resetPassword(resetPasswordUser.id, newPassword);
    }
    setShowResetPasswordModal(false);
  };

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const disabledUsersCount = users.filter((u) => u.status === 'Disabled').length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={handleAddUser}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '—' : users.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loading ? '—' : activeUsersCount}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {loading ? '—' : disabledUsersCount}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block relative w-10 h-10 mb-3">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading users…</p>
            </div>
          </div>
        ) : (
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onResetPassword={handleResetPassword}
          />
        )}
      </div>

      <UserModal
        user={editingUser}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveUser}
      />
      <ResetPasswordModal
        userName={resetPasswordUser?.name}
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSave={handleSaveResetPassword}
      />
    </DashboardShell>
  );
}
