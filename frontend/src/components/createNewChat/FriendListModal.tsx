import { useFriendStore } from "@/stores/useFriendStore";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { MessageCircle, User } from "lucide-react";
import { Card } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { useChatStore } from "@/stores/useChatStore";

interface FriendListModalProps {
  onClose?: () => void;
}

const FriendListModal = ({ onClose }: FriendListModalProps) => {
  const { friends } = useFriendStore();
  const { createConversation } = useChatStore();

  const handleAddConversation = async (friendId: string) => {
    await createConversation("direct", "", [friendId]);

    onClose?.();
  };

  return (
    <DialogContent className="glass max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl capitalize">
          <MessageCircle className="size-5" />
          Bắt đầu cuộc hội thoại mới
        </DialogTitle>
      </DialogHeader>

      {/* friends list */}
      <div className="space-y-4">
        <h1 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          danh sách bạn bè
        </h1>

        <div className="space-y-2 max-h-60 overflow-y-auto better-scroll">
          {friends.map((friend) => (
            <Card
              key={friend._id}
              onClick={() => handleAddConversation(friend._id)}
              className="p-3 cursor-pointer transition-smooth hover:shadow-soft glass hover:bg-muted/30 group/friendCard ring-0"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  type="sidebar"
                  name={friend.displayName ?? ""}
                  avatarUrl={friend.avatarUrl ?? undefined}
                />

                <div>
                  <p className="font-medium">{friend.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    @{friend.username}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {friends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="size-12 mx-auto mb-3 opacity-50" />
              Hiện chưa có bạn bè! Thêm bạn mới để bắt đầu trò chuyện
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default FriendListModal;
