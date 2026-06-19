import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import { useEffect, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const DirectMessageList = () => {
  const { conversations, activeConversationId } = useChatStore();
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, []);

  if (!conversations) return;

  const directConversations = conversations.filter(
    (convo) => convo.type === "direct",
  );

  const sorted = [...directConversations].sort((a, b) => {
    if (a._id === activeConversationId) return -1;
    if (b._id === activeConversationId) return 1;

    const timeA = new Date(
      a.lastMessageAt || a.updatedAt || a.createdAt,
    ).getTime();
    const timeB = new Date(
      b.lastMessageAt || b.updatedAt || b.createdAt,
    ).getTime();
    return timeB - timeA;
  });

  return (
    <div ref={parent} className="flex-1 overflow-y-auto p-2 space-y-2">
      {sorted.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
