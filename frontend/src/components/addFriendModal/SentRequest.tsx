import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "../ui/button";
import { toast } from "sonner";

const SentRequest = ({
  layout = "compact",
}: {
  layout?: "card" | "compact";
}) => {
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sentList.map((req) => (
        <FriendRequestItem
          key={req._id}
          requestInfo={req}
          type="sent"
          layout={layout}
          actions={
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-lg"
              onClick={() => handleCancel(req._id)}
              disabled={loading}
            >
              Thu hồi lời mời
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default SentRequest;
