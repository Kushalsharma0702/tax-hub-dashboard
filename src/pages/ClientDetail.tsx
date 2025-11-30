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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { mockClients, mockDocuments, mockPayments, mockNotes } from '@/data/mockData';
import { STATUS_LABELS, ClientStatus, PERMISSIONS, Note, Document as DocType } from '@/types';
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
  Send,
  Trash2,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const { toast } = useToast();

  const [client, setClient] = useState(() => mockClients.find((c) => c.id === id));
  const [documents, setDocuments] = useState(() => mockDocuments.filter((d) => d.clientId === id));
  const [payments, setPayments] = useState(() => mockPayments.filter((p) => p.clientId === id));
  const [notes, setNotes] = useState<Note[]>(() => mockNotes.filter((n) => n.clientId === id));

  const [newNote, setNewNote] = useState('');
  const [isClientFacing, setIsClientFacing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!client) {
    return (
      <DashboardLayout title="Client Not Found" breadcrumbs={[{ label: 'Clients', href: '/clients' }]}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4 animate-fade-in">
          <p className="text-muted-foreground">The client you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const note: Note = {
      id: String(Date.now()),
      clientId: client.id,
      authorId: user?.id || '1',
      authorName: user?.name || 'Admin',
      content: newNote,
      isClientFacing,
      createdAt: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote('');
    setIsLoading(false);
    toast({
      title: 'Note Added',
      description: isClientFacing ? 'Client-facing note has been added.' : 'Internal note has been added.',
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setClient({ ...client, status: newStatus as ClientStatus });
    setIsLoading(false);
    toast({
      title: 'Status Updated',
      description: `Client status changed to ${STATUS_LABELS[newStatus as ClientStatus]}.`,
    });
  };

  const handleEditClient = async () => {
    if (!editForm.name || !editForm.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setClient({ ...client, name: editForm.name, email: editForm.email, phone: editForm.phone });
    setIsEditOpen(false);
    setIsLoading(false);
    toast({
      title: 'Client Updated',
      description: 'Client information has been updated successfully.',
    });
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const payment = {
      id: String(Date.now()),
      clientId: client.id,
      amount,
      method: 'Credit Card',
      reference: `PAY-${Date.now()}`,
      note: '',
      createdAt: new Date(),
      createdBy: user?.name || 'Admin',
    };

    setPayments([payment, ...payments]);
    setClient({ 
      ...client, 
      paidAmount: client.paidAmount + amount,
      paymentStatus: client.paidAmount + amount >= client.totalAmount ? 'paid' : 'partial',
    });
    setPaymentAmount('');
    setIsAddPaymentOpen(false);
    setIsLoading(false);
    toast({
      title: 'Payment Recorded',
      description: `$${amount.toFixed(2)} payment has been recorded.`,
    });
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
    setIsDeleteDocOpen(false);
    setSelectedDoc(null);
    setIsLoading(false);
    toast({
      title: 'Document Deleted',
      description: 'The document has been removed.',
    });
  };

  const handleRequestDocument = () => {
    toast({
      title: 'Request Sent',
      description: 'Document request has been sent to the client.',
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
      <div className="space-y-6 animate-fade-in">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/clients')} className="transition-all duration-200 hover:translate-x-[-4px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex gap-2">
            {hasPermission(PERMISSIONS.ADD_EDIT_CLIENT) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setEditForm({ name: client.name, email: client.email, phone: client.phone });
                  setIsEditOpen(true);
                }}
                className="transition-all duration-200 hover:scale-105"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
            )}
          </div>
        </div>

        {/* Client Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Client Information</span>
                <StatusBadge status={client.status} type="client" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { icon: User, label: 'Full Name', value: client.name },
                  { icon: Mail, label: 'Email', value: client.email },
                  { icon: Phone, label: 'Phone', value: client.phone },
                  { icon: Calendar, label: 'Filing Year', value: client.filingYear },
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-muted/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
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
          <Card className="transition-all duration-300 hover:shadow-md">
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
                <Button 
                  className="w-full transition-all duration-200 hover:scale-[1.02]" 
                  variant="outline"
                  onClick={() => setIsAddPaymentOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList>
            <TabsTrigger value="documents" className="transition-all duration-200">
              <FileText className="h-4 w-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="transition-all duration-200">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="transition-all duration-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="transition-all duration-200">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4 animate-fade-in">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                {hasPermission(PERMISSIONS.REQUEST_DOCUMENTS) && (
                  <Button size="sm" onClick={handleRequestDocument} className="transition-all duration-200 hover:scale-105">
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
                    documents.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-muted/50"
                        style={{ animationDelay: `${index * 50}ms` }}
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
                        <div className="flex items-center gap-2">
                          <StatusBadge status={doc.status} type="document" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setIsDeleteDocOpen(true);
                            }}
                            className="text-destructive hover:text-destructive transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No payments recorded yet.</p>
                  ) : (
                    payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-muted/50"
                        style={{ animationDelay: `${index * 50}ms` }}
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

          <TabsContent value="notes" className="mt-4 animate-fade-in">
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
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClientFacing}
                        onChange={(e) => setIsClientFacing(e.target.checked)}
                        className="rounded"
                      />
                      Client-facing note
                    </label>
                    <Button size="sm" onClick={handleAddNote} disabled={isLoading} className="transition-all duration-200 hover:scale-105">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.map((note, index) => (
                    <div 
                      key={note.id} 
                      className="p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
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

          <TabsContent value="timeline" className="mt-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
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

        {/* Edit Client Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update client information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditClient} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Enter the payment amount received from {client.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Outstanding balance: <strong>${client.totalAmount - client.paidAmount}</strong>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPayment} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Document Confirmation */}
        <AlertDialog open={isDeleteDocOpen} onOpenChange={setIsDeleteDocOpen}>
          <AlertDialogContent className="animate-scale-in">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{selectedDoc?.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteDocument}
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
