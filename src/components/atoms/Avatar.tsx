import { assetPath } from "@/lib/asset-path.ts";
import { cn } from "@/lib/cn.ts";
import { type VariantProps, cva } from "class-variance-authority";

const DEFAULT_AVATAR = assetPath("icons/avatar.svg");

const avatarVariants = cva("overflow-hidden rounded-full bg-neutral-900 object-cover", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
    },
  },
  defaultVariants: { size: "md" },
});

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  src?: string;
  alt: string;
  className?: string;
};

export function Avatar({ src = DEFAULT_AVATAR, alt, size, className }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={cn(avatarVariants({ size }), className)}
    />
  );
}
