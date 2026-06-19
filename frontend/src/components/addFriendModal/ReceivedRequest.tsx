import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ReceivedRequest = ({
  layout = "compact",
}: {
  layout?: "card" | "compact";
}) => {
  const { acceptFriendRequest, declineFriendRequest, loading, receivedList } =
    useFriendStore();
  if (!receivedList || receivedList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa có lời mời kết bạn nào
      </p>
    );
  }

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success("Đã đồng ý kết bạn thành công");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      toast.info("Đã từ chối kết bạn thành công");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {receivedList.map((req) => (
        <FriendRequestItem
          key={req._id}
          requestInfo={req}
          layout={layout}
          actions={
            <div
              className={layout === "card" ? "flex w-full gap-4" : "flex gap-2"}
            >
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => handleDecline(req._id)}
                disabled={loading}
              >
                Từ chối
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="flex-1 rounded-lg"
                onClick={() => handleAccept(req._id)}
                disabled={loading}
              >
                Đồng ý
              </Button>
            </div>
          }
          type="received"
        />
      ))}
    </div>
  );
};

export default ReceivedRequest;
