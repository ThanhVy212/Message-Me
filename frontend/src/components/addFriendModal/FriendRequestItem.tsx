import type { FriendRequest, User } from "@/types/user";
import type { ReactNode } from "react";
import UserAvatarLink from "../chat/UserAvatarLink";

interface RequestItemProps {
  requestInfo: FriendRequest;
  actions: ReactNode;
  type: "received" | "sent";
  layout?: "card" | "compact";
}

const formatRequestDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};

const FriendRequestItem = ({
  requestInfo,
  actions,
  type,
  layout = "compact",
}: RequestItemProps) => {
  if (!requestInfo) {
    return null;
  }

  const info = type === "sent" ? requestInfo.to : requestInfo.from;

  if (!info) {
    return null;
  }

  if (type === "received" && layout === "card") {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-start gap-3">
          <UserAvatarLink user={info as User} />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">{info.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {formatRequestDate(requestInfo.createdAt)} · @{info.username}
            </p>
          </div>
        </div>

        {requestInfo.message ? (
          <div className="mb-4 rounded-lg bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground/90 break-words">
            {requestInfo.message}
          </div>
        ) : null}

        <div className="w-full">{actions}</div>
      </div>
    );
  }

  if (type === "sent" && layout === "card") {
    return (
      <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <UserAvatarLink user={info as User} />

          <div className="min-w-0">
            <p className="truncate font-semibold">{info.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {formatRequestDate(requestInfo.createdAt)}
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">Bạn đã gửi lời mời</p>

        <div className="mt-auto">{actions}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-primary-foreground p-3 shadow-md">
      <div className="flex items-center gap-3">
        <UserAvatarLink user={info as User} />

        <div>
          <p className="font-medium">{info.displayName}</p>
          <p className="text-sm text-muted-foreground">@{info.username}</p>
          {type === "received" && requestInfo.message ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground break-words">
              {requestInfo.message}
            </p>
          ) : null}
        </div>
      </div>
      {actions}
    </div>
  );
};

export default FriendRequestItem;
