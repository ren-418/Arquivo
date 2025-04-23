import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string | number;
    onChange: (value: string) => void;
    allowLeadingZeros?: boolean;
    allowDecimals?: boolean;
    allowNegative?: boolean;
    maxLength?: number;
    className?: string;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            className,
            value,
            onChange,
            allowLeadingZeros = true,
            allowDecimals = false,
            allowNegative = false,
            maxLength,
            ...props
        },
        ref
    ) => {
        // Convert any number value to string for display
        const displayValue = value.toString();

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;



            // Allow completely empty input (user deleting all characters)
            if (newValue === "") {
                onChange("");
                return;
            }

            // Validate based on provided options
            let pattern = "^";

            // Add optional negative sign
            if (allowNegative) {
                pattern += "-?";
            }

            // Main number pattern
            if (allowLeadingZeros) {
                pattern += "[0-9]*";
            } else {
                pattern += "0|[1-9][0-9]*";
            }

            // Add optional decimal part
            if (allowDecimals) {
                pattern += "(\\.[0-9]*)?";
            }

            pattern += "$";

            const regex = new RegExp(pattern);

            if (regex.test(newValue)) {
                // If maxLength is set, enforce it
                if (maxLength && newValue.length > maxLength) {
                    return;
                }

                onChange(newValue);
            }
        };

        // Handle blur event - set to "0" if empty
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (displayValue === "") {
                onChange("0");
            }

            // Call the original onBlur if provided
            if (props.onBlur) {
                props.onBlur(e);
            }
        };

        return (
            <Input
                type="text"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn("", className)}
                ref={ref}
                {...props}
            />
        );
    }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };