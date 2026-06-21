import { useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import UpdateProfileDialog from "./UpdateProfileDialog";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-2xl">
          <div className="bg-gradient-glass rounded-2xl border border-border/30 overflow-hidden">
            <div className="max-w-4xl mx-auto p-4">
              {/* heading */}
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Tài khoản tài khoản
                </DialogTitle>
              </DialogHeader>

              <ProfileCard user={user} />

              {/* Profile Section */}
              <div className="px-4 pb-4">
                {/* Divider */}
                <div className="h-px bg-white-200 my-4" />

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground">
                    Thông tin cá nhân
                  </h4>

                  {/* Bio */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiểu sử
                    </p>
                    <p className="text-sm text-foreground font-medium break-words">
                      {user?.bio ? user.bio : "Chưa thêm tiểu sử"}
                    </p>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Tên hiển thị
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {user?.displayName}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">Email</p>
                    <p className="text-sm text-foreground font-medium">
                      {user?.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Điện thoại
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {user?.phone ? user.phone : "Chưa thêm số điện thoại"}
                    </p>
                  </div>

                  {/* Privacy Note */}
                  <p className="text-xs text-muted-foreground">
                    Có thể ẩn xem email hoặc số điện thoại đối với người lạ
                    trong cài đặt
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <Button
                onClick={() => setUpdateProfileOpen(true)}
                className="w-full text-white hover:opacity-90 transition-smooth"
              >
                <Edit2 className="size-4 mr-2" />
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateProfileDialog
        open={updateProfileOpen}
        setOpen={setUpdateProfileOpen}
      />
    </>
  );
};

export default ProfileDialog;
