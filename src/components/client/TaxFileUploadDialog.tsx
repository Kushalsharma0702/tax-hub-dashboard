import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface TaxFileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    t1Return?: File;
    t183Form?: File;
    refundOrOwing: 'refund' | 'owing';
    amount: number;
    note?: string;
  }) => void;
  clientName: string;
}

export function TaxFileUploadDialog({
  isOpen,
  onClose,
  onUpload,
  clientName,
}: TaxFileUploadDialogProps) {
  const [t1Return, setT1Return] = useState<File | null>(null);
  const [t183Form, setT183Form] = useState<File | null>(null);
  const [refundOrOwing, setRefundOrOwing] = useState<'refund' | 'owing'>('refund');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const t1InputRef = useRef<HTMLInputElement>(null);
  const t183InputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = '.pdf,.jpg,.jpeg,.png';

  const handleFileSelect = (
    file: File | null,
    setter: (file: File | null) => void
  ) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a PDF, JPG, or PNG file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setter(file);
    }
  };

  const handleSubmit = async () => {
    if (!t1Return && !t183Form) {
      toast({
        title: 'No files selected',
        description: 'Please upload at least one document.',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    onUpload({
      t1Return: t1Return || undefined,
      t183Form: t183Form || undefined,
      refundOrOwing,
      amount: parseFloat(amount),
      note: note || undefined,
    });

    setIsUploading(false);
    setUploadProgress(0);
    resetForm();
    onClose();

    toast({
      title: 'Tax files uploaded',
      description: 'The tax files have been uploaded successfully.',
    });
  };

  const resetForm = () => {
    setT1Return(null);
    setT183Form(null);
    setRefundOrOwing('refund');
    setAmount('');
    setNote('');
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Tax Files</DialogTitle>
          <DialogDescription>
            Upload prepared tax return documents for {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* T1 Return Upload */}
          <div className="space-y-2">
            <Label>Prepared T1 Return</Label>
            <input
              ref={t1InputRef}
              type="file"
              accept={acceptedFormats}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setT1Return)}
            />
            {t1Return ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t1Return.name}</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setT1Return(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-20 border-dashed"
                onClick={() => t1InputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload T1 Return (PDF, JPG, PNG)
                  </span>
                </div>
              </Button>
            )}
          </div>

          {/* T183 Form Upload */}
          <div className="space-y-2">
            <Label>T183 Form</Label>
            <input
              ref={t183InputRef}
              type="file"
              accept={acceptedFormats}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setT183Form)}
            />
            {t183Form ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t183Form.name}</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setT183Form(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-20 border-dashed"
                onClick={() => t183InputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload T183 Form (PDF, JPG, PNG)
                  </span>
                </div>
              </Button>
            )}
          </div>

          {/* Refund or Owing */}
          <div className="space-y-2">
            <Label>Result Type</Label>
            <RadioGroup
              value={refundOrOwing}
              onValueChange={(value) => setRefundOrOwing(value as 'refund' | 'owing')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="refund" id="refund" />
                <Label htmlFor="refund" className="text-green-600 font-medium">Refund</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owing" id="owing" />
                <Label htmlFor="owing" className="text-orange-600 font-medium">Amount Owing</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              {refundOrOwing === 'refund' ? 'Refund Amount' : 'Amount Owing'}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes for the client..."
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || (!t1Return && !t183Form)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxFileUploadDialog;
