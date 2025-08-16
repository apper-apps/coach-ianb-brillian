import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({
  className,
  elevation = "1",
  children,
  ...props
}, ref) => {
  const elevations = {
    "0": "",
    "1": "elevation-1",
    "2": "elevation-2", 
    "3": "elevation-3"
  };

  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-gray-200 p-6",
        elevations[elevation],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;