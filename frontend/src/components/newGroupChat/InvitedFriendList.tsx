import type { Friend } from "@/types/user";
import UserAvatar from "../chat/UserAvatar";
import { X } from "lucide-react";

interface InvitedFriendListProps {
  invitedFriends: Friend[];
  onRemove: (friend: Friend) => void;
}

const InvitedFriendList = ({
  invitedFriends,
  onRemove,
}: InvitedFriendListProps) => {
  if (invitedFriends.length === 0) {
    return;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {invitedFriends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1"
        >
          <UserAvatar
            type="chat"
            name={friend.displayName}
            avatarUrl={friend.avatarUrl}
          />

          <span className="font-medium">{friend.displayName}</span>

          <X
            className="size-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemove(friend)}
          />
        </div>
      ))}
    </div>
  );
};

export default InvitedFriendList;
