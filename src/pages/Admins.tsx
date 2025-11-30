import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockAdmins, mockClients } from '@/data/mockData';
import { User, PERMISSIONS } from '@/types';
import { UserPlus, Edit, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.ADD_EDIT_PAYMENT]: 'Add/Edit Payments',
  [PERMISSIONS.ADD_EDIT_CLIENT]: 'Add/Edit Clients',
  [PERMISSIONS.REQUEST_DOCUMENTS]: 'Request Documents',
  [PERMISSIONS.ASSIGN_CLIENTS]: 'Assign Clients',
  [PERMISSIONS.VIEW_ANALYTICS]: 'View Analytics',
  [PERMISSIONS.APPROVE_COST_ESTIMATE]: 'Approve Cost Estimates',
  [PERMISSIONS.UPDATE_WORKFLOW]: 'Update Workflow',
};

export default function Admins() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState(mockAdmins);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    permissions: [] as string[],
  });

  const adminsWithWorkload = admins.map((admin) => ({
    ...admin,
    clientCount: mockClients.filter((c) => c.assignedAdminId === admin.id).length,
  }));

  const columns = [
    {
      key: 'name',
      header: 'Admin',
      render: (admin: User & { clientCount: number }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {admin.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'clientCount',
      header: 'Assigned Clients',
      sortable: true,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (admin: User & { clientCount: number }) => (
        <div className="flex flex-wrap gap-1">
          {admin.permissions.slice(0, 2).map((p) => (
            <Badge key={p} variant="secondary" className="text-xs">
              {PERMISSION_LABELS[p]?.split(' ')[0] || p}
            </Badge>
          ))}
          {admin.permissions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{admin.permissions.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (admin: User & { clientCount: number }) => (
        <Badge variant={admin.isActive ? 'default' : 'secondary'}>
          {admin.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (admin: User & { clientCount: number }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingAdmin(admin);
          }}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
  ];

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const admin: User = {
      id: String(admins.length + 10),
      name: newAdmin.name,
      email: newAdmin.email,
      role: 'admin',
      permissions: newAdmin.permissions,
      isActive: true,
      createdAt: new Date(),
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', permissions: [] });
    setIsAddOpen(false);
    toast({
      title: 'Admin Created',
      description: `${admin.name} has been added as an admin.`,
    });
  };

  const handleTogglePermission = (permission: string) => {
    setNewAdmin((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleToggleAdminStatus = (adminId: string) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, isActive: !a.isActive } : a))
    );
    toast({
      title: 'Status Updated',
      description: 'Admin status has been updated.',
    });
  };

  return (
    <DashboardLayout
      title="Admin Management"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin Management' }]}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Admins</p>
                  <p className="text-3xl font-bold">{admins.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Admins</p>
                  <p className="text-3xl font-bold text-green-600">
                    {admins.filter((a) => a.isActive).length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Clients/Admin</p>
                  <p className="text-3xl font-bold">
                    {(mockClients.length / admins.filter((a) => a.isActive).length).toFixed(1)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Add a new admin and configure their permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="john@taxpro.ca"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <Switch
                          checked={newAdmin.permissions.includes(key)}
                          onCheckedChange={() => handleTogglePermission(key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin}>Create Admin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Table */}
        <DataTable
          data={adminsWithWorkload}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search admins..."
        />

        {/* Edit Dialog */}
        {editingAdmin && (
          <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Admin</DialogTitle>
                <DialogDescription>
                  Modify admin details and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Status</span>
                  <Switch
                    checked={editingAdmin.isActive}
                    onCheckedChange={() => {
                      handleToggleAdminStatus(editingAdmin.id);
                      setEditingAdmin({ ...editingAdmin, isActive: !editingAdmin.isActive });
                    }}
                  />
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <Switch
                          checked={editingAdmin.permissions.includes(key)}
                          onCheckedChange={() => {
                            const newPerms = editingAdmin.permissions.includes(key)
                              ? editingAdmin.permissions.filter((p) => p !== key)
                              : [...editingAdmin.permissions, key];
                            setEditingAdmin({ ...editingAdmin, permissions: newPerms });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setAdmins((prev) =>
                      prev.map((a) => (a.id === editingAdmin.id ? editingAdmin : a))
                    );
                    setEditingAdmin(null);
                    toast({
                      title: 'Admin Updated',
                      description: 'Admin permissions have been updated.',
                    });
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
