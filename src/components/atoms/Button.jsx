import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md",
    secondary: "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm hover:shadow-md",
    accent: "bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 shadow-sm hover:shadow-md",
    outline: "border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-error text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;