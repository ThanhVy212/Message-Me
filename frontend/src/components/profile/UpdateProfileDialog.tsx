import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { User, Phone, FileText } from "lucide-react";
import { z } from "zod";

interface UpdateProfileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Tên hiển thị không được để trống")
    .max(40, "Tên hiển thị không quá 40 ký tự"),
});

const UpdateProfileDialog = ({ open, setOpen }: UpdateProfileDialogProps) => {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<{ displayName?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
    }
    setErrors({});
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateProfileSchema.safeParse({ displayName });

    if (!result.success) {
      const fieldErrors: { displayName?: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as "displayName";
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/users/update-profile", {
        displayName,
        phone,
        bio,
      });
      toast.success("Cập nhật thông tin thành công!");
      setUser(res.data.user);
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Lỗi xảy ra khi cập nhật thông tin",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Cập nhật thông tin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Tên hiển thị
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errors.displayName) {
                    setErrors((prev) => ({ ...prev, displayName: "" }));
                  }
                }}
                placeholder="Nhập tên hiển thị mới"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              {errors.displayName && (
                <p className="text-destructive text-xs mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Tiểu sử
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu bản thân..."
                maxLength={500}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">
                {bio.length}/500 ký tự
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl border-border hover:bg-muted text-foreground cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 shadow-md shadow-primary/10 cursor-pointer"
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
