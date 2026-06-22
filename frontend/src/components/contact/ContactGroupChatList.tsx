import { useChatStore } from "@/stores/useChatStore";
import { useAppPanelStore } from "@/stores/useAppPanelStore";
import { UsersRound } from "lucide-react";
import ChatCard from "../chat/ChatCard";
import GroupChatAvatar from "../chat/GroupChatAvatar";
import { useEffect, useMemo, useRef } from "react";
import autoAnimate from "@formkit/auto-animate";

const ContactGroupChatList = () => {
  const {
    groupsList,
    hideConversation,
    addConvo,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();
  const { setActivePanel, contactSearch } = useAppPanelStore();
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, []);

  const sortedAndFiltered = useMemo(() => {
    if (!groupsList) return [];

    let result = [...groupsList].sort((a, b) =>
      (a.group?.name ?? "").localeCompare(b.group?.name ?? "", "vi", {
        sensitivity: "base",
      }),
    );

    const query = contactSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((c) =>
        (c.group?.name ?? "").toLowerCase().includes(query),
      );
    }

    return result;
  }, [groupsList, contactSearch]);

  const handleSelectGroup = async (id: string) => {
    await hideConversation(id, false);

    const groupConvo = groupsList.find((g) => g._id === id);
    if (groupConvo) {
      addConvo(groupConvo);
    }

    setActiveConversation(id);
    setActivePanel("chat");
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };

  if (!groupsList) return null;

  return (
    <div
      ref={parent}
      className="space-y-2 max-h overflow-y-auto better-scrollbar"
    >
      {sortedAndFiltered.map((convo) => {
        const name = convo.group?.name ?? "";
        return (
          <ChatCard
            key={convo._id}
            convoId={convo._id}
            name={name}
            timestamp={
              convo.lastMessage?.createdAt
                ? new Date(convo.lastMessage.createdAt)
                : undefined
            }
            isActive={false}
            onSelect={handleSelectGroup}
            unreadCount={0}
            showActions={false}
            leftSection={
              <GroupChatAvatar
                participants={convo.participants}
                type="chat"
                groupAvatarUrl={convo.group?.avatarUrl}
                groupName={name}
              />
            }
            subtitle={
              <p className="text-sm truncate text-muted-foreground">
                {convo.participants.length} thành viên
              </p>
            }
          />
        );
      })}

      {sortedAndFiltered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <UsersRound className="size-12 mx-auto mb-3 opacity-50" />
          {contactSearch.trim()
            ? "Không tìm thấy nhóm chat phù hợp."
            : "Chưa tham gia nhóm chat nào!"}
        </div>
      )}
    </div>
  );
};

export default ContactGroupChatList;
