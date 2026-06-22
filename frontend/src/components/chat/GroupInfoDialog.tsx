import { useConfirm } from "@/hooks/useConfirm";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Camera, Info, Shield } from "lucide-react";
import GroupChatAvatar from "./GroupChatAvatar";
import UserAvatar from "./UserAvatar";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import AddMemberToGroup from "./AddMemberToGroup";

const GroupInfoDialog = ({ chat }: { chat: Conversation }) => {
  const { uploadGroupAvatar, leaveGroup, transferAdmin, deleteGroup } =
    useChatStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const { confirm, confirmDialog } = useConfirm();

  const me = chat.participants.find((p) => p._id === user?._id);
  const isAdmin = me?.role === "admin";

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
      await uploadGroupAvatar(chat._id, formData);
    } catch (err) {
      console.error("Lỗi khi upload ảnh đại diện nhóm:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (isAdmin) {
      const otherParticipants = chat.participants.filter(
        (p) => p._id !== user?._id,
      );
      const ok = await confirm({
        title: "Cảnh báo",
        description:
          "Bạn là trưởng nhóm hãy nhường trưởng nhóm trước khi rời nhóm!",
        confirmText: "Đồng ý",
      });
      if (otherParticipants.length > 0) {
        if (ok) return;
      }
      return;
    }

    const ok = await confirm({
      title: "Rời nhóm",
      description: "Bạn có chắc chắn muốn rời khỏi nhóm chat này không?",
      confirmText: "Rời nhóm",
      variant: "destructive",
    });
    if (ok) await leaveGroup(chat._id);
  };

  const handleDeleteGroup = async () => {
    const ok = await confirm({
      title: "Xóa nhóm chat",
      description:
        "Bạn có chắc chắn muốn xóa nhóm chat này không? Mọi tin nhắn sẽ bị xóa cho tất cả mọi người.",
      confirmText: "Xóa nhóm",
      variant: "destructive",
    });
    if (ok) await deleteGroup(chat._id);
  };

  const handleTransferAdmin = async (memberId: string, name: string) => {
    const ok = await confirm({
      title: "Chuyển quyền trưởng nhóm",
      description: `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho ${name} không?`,
      confirmText: "Chuyển quyền",
    });
    if (ok) await transferAdmin(chat._id, memberId);
  };

  return (
    <>
      <Dialog>
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
            <DialogTitle>Thông tin nhóm</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative cursor-pointer group/avatar rounded-full overflow-hidden"
                onClick={handleAvatarClick}
              >
                <GroupChatAvatar
                  participants={chat.participants}
                  type="sidebar"
                  groupAvatarUrl={chat.group?.avatarUrl}
                  groupName={chat.group?.name}
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
              <h3 className="font-semibold text-lg">{chat.group?.name}</h3>
              <p className="text-xs text-muted-foreground">
                Nhóm chat • {chat.participants.length} thành viên
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-2">
              <h4 className="font-medium text-sm px-1">Thành viên</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 better-scrollbar">
                {chat.participants.map((member) => (
                  <div
                    key={member._id ?? member.displayName}
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
                          {member.role === "admin"
                            ? "Trưởng nhóm"
                            : "Thành viên"}
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

            <div className="flex flex-col gap-3 pt-2">
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
                className="w-full justify-center text-sm text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                onClick={() => void setAddMemberOpen(true)}
              >
                Thêm thành viên
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center text-sm text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => void handleLeaveGroup()}
              >
                Rời khỏi nhóm
              </Button>
            </div>
          </div>
        </DialogContent>
        {confirmDialog}
      </Dialog>

      <AddMemberToGroup
        open={addMemberOpen}
        setOpen={setAddMemberOpen}
        chat={chat}
      />
    </>
  );
};

export default GroupInfoDialog;
