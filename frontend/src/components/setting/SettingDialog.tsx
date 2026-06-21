import { useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Palette, Settings2, Settings, UserCog } from "lucide-react";
import Logout from "../auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";
import AccountTab from "./AccountTab";
import AppearanceTab from "./AppearanceTab";
import UtilitiesTab from "./UtilitiesTab";

interface SettingDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingDialog = ({ open, setOpen }: SettingDialogProps) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Trung tâm tài khoản", icon: UserCog },
    { id: "appearance", label: "Giao diện", icon: Palette },
    { id: "utilities", label: "Tiện ích", icon: Settings2 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 bg-transparent border-0 shadow-2xl w-[95vw] sm:max-w-4xl md:max-w-5xl h-[85vh] max-h-[600px] overflow-hidden rounded-2xl ring-0">
        <div className="flex flex-col h-full bg-gradient-glass backdrop-blur-xl border border-border/30 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Cài đặt
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Main Workspace: Split into Sidebar and Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-52 bg-muted/20 dark:bg-muted/5 border-r border-border/20 p-4 flex flex-col justify-between select-none">
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              <div className="space-y-2">
                <Logout />

                <div className="text-[10px] text-muted-foreground/60 text-center font-mono">
                  v1.0.0
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto better-scrollbar">
              {/* Account Tab */}
              {activeTab === "account" && user && <AccountTab user={user} />}

              {/* Appearance Tab */}
              {activeTab === "appearance" && <AppearanceTab />}

              {/* Utilities Tab */}
              {activeTab === "utilities" && <UtilitiesTab />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;
