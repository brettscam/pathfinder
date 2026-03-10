import React from "react";
import type { SOPStep } from "../../../shared/types";
import { showOverlay } from "../../overlay";

interface StepCardProps {
  step: SOPStep;
  onToggleComplete: (stepNumber: number) => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, onToggleComplete }) => {
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
        <button
          onClick={() => onToggleComplete(step.stepNumber)}
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
            step.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-pathfinder-primary text-pathfinder-primary hover:bg-pathfinder-primary hover:text-white"
          }`}
          title={step.completed ? "Mark incomplete" : "Mark complete"}
        >
          {step.completed ? "✓" : step.stepNumber}
        </button>
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
          {step.targetSelector && !step.completed && (
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
