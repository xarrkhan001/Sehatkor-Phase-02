import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base sizing
          "flex h-10 w-full rounded-md px-3 py-2 text-base md:text-sm",
          // Field visuals (light field on dark pages)
          "border border-slate-300 bg-gray-100 text-slate-900 placeholder:text-slate-500",
          // Remove offset ring so it doesn't clash with dark dialogs
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus:border-blue-500",
          // File input text color
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900",
          // Improve time/date picker indicator visibility
          "[&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
