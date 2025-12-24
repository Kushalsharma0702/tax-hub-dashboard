import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, User } from 'lucide-react';
import { ClientStatus } from '@/types';

interface FilingStatusBadgeProps {
  status: ClientStatus;
  autoUpdated?: boolean;
  lastUpdatedBy?: string;
  lastUpdatedAt?: Date;
}

const STATUS_CONFIG: Record<ClientStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  documents_pending: { label: 'Documents Pending', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  cost_estimate_sent: { label: 'Estimate Sent', variant: 'outline', className: 'border-purple-500 text-purple-600' },
  awaiting_payment: { label: 'Awaiting Payment', variant: 'outline', className: 'border-orange-500 text-orange-600' },
  in_preparation: { label: 'In Preparation', variant: 'default', className: 'bg-blue-600' },
  awaiting_approval: { label: 'Awaiting Approval', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
  filed: { label: 'Filed', variant: 'default', className: 'bg-green-600' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-green-700' },
};

export function FilingStatusBadge({
  status,
  autoUpdated = false,
  lastUpdatedBy,
  lastUpdatedAt,
}: FilingStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary' };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const badge = (
    <Badge variant={config.variant} className={`${config.className || ''} flex items-center gap-1`}>
      {autoUpdated && <Zap className="h-3 w-3" />}
      {config.label}
    </Badge>
  );

  if (autoUpdated || lastUpdatedBy) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              {autoUpdated && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Auto-updated by system</span>
                </div>
              )}
              {lastUpdatedBy && !autoUpdated && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Updated by {lastUpdatedBy}</span>
                </div>
              )}
              {lastUpdatedAt && (
                <div className="text-muted-foreground">
                  {formatDate(lastUpdatedAt)}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

export default FilingStatusBadge;
