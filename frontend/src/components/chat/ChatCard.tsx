import { EyeOff, MoreHorizontal, Trash2 } from "lucide-react";
import { Card } from "../ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useChatStore } from "@/stores/useChatStore";
import { useConfirm } from "@/hooks/useConfirm";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
  showActions?: boolean;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
  showActions = true,
}: ChatCardProps) => {
  const { hideConversation, deleteConversation } = useChatStore();
  const { confirm, confirmDialog } = useConfirm();

  const handleHideConversation = async () => {
    const ok = await confirm({
      title: "Ẩn cuộc trò chuyện",
      description: "Bạn có chắc chắn muốn ẩn cuộc trò chuyện này không?",
      confirmText: "Ẩn",
    });
    if (ok) await hideConversation(convoId, true);
  };

  const handleDeleteConversation = async () => {
    const ok = await confirm({
      title: "Xóa cuộc trò chuyện",
      description:
        "Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Lịch sử tin nhắn sẽ bị xóa đối với bạn.",
      confirmText: "Xóa",
      variant: "destructive",
    });
    if (ok) await deleteConversation(convoId);
  };

  return (
    <Card
      key={convoId}
      className={cn(
        "border-none p-3 cursor-pointer transition-smooth hover:bg-muted/30 group",
        !isActive && "glass",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary/10 dark:from-primary/25 dark:to-sidebar-accent/70 dark:bg-primary/10 dark:ring-primary/30",
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                unreadCount && unreadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>

            <span className="text-xs text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>
            {showActions && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                      <MoreHorizontal className="size-4 hover:scale-110 transition-transform" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleHideConversation();
                      }}
                      className="cursor-pointer"
                    >
                      <EyeOff className="size-4 mr-2" />
                      <span>Ẩn cuộc trò chuyện</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteConversation();
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="size-4 mr-2 text-destructive" />
                      <span>Xóa cuộc trò chuyện</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
      {showActions && confirmDialog}
    </Card>
  );
};

export default ChatCard;
