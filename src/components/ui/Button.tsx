"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap tap-spring focus-ring disabled:pointer-events-none disabled:opacity-40 transition-colors",
  {
    variants: {
      variant: {
        primary: "text-white bg-accent hover:bg-[var(--accent-hover)]",
        secondary: "bg-surface hairline hover:bg-fill-subtle",
        ghost: "hover:bg-fill-subtle",
        outline: "hairline hover:bg-fill-subtle",
        destructive: "text-white bg-[var(--red)] hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-full",
        md: "h-11 px-5 text-base rounded-full",
        lg: "h-12 px-6 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
