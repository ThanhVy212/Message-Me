import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect } from "react";
import { CountBadge } from "../ui/count-badge";
import ReceivedRequest from "../addFriendModal/ReceivedRequest";
import SentRequest from "../addFriendModal/SentRequest";

const ContactFriendRequests = () => {
  const { receivedList, sentList, getAllFriendRequests } = useFriendStore();
  useEffect(() => {
    void getAllFriendRequests();
  }, [getAllFriendRequests]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-[60px] items-center border-b border-border/40 px-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Lời mời kết bạn
          <CountBadge count={receivedList.length} className="text-xs" />
        </h2>
      </header>

      <div className="flex-1 space-y-8 overflow-y-auto p-6 better-scrollbar">
        <section>
          <h3 className="mb-4 text-base font-semibold">
            Lời mời đã nhận ({receivedList.length})
          </h3>
          <ReceivedRequest layout="card" />
        </section>

        <section>
          <h3 className="mb-4 text-base font-semibold">
            Lời mời đã gửi ({sentList.length})
          </h3>
          <SentRequest layout="card" />
        </section>
      </div>
    </div>
  );
};

export default ContactFriendRequests;
