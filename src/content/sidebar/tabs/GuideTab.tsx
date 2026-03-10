import React from "react";
import type { SOP, InterfaceState } from "../../../shared/types";
import StepCard from "../components/StepCard";
import ProgressBar from "../components/ProgressBar";

interface GuideTabProps {
  sop: SOP | null;
  interfaceState: InterfaceState;
}

const GuideTab: React.FC<GuideTabProps> = ({ sop }) => {
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

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold mb-1">{sop.title}</h2>
      <p className="text-xs text-pathfinder-text-muted mb-3">
        {sop.description}
      </p>
      <ProgressBar current={completedCount} total={sop.steps.length} />
      <div className="mt-3 space-y-2">
        {sop.steps.map((step) => (
          <StepCard key={step.stepNumber} step={step} />
        ))}
      </div>
    </div>
  );
};

export default GuideTab;
