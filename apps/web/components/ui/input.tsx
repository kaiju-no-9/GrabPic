"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Input as BaseInput } from "baseui/input";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, type = "text", value, ...props }, ref) => {
    return (
      <BaseInput
        type={type}
        value={value}
        onChange={onChange}
        inputRef={ref as any}
        overrides={{
          Root: {
            style: ({ $isFocused }: any) => ({
              borderRadius: "8px", // {rounded.md}
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: $isFocused ? "#cfcdc4" : "#e6e5e0", // hairline strong / hairline
              backgroundColor: "#ffffff", // surface card
              height: "44px", // {spacing.height} 44px
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              boxShadow: $isFocused ? "0 0 0 2px rgba(245, 78, 0, 0.1)" : "none", // 10% Cursor Orange focus
              transition: "border-color 0.2s, box-shadow 0.2s",
              ":hover": {
                borderColor: $isFocused ? "#cfcdc4" : "#cfcdc4", // hairline strong
              }
            })
          },
          InputContainer: {
            style: {
              backgroundColor: "transparent",
            }
          },
          Input: {
            style: {
              paddingLeft: "16px",
              paddingRight: "16px",
              color: "#26251e",
              backgroundColor: "transparent",
              "::placeholder": {
                color: "#a09c92", // muted soft
              }
            }
          }
        }}
        {...(props as any)}
      />
    );
  }
);
Input.displayName = "Input";