import { useFriendStore } from "@/stores/useFriendStore";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Friend } from "@/types/user";
import { User, UserX } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import StatusBadge from "./StatusBadge";
import { Button } from "../ui/button";
import { useConfirm } from "@/hooks/useConfirm";

interface FriendListProps {
  onSelectFriend: (friendId: string) => void;
  friends?: Friend[];
  emptyMessage?: string;
}

const FriendList = ({
  onSelectFriend,
  friends: friendsProp,
  emptyMessage,
}: FriendListProps) => {
  const { friends: storeFriends, unfriend } = useFriendStore();
  const friends = friendsProp ?? storeFriends;
  const { onlineUsers } = useSocketStore();
  const { confirm, confirmDialog } = useConfirm();

  const handleUnfriend = async (friendId: string) => {
    const ok = await confirm({
      title: "Hủy kết bạn",
      description: "Bạn có chắc chắn muốn hủy kết bạn với người này không?",
      confirmText: "Hủy kết bạn",
      variant: "destructive",
    });
    if (ok) await unfriend(friendId);
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
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

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleUnfriend(friend._id);
                }}
              >
                <UserX className="size-4" />
              </Button>
            </div>
          </Card>
        );
      })}

      {friends.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="size-12 mx-auto mb-3 opacity-50" />
          {emptyMessage ?? "Hiện chưa có bạn bè! Thêm bạn mới để bắt đầu trò chuyện"}
        </div>
      )}
      {confirmDialog}
    </div>
  );
};

export default FriendList;
