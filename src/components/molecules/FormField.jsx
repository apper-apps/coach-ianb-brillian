import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";

const FormField = ({ 
  label, 
  error, 
  required = false,
  className = "",
  children,
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      
      {children || <Input error={error} {...props} />}
      
      {error && (
        <p className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;