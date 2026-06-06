import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "../ui/button";
import { toast } from "sonner";

const SentRequest = () => {
  const { cancelFriendRequest, sentList, loading } = useFriendStore();

  if (!sentList || sentList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa gửi lời mời kết bạn nào
      </p>
    );
  }

  const handleCancel = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      toast.info("Đã hủy lời mời kết bạn thành công");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <>
        {sentList.map((req) => (
          <FriendRequestItem
            key={req._id}
            requestInfo={req}
            type="sent"
            actions={
              <Button
                size="sm"
                variant="destructiveOutline"
                onClick={() => handleCancel(req._id)}
                disabled={loading}
              >
                Hủy lời mời
              </Button>
            }
          />
        ))}
      </>
    </div>
  );
};

export default SentRequest;
