import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({
  className,
  type = "text",
  error,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        error && "border-error focus:border-error focus:ring-error/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;