import { cn, formatMessageTime, isSameId } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, Trash2, Undo } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useConfirm } from "@/hooks/useConfirm";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
  isGroup: boolean;
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
  isGroup,
}: MessageItemProps) => {
  const { user } = useAuthStore();
  const { recallMessage, deleteMessageMySide } = useChatStore();
  const { confirm, confirmDialog } = useConfirm();
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
  const isOwn = isSameId(message.senderId, user?._id);

  const isGroupBreak =
    index === 0 ||
    !isSameId(message.senderId, prev?.senderId) ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000;

  const participant = selectedConvo.participants.find((p: Participant) =>
    isSameId(p._id, message.senderId),
  );

  const handleRecall = async (messageId: string) => {
    const ok = await confirm({
      title: "Thu hồi tin nhắn",
      description: "Bạn có chắc chắn muốn thu hồi tin nhắn này không?",
      confirmText: "Thu hồi",
      variant: "destructive",
    });
    if (ok) await recallMessage(messageId);
  };

  const handleDeleteMySide = async (messageId: string) => {
    const ok = await confirm({
      title: "Xóa tin nhắn",
      description:
        "Bạn có chắc chắn muốn xóa tin nhắn này ở phía bạn không?",
      confirmText: "Xóa",
      variant: "destructive",
    });
    if (ok) await deleteMessageMySide(messageId);
  };

  return (
    <div className="flex flex-col w-full">
      {/* time */}
      {isGroupBreak && (
        <span className="flex justify-center text-xs text-muted-foreground px-1 my-2">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        className={cn(
          "flex w-full gap-2 message-bounce mt-1 items-center group/msg justify-start",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* avatar */}
        {!isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "Moji"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}

        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            isOwn ? "items-end" : "items-start",
          )}
        >
          <Card
            className={cn(
              "p-3 ring-1 ring-foreground/10 ring-inset",
              isOwn
                ? "chat-bubble-sent border-0"
                : "chat-bubble-received border-0",
              message.isRecalled &&
                "opacity-60 bg-muted/20 text-muted-foreground italic",
            )}
          >
            {/* sender if group chat */}
            {isGroup && !isOwn && isGroupBreak && (
              <p className="text-xs text-muted-foreground leading-none mb-0">
                {participant?.displayName ?? "unknow"}
              </p>
            )}

            <p className="text-sm leading-relaxed break-words m-0">
              {message.isRecalled
                ? "Tin nhắn đã được thu hồi"
                : message.content}
            </p>
          </Card>

          {/* seen/ delivered */}
          {isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>

        {/* Action dropdown next to bubble */}
        {!message.isRecalled && (
          <div
            className={cn(
              "opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200",
              isOwn ? "mr-1" : "ml-1",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center">
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                {isOwn && (
                  <DropdownMenuItem
                    onClick={() => void handleRecall(message._id)}
                    className="cursor-pointer"
                  >
                    <Undo className="size-4 mr-2" />
                    <span>Thu hồi tin nhắn</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => void handleDeleteMySide(message._id)}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="size-4 mr-2 text-destructive" />
                  <span>Xóa chỉ ở phía tôi</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {confirmDialog}
    </div>
  );
};

export default MessageItem;
