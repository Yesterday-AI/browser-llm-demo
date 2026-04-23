import { cn } from "@/lib/cn.ts";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "../atoms/Button.tsx";

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, className, size = "md", ...props }: IconButtonProps) {
  return (
    <Button
      size={size}
      aria-label={label}
      title={label}
      className={cn(
        "aspect-square !px-0",
        size === "sm" && "w-8",
        size === "md" && "w-10",
        size === "lg" && "w-11",
        className,
      )}
      {...props}
    >
      {icon}
    </Button>
  );
}
