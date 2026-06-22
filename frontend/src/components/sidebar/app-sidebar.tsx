import { useState } from "react";
import {
  BookUser,
  MessageCircleMore,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppPanel } from "@/types/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { CountBadge } from "../ui/count-badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppPanelStore } from "@/stores/useAppPanelStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "../chat/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ProfileDialog from "../profile/ProfileDialog";
import Logout from "../auth/Logout";
import SettingDialog from "../setting/SettingDialog";
import UserAvatarLink from "../chat/UserAvatarLink";

type NavItem = {
  id: AppPanel;
  label: string;
  icon: LucideIcon;
  panel: AppPanel;
};

const navItems: NavItem[] = [
  {
    id: "chat",
    label: "Tin nhắn",
    icon: MessageCircleMore,
    panel: "chat",
  },
  {
    id: "contacts",
    label: "Danh bạ",
    icon: BookUser,
    panel: "contacts",
  },
];

function AppSidebarIconButton({
  icon: Icon,
  label,
  isActive,
  onClick,
  badgeCount,
}: {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  badgeCount?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-xl text-white transition-colors",
            isActive ? "bg-black/25 shadow-inner" : "hover:bg-white/15",
          )}
        >
          <Icon className="size-5" />
          {badgeCount !== undefined && badgeCount > 0 && (
            <CountBadge
              count={badgeCount}
              className="absolute -top-1 -right-1 h-4 min-w-[16px] border border-primary text-[9px] shadow-sm"
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const { user } = useAuthStore();
  const { activePanel, setActivePanel } = useAppPanelStore();
  const { receivedList } = useFriendStore();
  const { conversations } = useChatStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);

  if (!user) {
    return;
  }

  const incomingRequestCount = receivedList.length;
  const totalUnreadCount = conversations.reduce(
    (sum, convo) => sum + (convo.unreadCounts?.[user._id] ?? 0),
    0,
  );

  return (
    <>
      <aside className="relative z-20 flex h-svh w-14 shrink-0 flex-col items-center bg-primary py-3">
        <UserAvatarLink user={user} className="mb-4" />

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <AppSidebarIconButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={item.panel === activePanel}
              onClick={() => setActivePanel(item.panel)}
              badgeCount={
                item.id === "contacts"
                  ? incomingRequestCount
                  : item.id === "chat"
                    ? totalUnreadCount
                    : undefined
              }
            />
          ))}
        </nav>

        {/* Settings dropdown */}
        <nav className="mt-auto flex flex-col items-center">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    aria-label="Cài đặt"
                    className="relative flex size-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                  >
                    <Settings className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>

              <TooltipContent side="right">Cài đặt</TooltipContent>
            </Tooltip>

            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1 p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar
                    type="chat"
                    name={user.displayName ?? ""}
                    avatarUrl={user.avatarUrl ?? undefined}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.displayName}
                    </span>
                    <span className="truncate text-xs">@{user.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User className="mr-2 size-4" />
                <span>Thông tin cá nhân</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSettingOpen(true)}>
                <Settings className="mr-2 size-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer"
                variant="destructive"
                asChild
              >
                <div>
                  <Logout />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </aside>

      <ProfileDialog open={profileOpen} setOpen={setProfileOpen} user={user} />
      <SettingDialog open={settingOpen} setOpen={setSettingOpen} />
    </>
  );
}
