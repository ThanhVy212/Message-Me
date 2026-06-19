import { cn } from "@/lib/utils";

interface CountBadgeProps {
  count: number;
  className?: string;
}

export function CountBadge({ count, className }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-sm transition-all duration-200",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
