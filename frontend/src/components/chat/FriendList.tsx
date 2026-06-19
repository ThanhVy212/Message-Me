import { useFriendStore } from "@/stores/useFriendStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { User } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import StatusBadge from "./StatusBadge";

interface FriendListProps {
  onSelectFriend: (friendId: string) => void;
}

const FriendList = ({ onSelectFriend }: FriendListProps) => {
  const { friends } = useFriendStore();
  const { onlineUsers } = useSocketStore();

  return (
    <div className="space-y-2 max-h overflow-y-auto better-scrollbar">
      {friends.map((friend) => {
        const isOnline = onlineUsers.includes(friend._id);

        return (
          <Card
            key={friend._id}
            onClick={() => onSelectFriend(friend._id)}
            className="p-3 cursor-pointer transition-smooth hover:shadow-soft glass hover:bg-muted/30 group/friendCard ring-0"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  type="sidebar"
                  name={friend.displayName ?? ""}
                  avatarUrl={friend.avatarUrl ?? undefined}
                  className="size-12"
                />
                <StatusBadge status={isOnline ? "online" : "offline"} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">{friend.displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  @{friend.username}
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {friends.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="size-12 mx-auto mb-3 opacity-50" />
          Hiện chưa có bạn bè! Thêm bạn mới để bắt đầu trò chuyện
        </div>
      )}
    </div>
  );
};

export default FriendList;
