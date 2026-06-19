import { useAppPanelStore } from "@/stores/useAppPanelStore";
import ContactFriendList from "./ContactFriendList";
import ContactGroupList from "./ContactGroupList";
import ContactFriendRequests from "./ContactFriendRequests";

const ContactLayout = () => {
  const { contactTab } = useAppPanelStore();
  return (
    <main className="flex flex-1 flex-col min-w-0 overflow-hidden bg-background">
      {contactTab === "friends" && <ContactFriendList />}
      {contactTab === "groups" && <ContactGroupList />}
      {contactTab === "requests" && <ContactFriendRequests />}
    </main>
  );
};

export default ContactLayout;
