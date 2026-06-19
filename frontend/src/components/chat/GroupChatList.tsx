import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
import { useEffect, useMemo, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const GroupChatList = () => {
  const { conversations } = useChatStore();
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, []);

  const groupChats = useMemo(() => {
    if (!conversations) return [];

    return conversations.filter((convo) => convo.type === "group");
  }, [conversations]);

  const sorted = useMemo(() => {
    return [...groupChats].sort((a, b) => {
      const timeA = new Date(
        a.lastMessageAt || a.updatedAt || a.createdAt,
      ).getTime();

      const timeB = new Date(
        b.lastMessageAt || b.updatedAt || b.createdAt,
      ).getTime();

      return timeB - timeA;
    });
  }, [groupChats]);

  if (!conversations) return null;

  return (
    <div ref={parent} className="flex-1 overflow-y-auto p-2 space-y-2">
      {sorted.map((convo) => (
        <GroupChatCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
};

export default GroupChatList;
