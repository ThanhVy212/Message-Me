import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import FriendList from "../chat/FriendList";
import type { Conversation } from "@/types/chat";

interface AddMemberToGroupProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  chat: Conversation;
}

const AddMemberToGroup = ({ open, setOpen, chat }: AddMemberToGroupProps) => {
  const [search, setSearch] = useState("");

  const { addNewMembertoGroup } = useChatStore();
  const { friends } = useFriendStore();

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) => {
      const keyword = search.toLowerCase();

      return (
        friend.displayName?.toLowerCase().includes(keyword) ||
        friend.username?.toLowerCase().includes(keyword)
      );
    });
  }, [friends, search]);
  const handleAddMember = async (friendId: string) => {
    if (!chat) return;

    await addNewMembertoGroup(chat._id, friendId);

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới vào nhóm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <FriendList
            friends={filteredFriends}
            onSelectFriend={handleAddMember}
            showUnfriendButton={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberToGroup;
