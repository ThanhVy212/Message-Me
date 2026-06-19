import { useAppPanelStore } from "@/stores/useAppPanelStore";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { useEffect, useMemo } from "react";
import FriendList from "../chat/FriendList";
import ContactFriendSekeleton from "../skeleton/ContactFriendSekeleton";

function sortFriends(friends: Friend[]) {
  return [...friends].sort((a, b) =>
    (a.displayName ?? a.username).localeCompare(
      b.displayName ?? b.username,
      "vi",
    ),
  );
}

const ContactFriendList = () => {
  const { contactSearch, setActivePanel } = useAppPanelStore();
  const { friends, loading, getFriends } = useFriendStore();
  const { createConversation } = useChatStore();

  useEffect(() => {
    void getFriends();
  }, [getFriends]);

  const handleAddConversation = async (friendId: string) => {
    await createConversation("direct", "", [friendId]);
    setActivePanel("chat");
  };

  const filteredFriends = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    let result = sortFriends(friends);

    if (query) {
      result = result.filter(
        (friend) =>
          friend.displayName?.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query),
      );
    }

    return result;
  }, [contactSearch, friends]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-[60px] items-center border-b border-border/40 px-6">
        <h2 className="text-lg font-semibold">
          Danh sách bạn bè ({filteredFriends.length})
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 better-scrollbar">
        {loading && filteredFriends.length === 0 ? (
          <ContactFriendSekeleton />
        ) : (
          <FriendList onSelectFriend={handleAddConversation} />
        )}

        {!loading && filteredFriends.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy bạn bè phù hợp.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactFriendList;
