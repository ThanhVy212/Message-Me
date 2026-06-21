import { useThemeStore } from "@/stores/useThemeStore";
import { Moon, Palette, Sun } from "lucide-react";

const AppearanceTab = () => {
  const { isDark, setTheme } = useThemeStore();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Cài đặt giao diện
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tùy chỉnh chủ đề màu sắc và cách hiển thị của ứng dụng
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-xs font-semibold text-muted-foreground tracking-wider">
          Chủ đề hệ thống
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Card */}
          <button
            onClick={() => setTheme(false)}
            className={`group relative flex flex-col gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              !isDark
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/50 hover:border-border/80 hover:bg-muted/30"
            }`}
          >
            {/* Mini UI Preview - Light Mode */}
            <div className="w-full h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex flex-col p-2 gap-1.5 shadow-inner select-none">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-10 h-1.5 rounded bg-slate-300"></div>
              </div>
              <div className="flex-1 flex gap-2">
                <div className="w-6 rounded bg-slate-200"></div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="w-16 h-3 rounded-lg bg-blue-500 self-end shadow-sm"></div>
                  <div className="w-20 h-3 rounded-lg bg-slate-200 shadow-xs"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Sáng
              </span>
              {!isDark && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              )}
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            onClick={() => setTheme(true)}
            className={`group relative flex flex-col gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              isDark
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/50 hover:border-border/80 hover:bg-muted/30"
            }`}
          >
            {/* Mini UI Preview - Dark Mode */}
            <div className="w-full h-24 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col p-2 gap-1.5 shadow-inner select-none">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-10 h-1.5 rounded bg-slate-700"></div>
              </div>
              <div className="flex-1 flex gap-2">
                <div className="w-6 rounded bg-slate-800"></div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="w-16 h-3 rounded-lg bg-blue-600 self-end shadow-sm"></div>
                  <div className="w-20 h-3 rounded-lg bg-slate-800 shadow-xs"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                Tối
              </span>
              {isDark && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-border/20">
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              Sử dụng Avatar làm hình nền
            </span>
            <span className="text-xs text-muted-foreground">
              Hiển thị hình nền trò chuyện dựa trên ảnh đại diện của bạn
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              defaultChecked={false}
            />
            <div className="w-11 h-6 bg-muted border border-border/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-slate-300 peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
