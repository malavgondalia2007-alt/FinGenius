import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { AdminTable } from '../../components/admin/AdminTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Users, Search, UserCheck, UserX, Eye } from 'lucide-react';
import { db } from '../../services/database';
import { User } from '../../types';
export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  useEffect(() => {
    const allUsers = db.users.getAll();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  }, []);
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
          user.name.toLowerCase().includes(lowerTerm) ||
          user.email.toLowerCase().includes(lowerTerm)
        )
      );
    }
  }, [searchTerm, users]);
  const toggleUserStatus = (userId: string) => {
    // In a real app, this would update the backend
    // For now, we'll just toggle local state to simulate
    alert(`Toggled status for user ${userId}`);
  };
  const columns = [
  {
    key: 'name',
    label: 'User',
    render: (_: any, user: User) =>
    <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

  },
  {
    key: 'createdAt',
    label: 'Joined',
    render: (date: string) => new Date(date).toLocaleDateString()
  },
  {
    key: 'role',
    label: 'Role',
    render: (role: string) =>
    <Badge variant={role === 'admin' ? 'warning' : 'info'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>

  },
  {
    key: 'status',
    label: 'Status',
    render: () => <Badge variant="success">Active</Badge> // Mock status
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_: any, user: User) =>
    <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4 text-slate-500" />
          </Button>
          <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => toggleUserStatus(user.id)}>

            <UserCheck className="w-4 h-4 text-emerald-600" />
          </Button>
        </div>

  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              User Management
            </h1>
            <p className="text-slate-500">
              View and manage user accounts and access
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 w-full md:w-64 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />

            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminMetricCard
            title="Total Users"
            value={users.length}
            icon={Users}
            iconBgColor="bg-purple-100" />

          <AdminMetricCard
            title="Active Users"
            value={Math.floor(users.length * 0.8)} // Mock calculation
            icon={UserCheck}
            iconBgColor="bg-emerald-100" />

          <AdminMetricCard
            title="Inactive Users"
            value={Math.ceil(users.length * 0.2)} // Mock calculation
            icon={UserX}
            iconBgColor="bg-slate-100" />

        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">All Users</h2>
          </div>
          <AdminTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found matching your search." />

        </div>
      </div>
    </AdminLayout>);

}