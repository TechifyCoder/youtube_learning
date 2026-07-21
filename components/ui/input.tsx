import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full bg-white/[0.05] border border-white/[0.10] focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-[--text-primary] placeholder:text-[--text-disabled] outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
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
