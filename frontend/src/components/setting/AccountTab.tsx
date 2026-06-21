import type { User } from "@/types/user";
import { Button } from "../ui/button";
import { UserCog } from "lucide-react";

const AccountTab = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-5 h-5 text-primary" />
          Thông tin tài khoản
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Cập nhật thông tin cá nhân và quản lý bảo mật của bạn
        </p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-wider mb-2">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={user?.username}
            readOnly
            className="w-full px-3.5 py-2 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email}
            readOnly
            className="w-full px-3.5 py-2 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="pt-4">
          <Button className="bg-destructive hover:bg-destructive/80 text-primary-foreground rounded-xl px-5 py-2.5 font-medium transition-all shadow-md shadow-primary/10 cursor-pointer">
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
