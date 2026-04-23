import { assetPath } from "@/lib/asset-path.ts";
import { cn } from "@/lib/cn.ts";
import { type VariantProps, cva } from "class-variance-authority";

const ASSET_ICON = assetPath("icons/icon.svg");

const brandVariants = cva("flex-none select-none", {
  variants: {
    size: {
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: { size: "md" },
});

export type BrandMarkProps = VariantProps<typeof brandVariants> & {
  className?: string;
};

export function BrandMark({ size, className }: BrandMarkProps) {
  return (
    <img
      src={ASSET_ICON}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(brandVariants({ size }), className)}
    />
  );
}
