import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useTour } from './TourProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TourButtonProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function TourButton({ variant = 'icon', className }: TourButtonProps) {
  const { startTour, isActive } = useTour();

  if (isActive) return null;

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={className}
              onClick={startTour}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start guided tour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={startTour}
    >
      <PlayCircle className="h-4 w-4 mr-2" />
      Start Tour
    </Button>
  );
}
