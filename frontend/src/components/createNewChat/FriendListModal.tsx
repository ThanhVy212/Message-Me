import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import FriendList from "../chat/FriendList";

interface FriendListModalProps {
  onClose?: () => void;
}

const FriendListModal = ({ onClose }: FriendListModalProps) => {
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

        <FriendList onSelectFriend={handleAddConversation} />
      </div>
    </DialogContent>
  );
};

export default FriendListModal;
