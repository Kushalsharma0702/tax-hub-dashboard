import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockClients, mockDocuments, mockPayments, mockNotes, mockAdmins } from '@/data/mockData';
import { STATUS_LABELS, ClientStatus, PERMISSIONS } from '@/types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  Clock,
  Edit,
  ArrowLeft,
  Upload,
  Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin } = useAuth();
  const { toast } = useToast();

  const client = mockClients.find((c) => c.id === id);
  const documents = mockDocuments.filter((d) => d.clientId === id);
  const payments = mockPayments.filter((p) => p.clientId === id);
  const notes = mockNotes.filter((n) => n.clientId === id);

  const [newNote, setNewNote] = useState('');
  const [isClientFacing, setIsClientFacing] = useState(false);

  if (!client) {
    return (
      <DashboardLayout title="Client Not Found" breadcrumbs={[{ label: 'Clients', href: '/clients' }]}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p className="text-muted-foreground">The client you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast({
      title: 'Note Added',
      description: isClientFacing ? 'Client-facing note has been added.' : 'Internal note has been added.',
    });
    setNewNote('');
  };

  const handleStatusUpdate = (newStatus: string) => {
    toast({
      title: 'Status Updated',
      description: `Client status changed to ${STATUS_LABELS[newStatus as ClientStatus]}.`,
    });
  };

  return (
    <DashboardLayout
      title={client.name}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clients', href: '/clients' },
        { label: client.name },
      ]}
    >
      <div className="space-y-6">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex gap-2">
            {hasPermission(PERMISSIONS.ADD_EDIT_CLIENT) && (
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
            )}
          </div>
        </div>

        {/* Client Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Client Information</span>
                <StatusBadge status={client.status} type="client" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filing Year</p>
                    <p className="font-medium">{client.filingYear}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Status Update */}
              {hasPermission(PERMISSIONS.UPDATE_WORKFLOW) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Label>Update Workflow Status</Label>
                  <Select defaultValue={client.status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger className="mt-2 w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">${client.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">${client.paidAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium text-orange-600">
                  ${client.totalAmount - client.paidAmount}
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <StatusBadge status={client.paymentStatus} type="payment" />
              </div>
              {hasPermission(PERMISSIONS.ADD_EDIT_PAYMENT) && (
                <Button className="w-full" variant="outline">
                  Add Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                {hasPermission(PERMISSIONS.REQUEST_DOCUMENTS) && (
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Request Missing
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Version {doc.version} • {doc.type}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={doc.status} type="document" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No payments recorded yet.</p>
                  ) : (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium">${payment.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.method} • {payment.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{payment.createdBy}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isClientFacing}
                        onChange={(e) => setIsClientFacing(e.target.checked)}
                        className="rounded"
                      />
                      Client-facing note
                    </label>
                    <Button size="sm" onClick={handleAddNote}>Add Note</Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{note.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {note.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        {note.isClientFacing && (
                          <Badge variant="outline" className="text-xs">Client-Facing</Badge>
                        )}
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="w-px h-full bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-sm">Client Created</p>
                      <p className="text-xs text-muted-foreground">
                        {client.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="w-px h-full bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-sm">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {client.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
