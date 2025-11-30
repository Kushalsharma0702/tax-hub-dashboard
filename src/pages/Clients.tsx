import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockClients, mockAdmins } from '@/data/mockData';
import { Client, STATUS_LABELS, ClientStatus } from '@/types';
import { Plus, Filter, Download, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Clients() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState(mockClients);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

  const filteredClients = clients.filter((client) => {
    if (statusFilter !== 'all' && client.status !== statusFilter) return false;
    if (yearFilter !== 'all' && client.filingYear.toString() !== yearFilter) return false;
    return true;
  });

  const columns = [
    {
      key: 'name',
      header: 'Client Name',
      sortable: true,
      render: (client: Client) => (
        <div>
          <p className="font-medium">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', sortable: false },
    { key: 'filingYear', header: 'Year', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (client: Client) => <StatusBadge status={client.status} type="client" />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (client: Client) => <StatusBadge status={client.paymentStatus} type="payment" />,
    },
    {
      key: 'assignedAdminName',
      header: 'Assigned To',
      render: (client: Client) => client.assignedAdminName || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client: Client) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/clients/${client.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const client: Client = {
      id: String(clients.length + 1),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      filingYear: new Date().getFullYear(),
      status: 'documents_pending',
      paymentStatus: 'pending',
      totalAmount: 0,
      paidAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setClients([client, ...clients]);
    setNewClient({ name: '', email: '', phone: '' });
    setIsAddOpen(false);
    toast({
      title: 'Client Added',
      description: `${client.name} has been added successfully.`,
    });
  };

  return (
    <DashboardLayout
      title="Client Management"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Clients' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {hasPermission('add_edit_client') && (
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Enter the client's details to create a new record.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="(416) 555-0000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddClient}>Add Client</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold">{filteredClients.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Documents Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {filteredClients.filter(c => c.status === 'documents_pending').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Awaiting Payment</p>
            <p className="text-2xl font-bold text-orange-600">
              {filteredClients.filter(c => c.status === 'awaiting_payment').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredClients.filter(c => c.status === 'completed' || c.status === 'filed').length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredClients}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search clients..."
          onRowClick={(client) => navigate(`/clients/${client.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
