import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tab?: string; // Which tab/route this step belongs to
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setSteps: (steps: TourStep[]) => void;
  hasCompletedTour: boolean;
  markTourCompleted: () => void;
}

const TOUR_COMPLETED_KEY = 'taxease_tour_completed';

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);

  // Check if user has completed the tour
  useEffect(() => {
    if (user?.id) {
      const completedUsers = JSON.parse(localStorage.getItem(TOUR_COMPLETED_KEY) || '[]');
      const hasCompleted = completedUsers.includes(user.id);
      setHasCompletedTour(hasCompleted);
    }
  }, [user?.id]);

  const markTourCompleted = useCallback(() => {
    if (user?.id) {
      const completedUsers = JSON.parse(localStorage.getItem(TOUR_COMPLETED_KEY) || '[]');
      if (!completedUsers.includes(user.id)) {
        completedUsers.push(user.id);
        localStorage.setItem(TOUR_COMPLETED_KEY, JSON.stringify(completedUsers));
      }
      setHasCompletedTour(true);
    }
  }, [user?.id]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    markTourCompleted();
  }, [markTourCompleted]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        endTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        setSteps,
        hasCompletedTour,
        markTourCompleted,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
