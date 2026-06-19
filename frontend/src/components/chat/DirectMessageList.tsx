import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import { useEffect, useMemo, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const DirectMessageList = () => {
  const { conversations } = useChatStore();
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, []);

  const directConversations = useMemo(() => {
    if (!conversations) return [];

    return conversations.filter((convo) => convo.type === "direct");
  }, [conversations]);

  const sorted = useMemo(() => {
    return [...directConversations].sort((a, b) => {
      const timeA = new Date(
        a.lastMessageAt || a.updatedAt || a.createdAt,
      ).getTime();

      const timeB = new Date(
        b.lastMessageAt || b.updatedAt || b.createdAt,
      ).getTime();

      return timeB - timeA;
    });
  }, [directConversations]);

  if (!conversations) return null;

  return (
    <div ref={parent} className="flex-1 overflow-y-auto p-2 space-y-2">
      {sorted.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
