import { useChatStore } from "@/stores/useChatStore";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import ContactFriendSekeleton from "../skeleton/ContactFriendSekeleton";
import GroupChatList from "../chat/GroupChatList";

const ContactGroupList = () => {
  const { convoLoading } = useChatStore();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-[60px] items-center justify-between border-b border-border/40 px-6">
        <h2 className="text-lg font-semibold">Danh sách nhóm chat</h2>
        <NewGroupChatModal />
      </header>

      <div className="flex-1 overflow-y-auto p-4 better-scrollbar">
        {convoLoading ? <ContactFriendSekeleton /> : <GroupChatList />}
      </div>
    </div>
  );
};

export default ContactGroupList;
