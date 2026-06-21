import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";
import z from "zod";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Eye, EyeOff, Lock } from "lucide-react";

interface AddPasswordDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const addPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const AddPasswordDialog = ({ open, setOpen }: AddPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuthStore();
  const { addPassword } = useUserStore();

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [open]);

  const getUsernameSuggestion = () => {
    if (!user?.email) return "...";
    return user.email.split("@")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = addPasswordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as "password" | "confirmPassword";
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await addPassword(password);
      setOpen(false);
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-2xl shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Thêm mật khẩu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-primary leading-relaxed">
            Thêm mật khẩu để có thể đăng nhập bằng tài khoản với tên đăng nhập
            là <strong>"{getUsernameSuggestion()}"</strong>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
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
              {loading ? "Đang lưu..." : "Thêm mật khẩu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPasswordDialog;
