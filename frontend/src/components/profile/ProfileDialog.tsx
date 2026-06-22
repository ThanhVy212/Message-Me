import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import UpdateProfileDialog from "./UpdateProfileDialog";
import type { User } from "@/types/user";
import { userService } from "@/services/userService";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: User | null;
}

const ProfileDialog = ({ open, setOpen, user }: ProfileDialogProps) => {
  const { user: currentUser } = useAuthStore();
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [displayUser, setDisplayUser] = useState<User | null>(user);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isMe = currentUser?._id === user?._id;

  useEffect(() => {
    setDisplayUser(user);
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;

    if (isMe && currentUser) {
      setDisplayUser(currentUser);
      return;
    }

    if (user.email) {
      setDisplayUser(user);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const fullProfile = await userService.getUserProfile(user._id);
        if (!cancelled) setDisplayUser(fullProfile);
      } catch (err) {
        console.error("Lỗi khi lấy profile người dùng", err);
        if (!cancelled) setDisplayUser(user);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [open, user, isMe, currentUser]);

  if (!user) return null;

  const profile = displayUser ?? user;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-2xl">
          <div className="bg-gradient-glass rounded-2xl border border-border/30 overflow-hidden">
            <div className="max-w-4xl mx-auto p-4">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Tài khoản
                </DialogTitle>
              </DialogHeader>

              <ProfileCard user={profile} />

              <div className="px-4 pb-4">
                <div className="h-px bg-white-200 my-4" />

                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground">
                    Thông tin cá nhân
                  </h4>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiểu sử
                    </p>
                    <p className="text-sm text-foreground font-medium break-words">
                      {loadingProfile && !profile.bio
                        ? "Đang tải..."
                        : profile.bio
                          ? profile.bio
                          : "Chưa thêm tiểu sử"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Tên hiển thị
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {profile.displayName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">Email</p>
                    <p className="text-sm text-foreground font-medium">
                      {loadingProfile && !profile.email
                        ? "Đang tải..."
                        : profile.email || "Không có email"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mt-1">
                      Điện thoại
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {loadingProfile && !profile.phone
                        ? "Đang tải..."
                        : profile.phone
                          ? profile.phone
                          : "Chưa thêm số điện thoại"}
                    </p>
                  </div>
                </div>
              </div>

              {isMe && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Có thể ẩn xem email hoặc số điện thoại đối với người lạ
                    trong cài đặt
                  </p>
                  <Button
                    onClick={() => setUpdateProfileOpen(true)}
                    className="w-full text-white"
                  >
                    <Edit2 className="size-4 mr-2" />
                    Cập nhật
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isMe && (
        <UpdateProfileDialog
          open={updateProfileOpen}
          setOpen={setUpdateProfileOpen}
        />
      )}
    </>
  );
};

export default ProfileDialog;
