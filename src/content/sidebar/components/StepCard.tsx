import React from "react";
import type { SOPStep } from "../../../shared/types";
import { showOverlay } from "../../overlay";

interface StepCardProps {
  step: SOPStep;
  isCurrent: boolean;
  onToggleComplete: (stepNumber: number) => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, isCurrent, onToggleComplete }) => {
  const handleShowMe = async () => {
    if (step.targetSelector) {
      await showOverlay(step.targetSelector, step.title);
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg ${
        step.completed
          ? "opacity-60 border-pathfinder-border"
          : isCurrent
            ? "border-pathfinder-primary"
            : "border-pathfinder-border"
      }`}
      style={isCurrent && !step.completed ? {
        background: "#eef2ff",
        borderWidth: "2px",
        borderColor: "#6366f1",
      } : undefined}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleComplete(step.stepNumber)}
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
            step.completed
              ? "bg-green-500 border-green-500 text-white"
              : isCurrent
                ? "border-pathfinder-primary text-white bg-pathfinder-primary"
                : "border-pathfinder-primary text-pathfinder-primary hover:bg-pathfinder-primary hover:text-white"
          }`}
          title={step.completed ? "Mark incomplete" : "Mark complete"}
          style={step.completed ? { background: "#22c55e", borderColor: "#22c55e" } : isCurrent ? { background: "#6366f1", borderColor: "#6366f1" } : undefined}
        >
          {step.completed ? "✓" : step.stepNumber}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-medium ${
                step.completed ? "line-through text-pathfinder-text-muted" : ""
              }`}
            >
              {step.title}
            </h3>
            {isCurrent && !step.completed && (
              <span
                className="text-xs font-medium rounded-full px-2 py-0.5"
                style={{
                  background: "#6366f1",
                  color: "#ffffff",
                  fontSize: "10px",
                }}
              >
                CURRENT
              </span>
            )}
          </div>
          <p className="text-xs text-pathfinder-text-muted mt-0.5">
            {step.description}
          </p>
          {step.targetSelector && !step.completed && (
            <button
              onClick={handleShowMe}
              className="mt-2 text-xs font-medium text-pathfinder-primary hover:text-pathfinder-primary-hover"
            >
              Show me →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepCard;
