import React from "react";
import type { SOPStep } from "../../../shared/types";
import { showOverlay } from "../../overlay";

interface StepCardProps {
  step: SOPStep;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const handleShowMe = async () => {
    if (step.targetSelector) {
      await showOverlay(step.targetSelector, step.title);
    }
  };

  return (
    <div
      className={`p-3 border border-pathfinder-border rounded-lg ${
        step.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-pathfinder-primary text-white text-xs font-medium">
          {step.stepNumber}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium ${
              step.completed ? "line-through text-pathfinder-text-muted" : ""
            }`}
          >
            {step.title}
          </h3>
          <p className="text-xs text-pathfinder-text-muted mt-0.5">
            {step.description}
          </p>
          {step.targetSelector && (
            <button
              onClick={handleShowMe}
              className="mt-2 text-xs font-medium text-pathfinder-primary hover:text-pathfinder-primary-hover"
            >
              Show me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepCard;
