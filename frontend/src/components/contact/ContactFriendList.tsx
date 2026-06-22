import { useAppPanelStore } from "@/stores/useAppPanelStore";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { useEffect, useMemo } from "react";
import FriendList from "../chat/FriendList";
import ContactFriendSekeleton from "../skeleton/ContactFriendSekeleton";
import ContactSearchBar from "./ContactSearchBar";
import AddFriendModal from "../chat/AddFriendModal";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

function sortFriends(friends: Friend[]) {
  return [...friends].sort((a, b) =>
    (a.displayName ?? a.username).localeCompare(
      b.displayName ?? b.username,
      "vi",
      { sensitivity: "base" },
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

  const emptyMessage = contactSearch.trim()
    ? "Không tìm thấy bạn bè phù hợp."
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-[60px] items-center border-b border-border/40 px-6">
        <h2 className="text-lg font-semibold">
          Danh sách bạn bè ({filteredFriends.length})
        </h2>
        <div className="ml-auto">
          <AddFriendModal
            trigger={
              <Button size="icon" variant="outline" className="shrink-0">
                <UserPlus className="size-4" />
              </Button>
            }
          />
        </div>
      </header>

      <ContactSearchBar placeholder="Tìm bạn bè theo tên hoặc username..." />

      <div className="flex-1 overflow-y-auto p-4 better-scrollbar">
        {loading && friends.length === 0 ? (
          <ContactFriendSekeleton />
        ) : (
          <FriendList
            friends={filteredFriends}
            onSelectFriend={handleAddConversation}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
};

export default ContactFriendList;
