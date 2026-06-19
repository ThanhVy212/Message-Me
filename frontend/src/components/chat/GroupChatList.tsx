import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
import { useEffect, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const GroupChatList = () => {
  const { conversations, activeConversationId } = useChatStore();
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, []);

  if (!conversations) return;

  const groupChats = conversations.filter((convo) => convo.type === "group");

  const sorted = [...groupChats].sort((a, b) => {
    if (a._id === activeConversationId) return -1;
    if (b._id === activeConversationId) return 1;

    const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();

    return timeB - timeA;
  });

  return (
    <div ref={parent} className="flex-1 overflow-y-auto p-2 space-y-2">
      {sorted.map((convo) => (
        <GroupChatCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default GroupChatList;
