import { useState } from "react";
import type { Participant } from "@/types/chat";
import SendFriendRequestForm from "../addFriendModal/SendFriendRequestForm";
import { useForm } from "react-hook-form";
import type { IFormValues } from "./AddFriendModal";
import { useFriendStore } from "@/stores/useFriendStore";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface UnfriendedChatNoticeProps {
  otherUser: Participant;
}

const UnfriendedChatNotice = ({ otherUser }: UnfriendedChatNoticeProps) => {
  const [open, setOpen] = useState(false);
  const { loading, addFriend } = useFriendStore();

  const { register, handleSubmit } = useForm<IFormValues>({
    defaultValues: { username: "", message: "" },
  });

  const handleSend = handleSubmit(async (data) => {
    if (!otherUser) return;

    try {
      const message = await addFriend(otherUser._id, data.message.trim());
      toast.success(message);
    } catch (err: any) {
      toast.error(err.message);
    }
  });

  return (
    <div className="flex min-h-[56px] items-center justify-center border-t bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
      <p>
        Người này đã hủy kết bạn! Có muốn{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer"
        >
          kết bạn lại
        </button>{" "}
        để trò chuyện?
      </p>

      {otherUser?.username && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Kết Bạn</DialogTitle>
            </DialogHeader>

            <SendFriendRequestForm
              register={register}
              loading={loading}
              searchedUsername={otherUser.username}
              onSubmit={handleSend}
              onBack={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UnfriendedChatNotice;
