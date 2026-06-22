import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import UnfriendedChatNotice from "./UnfriendedChatNotice";
import { useEffect } from "react";
import ChatWindowSkeleton from "../skeleton/ChatWindowSkeleton";
import { useFriendStore } from "@/stores/useFriendStore";
import { useDirectConversationPeer } from "@/hooks/useDirectConversationPeer";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    markAsSeen,
  } = useChatStore();
  const getFriends = useFriendStore((state) => state.getFriends);

  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;
  const { otherUser, isFriend } = useDirectConversationPeer(selectedConvo);

  useEffect(() => {
    void getFriends();
  }, [getFriends, activeConversationId]);

  useEffect(() => {
    if (!selectedConvo) {
      return;
    }

    const markSeen = async () => {
      try {
        await markAsSeen();
      } catch (err) {
        console.error("Lỗi khi markSeen", err);
      }
    };
    markSeen();
  }, [markAsSeen, selectedConvo]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* Header */}
      <ChatWindowHeader chat={selectedConvo} />

      {/* Body */}
      <div className="flex-1 min-h-0">
        <ChatWindowBody />
      </div>

      {/* Footer */}
      {selectedConvo.type === "direct" && !isFriend && otherUser ? (
        <UnfriendedChatNotice otherUser={otherUser} />
      ) : (
        <MessageInput selectedConvo={selectedConvo} />
      )}
    </SidebarInset>
  );
};

export default ChatWindowLayout;
