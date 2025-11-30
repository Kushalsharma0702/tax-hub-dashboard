import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockAdmins, mockClients } from '@/data/mockData';
import { User, PERMISSIONS } from '@/types';
import { UserPlus, Edit, Shield, Users, Trash2, Loader2 } from 'lucide-react';
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
          <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-110">
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
        <Badge 
          variant={admin.isActive ? 'default' : 'secondary'}
          className="transition-all duration-200"
        >
          {admin.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (admin: User & { clientCount: number }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAdmin(admin);
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setAdminToDelete(admin);
              setIsDeleteOpen(true);
            }}
            className="text-destructive hover:text-destructive transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const admin: User = {
      id: String(Date.now()),
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
    setIsLoading(false);
    toast({
      title: 'Admin Created',
      description: `${admin.name} has been added as an admin.`,
    });
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setAdmins(prev => prev.filter(a => a.id !== adminToDelete.id));
    setIsDeleteOpen(false);
    setIsLoading(false);
    toast({
      title: 'Admin Deleted',
      description: `${adminToDelete.name} has been removed from the system.`,
    });
    setAdminToDelete(null);
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

  const handleSaveAdminChanges = async () => {
    if (!editingAdmin) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setAdmins((prev) =>
      prev.map((a) => (a.id === editingAdmin.id ? editingAdmin : a))
    );
    setEditingAdmin(null);
    setIsLoading(false);
    toast({
      title: 'Admin Updated',
      description: 'Admin permissions have been updated successfully.',
    });
  };

  return (
    <DashboardLayout
      title="Admin Management"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin Management' }]}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Admins', value: admins.length, icon: Users, color: 'bg-primary/10 text-primary' },
            { label: 'Active Admins', value: admins.filter((a) => a.isActive).length, icon: Shield, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
            { label: 'Avg. Clients/Admin', value: (mockClients.length / admins.filter((a) => a.isActive).length).toFixed(1), icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          ].map((stat, index) => (
            <Card 
              key={stat.label}
              className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="transition-all duration-200 hover:scale-105">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md animate-scale-in">
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
                    placeholder="john@taxease.ca"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
                <Button onClick={handleAddAdmin} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Admin
                </Button>
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
            <DialogContent className="max-w-md animate-scale-in">
              <DialogHeader>
                <DialogTitle>Edit Admin</DialogTitle>
                <DialogDescription>
                  Modify admin details and permissions for {editingAdmin.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
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
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
                <Button onClick={handleSaveAdminChanges} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="animate-scale-in">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Admin</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{adminToDelete?.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAdmin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
