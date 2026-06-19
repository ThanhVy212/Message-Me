import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import ContactLayout from "@/components/contact/ContactLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ContactSidebar } from "@/components/sidebar/contact-sidebar";
import { MessageSidebar } from "@/components/sidebar/message-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAppPanelStore } from "@/stores/useAppPanelStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect } from "react";

const ChatAppPage = () => {
  const { activePanel } = useAppPanelStore();
  const { getAllFriendRequests } = useFriendStore();

  useEffect(() => {
    void getAllFriendRequests();
  }, [getAllFriendRequests]);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <div className="flex h-full w-full">
        <AppSidebar />
        {activePanel === "chat" && (
          <>
            <MessageSidebar />
            <SidebarInset className="flex flex-1 min-w-0 flex-col p-2 overflow-hidden">
              <ChatWindowLayout />
            </SidebarInset>
          </>
        )}
        {activePanel === "contacts" && (
          <>
            <ContactSidebar />
            <ContactLayout />
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

export default ChatAppPage;
