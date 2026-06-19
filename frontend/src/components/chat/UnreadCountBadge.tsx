import { CountBadge } from "../ui/count-badge";

const UnreadCountBadge = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className=" absolute z-20 -top-1.5 -right-1.5">
      <CountBadge
        count={unreadCount}
        className="size-5 text-[10px] border border-background"
      />
    </div>
  );
};

export default UnreadCountBadge;
