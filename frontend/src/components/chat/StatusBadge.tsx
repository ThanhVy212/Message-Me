import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: "online" | "offline" }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background",
        status === "online" && "status-online",
        status === "offline" && "status-offline",
      )}
    />
  );
};

export default StatusBadge;
