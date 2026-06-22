import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { useState, useRef } from "react";
import { ArrowLeft, Camera, Info, Shield, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useConfirm } from "@/hooks/useConfirm";
import UserAvatarLink from "./UserAvatarLink";
import type { User } from "@/types/user";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
import InvitedFriendList from "../newGroupChat/InvitedFriendList";
import { toast } from "sonner";
import { isSameId, normalizeId } from "@/lib/utils";

const GroupSettingsDialog = ({ chat }: { chat: Conversation }) => {
  const {
    uploadGroupAvatar,
    leaveGroup,
    transferAdmin,
    deleteGroup,
    addGroupMembers,
    fetchConversations,
    loading,
  } = useChatStore();
  const liveChat =
    useChatStore((state) =>
      state.conversations.find((c) => isSameId(c._id, chat._id)),
    ) ?? chat;
  const { user } = useAuthStore();
  const { friends, getFriends } = useFriendStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"info" | "add-members">("info");
  const [search, setSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const { confirm, confirmDialog } = useConfirm();

  const me = liveChat.participants.find((p) => isSameId(p._id, user?._id));
  const isAdmin = me?.role === "admin";

  const existingMemberIds = new Set(
    liveChat.participants.map((p) => normalizeId(p._id)),
  );

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !existingMemberIds.has(normalizeId(friend._id)) &&
      !invitedUsers.some((u) => isSameId(u._id, friend._id)),
  );

  const handleOpenAddMembers = async () => {
    await getFriends();
    setView("add-members");
    setSearch("");
    setInvitedUsers([]);
  };

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  };

  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
  };

  const handleAddMembers = async () => {
    if (invitedUsers.length === 0) {
      toast.warning("Hãy chọn ít nhất một thành viên");
      return;
    }

    try {
      await addGroupMembers(
        liveChat._id,
        invitedUsers.map((u) => u._id),
      );
      toast.success("Đã thêm thành viên vào nhóm");
      setView("info");
      setSearch("");
      setInvitedUsers([]);
    } catch {
      toast.error("Không thể thêm thành viên vào nhóm");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      const hasMissingMemberInfo = liveChat.participants.some(
        (p) => !p.displayName?.trim(),
      );
      if (hasMissingMemberInfo) {
        void fetchConversations();
      }
    } else {
      setView("info");
      setSearch("");
      setInvitedUsers([]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await uploadGroupAvatar(liveChat._id, formData);
    } catch (err) {
      console.error("Lỗi khi upload ảnh đại diện nhóm:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (isAdmin) {
      const otherParticipants = liveChat.participants.filter(
        (p) => !isSameId(p._id, user?._id),
      );
      if (otherParticipants.length > 0) {
        alert(
          "Bạn là trưởng nhóm. Hãy chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
        );
        return;
      }
    }

    const ok = await confirm({
      title: "Rời nhóm",
      description: "Bạn có chắc chắn muốn rời khỏi nhóm chat này không?",
      confirmText: "Rời nhóm",
      variant: "destructive",
    });
    if (ok) await leaveGroup(liveChat._id);
  };

  const handleDeleteGroup = async () => {
    const ok = await confirm({
      title: "Xóa nhóm chat",
      description:
        "Bạn có chắc chắn muốn xóa nhóm chat này không? Mọi tin nhắn sẽ bị xóa cho tất cả mọi người.",
      confirmText: "Xóa nhóm",
      variant: "destructive",
    });
    if (ok) await deleteGroup(liveChat._id);
  };

  const handleTransferAdmin = async (memberId: string, name: string) => {
    const ok = await confirm({
      title: "Chuyển quyền trưởng nhóm",
      description: `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho ${name} không?`,
      confirmText: "Chuyển quyền",
    });
    if (ok) await transferAdmin(liveChat._id, memberId);
  };

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Info className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === "info" ? "Thông tin nhóm" : "Thêm thành viên"}
          </DialogTitle>
        </DialogHeader>

        {view === "add-members" ? (
          <div className="space-y-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setView("info")}
            >
              <ArrowLeft className="size-4 mr-1" />
              Quay lại
            </Button>

            <div className="space-y-2">
              <Label htmlFor="add-member-search" className="text-sm font-semibold">
                Mời thành viên
              </Label>
              <Input
                id="add-member-search"
                placeholder="Tìm theo tên hiển thị"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && filteredFriends.length > 0 && (
                <InviteSuggestionList
                  filteredFriends={filteredFriends}
                  onSelect={handleSelectFriend}
                />
              )}

              <InvitedFriendList
                invitedFriends={invitedUsers}
                onRemove={handleRemoveFriend}
              />
            </div>

            <Button
              className="w-full cursor-pointer"
              disabled={loading || invitedUsers.length === 0}
              onClick={() => void handleAddMembers()}
            >
              {loading ? (
                "Đang thêm..."
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Thêm vào nhóm
                </>
              )}
            </Button>
          </div>
        ) : (
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative cursor-pointer group/avatar rounded-full overflow-hidden"
              onClick={handleAvatarClick}
            >
              <GroupChatAvatar
                participants={liveChat.participants}
                type="sidebar"
                groupAvatarUrl={liveChat.group?.avatarUrl}
                groupName={liveChat.group?.name}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Camera className="size-5 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={uploading}
            />
            {uploading && (
              <p className="text-xs text-primary animate-pulse">
                Đang tải lên...
              </p>
            )}
            <h3 className="font-semibold text-lg">{liveChat.group?.name}</h3>
            <p className="text-xs text-muted-foreground">
              Nhóm chat • {liveChat.participants.length} thành viên
            </p>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <h4 className="font-medium text-sm px-1">Thành viên</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 better-scrollbar">
              {liveChat.participants.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      type="sidebar"
                      name={member.displayName}
                      avatarUrl={member.avatarUrl ?? undefined}
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {member.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {member.role === "admin" && (
                          <Shield className="size-3 text-primary" />
                        )}
                        {member.role === "admin" ? "Trưởng nhóm" : "Thành viên"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "admin" ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-xs"
                      >
                        Trưởng nhóm
                      </Badge>
                    ) : (
                      isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                          onClick={() =>
                            void handleTransferAdmin(
                              member._id,
                              member.displayName,
                            )
                          }
                        >
                          Chuyển trưởng nhóm
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              className="w-full justify-center text-sm text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
              onClick={() => void handleOpenAddMembers()}
            >
              Thêm thành viên
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                className="w-full justify-center text-sm cursor-pointer"
                onClick={() => void handleDeleteGroup()}
              >
                Xóa nhóm chat
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-center text-sm text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={() => void handleLeaveGroup()}
            >
              Rời khỏi nhóm
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
      {confirmDialog}
    </Dialog>
  );
};

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 bg-muted px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) return;
  }

  return (
    <header className="sticky top-0 z-10 flex items-center bg-muted px-4 py-2">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator orientation="vertical" className="h-4 bg-sidebar-border" />

        <div className="p-2 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              {chat.type === "direct" ? (
                <UserAvatarLink
                  user={otherUser as User}
                  status={
                    onlineUsers.includes(otherUser?._id ?? "")
                      ? "online"
                      : "offline"
                  }
                />
              ) : (
                <GroupChatAvatar
                  participants={chat.participants}
                  type="sidebar"
                  groupAvatarUrl={chat.group?.avatarUrl}
                  groupName={chat.group?.name}
                />
              )}

            {/* name */}
            <h2 className="font-semibold text-foreground">
              {chat.type === "direct"
                ? otherUser?.displayName
                : chat.group?.name}
            </h2>
          </div>

          {/* info button for group chat */}
          {chat.type === "group" && <GroupSettingsDialog chat={chat} />}
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
