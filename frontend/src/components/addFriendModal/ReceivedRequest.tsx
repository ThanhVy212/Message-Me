import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ReceivedRequest = () => {
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
    <div className="space-y-3 mt-4">
      {receivedList.map((req) => (
        <FriendRequestItem
          key={req._id}
          requestInfo={req}
          actions={
            <p className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleAccept(req._id)}
                disabled={loading}
              >
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="destructiveOutline"
                onClick={() => handleDecline(req._id)}
                disabled={loading}
              >
                Từ chối
              </Button>
            </p>
          }
          type="received"
        />
      ))}
    </div>
  );
};

export default ReceivedRequest;
