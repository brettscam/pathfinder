import React, { useEffect, useRef } from "react";
import type { SOP, InterfaceState } from "../../../shared/types";
import StepCard from "../components/StepCard";
import ProgressBar from "../components/ProgressBar";
import { showOverlay, clearOverlays } from "../../overlay";

interface GuideTabProps {
  sop: SOP | null;
  interfaceState: InterfaceState;
  onToggleStep: (stepNumber: number) => void;
}

const GuideTab: React.FC<GuideTabProps> = ({ sop, interfaceState, onToggleStep }) => {
  const prevStepRef = useRef<number | null>(null);

  // Auto-highlight the first incomplete step when the Guide tab is active
  useEffect(() => {
    if (!sop) {
      clearOverlays();
      return;
    }

    const currentStep = sop.steps.find((s) => !s.completed);
    if (!currentStep || !currentStep.targetSelector) {
      clearOverlays();
      prevStepRef.current = null;
      return;
    }

    // Only re-highlight if the current step changed
    if (prevStepRef.current !== currentStep.stepNumber) {
      prevStepRef.current = currentStep.stepNumber;
      showOverlay(currentStep.targetSelector, `Step ${currentStep.stepNumber}: ${currentStep.title}`);
    }

    return () => {
      clearOverlays();
    };
  }, [sop, sop?.steps.map((s) => s.completed).join(",")]);

  if (!sop) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-pathfinder-text-muted">
        <p className="text-sm">No SOP active.</p>
        <p className="text-xs mt-2">
          Go to the Library tab to select or create an SOP.
        </p>
      </div>
    );
  }

  const completedCount = sop.steps.filter((s) => s.completed).length;
  const currentStep = sop.steps.find((s) => !s.completed);

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold mb-1">{sop.title}</h2>
      <p className="text-xs text-pathfinder-text-muted mb-3">
        {sop.description}
      </p>
      <ProgressBar current={completedCount} total={sop.steps.length} />
      <div className="mt-3 space-y-2">
        {sop.steps.map((step) => (
          <StepCard
            key={step.stepNumber}
            step={step}
            isCurrent={currentStep?.stepNumber === step.stepNumber}
            onToggleComplete={onToggleStep}
          />
        ))}
      </div>
    </div>
  );
};

export default GuideTab;
