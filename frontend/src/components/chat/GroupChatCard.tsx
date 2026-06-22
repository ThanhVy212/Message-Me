import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAppPanelStore } from "@/stores/useAppPanelStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { cn } from "@/lib/utils";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();
  const { setActivePanel } = useAppPanelStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user._id];
  const lastMessage = convo.lastMessage?.content ?? "";

  const lastMsg = convo.lastMessage;
  const senderId =
    lastMsg?.sender?._id ||
    (lastMsg as any)?.senderId?._id ||
    (lastMsg as any)?.senderId;
  const senderParticipant = convo.participants.find((p) => p._id === senderId);

  const isOwnMessage = senderId === user._id;

  const sender =
    senderParticipant?.displayName ?? lastMsg?.sender?.displayName ?? "";

  const name = convo.group?.name ?? "";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    setActivePanel("chat");
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          <GroupChatAvatar
            participants={convo.participants}
            type="chat"
            groupAvatarUrl={convo.group?.avatarUrl}
            groupName={name}
          />
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-foregorund"
              : "text-muted-foreground",
          )}
        >
          {convo.lastMessage
            ? `${isOwnMessage ? "Bạn" : sender}: ${lastMessage}`
            : `${convo.participants.length} thành viên`}
        </p>
      }
    />
  );
};

export default GroupChatCard;
