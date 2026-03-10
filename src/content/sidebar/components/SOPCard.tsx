import React from "react";
import type { SOP } from "../../../shared/types";

interface SOPCardProps {
  sop: SOP;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
}

const SOPCard: React.FC<SOPCardProps> = ({
  sop,
  isActive,
  onActivate,
  onDelete,
}) => {
  return (
    <div
      className={`p-3 border rounded-lg ${
        isActive
          ? "border-pathfinder-primary bg-indigo-50"
          : "border-pathfinder-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{sop.title}</h3>
          <p className="text-xs text-pathfinder-text-muted mt-0.5 line-clamp-2">
            {sop.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {sop.interfaceTags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-pathfinder-text-muted mt-1">
            {sop.steps.length} steps
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {!isActive && (
            <button
              onClick={onActivate}
              className="text-[10px] font-medium text-pathfinder-primary hover:text-pathfinder-primary-hover"
            >
              Activate
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-[10px] font-medium text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOPCard;
