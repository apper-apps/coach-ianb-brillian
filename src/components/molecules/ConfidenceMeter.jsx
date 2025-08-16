import React from "react";
import { cn } from "@/utils/cn";

const ConfidenceMeter = ({ 
  confidence = 0, 
  showPercentage = true,
  className = "" 
}) => {
  const getConfidenceLabel = (conf) => {
    if (conf >= 0.8) return { label: "High", color: "text-success" };
    if (conf >= 0.6) return { label: "Medium", color: "text-warning" };
    return { label: "Low", color: "text-error" };
  };

  const { label, color } = getConfidenceLabel(confidence);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Confidence</span>
          {showPercentage && (
            <span className={`text-sm font-semibold ${color}`}>
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="confidence-meter h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${confidence * 100}%`,
              maskImage: `linear-gradient(90deg, transparent 0%, black ${confidence * 100}%, transparent ${confidence * 100}%)`
            }}
          />
        </div>
      </div>
      <span className={`text-sm font-medium ${color}`}>
        {label}
      </span>
    </div>
  );
};

export default ConfidenceMeter;