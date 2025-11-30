import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockDocuments, mockClients } from '@/data/mockData';
import { FileText, Search, Filter, Send, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/types';

export default function Documents() {
  const { hasPermission } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const documentsWithClient = mockDocuments.map((doc) => {
    const client = mockClients.find((c) => c.id === doc.clientId);
    return { ...doc, clientName: client?.name || 'Unknown' };
  });

  const filteredDocs = documentsWithClient.filter((doc) => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) &&
        !doc.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: mockDocuments.length,
    complete: mockDocuments.filter((d) => d.status === 'complete').length,
    pending: mockDocuments.filter((d) => d.status === 'pending').length,
    missing: mockDocuments.filter((d) => d.status === 'missing').length,
  };

  return (
    <DashboardLayout
      title="Document Management"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Documents' }]}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Complete</p>
              <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Missing</p>
              <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.clientName}</p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} type="document" />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Version {doc.version}</span>
                  <span>{doc.type}</span>
                </div>
                {doc.status === 'missing' && hasPermission(PERMISSIONS.REQUEST_DOCUMENTS) && (
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Send className="h-3 w-3 mr-1" />
                    Request Document
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
