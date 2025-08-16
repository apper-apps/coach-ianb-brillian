import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ApperIcon 
        name="ChevronDown" 
        size={20}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  );
});

Select.displayName = "Select";

export default Select;