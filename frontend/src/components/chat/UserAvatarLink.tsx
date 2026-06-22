import { useState } from "react";
import ProfileDialog from "../profile/ProfileDialog";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserAvatarLinkProps {
  user: User;
  status?: "online" | "offline";
  className?: string;
  avatarClassName?: string;
}

const UserAvatarLink = ({
  user,
  status,
  className,
  avatarClassName,
}: UserAvatarLinkProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Tài khoản"
        onClick={() => setProfileOpen(true)}
        className={cn(
          "relative inline-flex rounded-full ring-2 ring-white/30 transition-transform hover:scale-105 cursor-pointer",
          className,
        )}
      >
        <UserAvatar
          type="sidebar"
          name={user.displayName ?? ""}
          avatarUrl={user.avatarUrl ?? undefined}
          className={cn("size-9.5", avatarClassName)}
        />
        {status && <StatusBadge status={status} />}
      </button>

      <ProfileDialog open={profileOpen} setOpen={setProfileOpen} user={user} />
    </>
  );
};

export default UserAvatarLink;
