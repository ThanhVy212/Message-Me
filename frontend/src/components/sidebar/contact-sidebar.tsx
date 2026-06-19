import { useAppPanelStore } from "@/stores/useAppPanelStore";
import type { ContactTab } from "@/types/store";
import { Search, UserPlus, Users, UsersRound } from "lucide-react";
import { Input } from "../ui/input";
import AddFriendModal from "../chat/AddFriendModal";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CountBadge } from "../ui/count-badge";
import { useFriendStore } from "@/stores/useFriendStore";

const navItems: {
  id: ContactTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "friends", label: "Danh sách bạn bè", icon: Users },
  { id: "groups", label: "Danh sách nhóm chát", icon: UsersRound },
  { id: "requests", label: "Lời mời kết bạn", icon: UserPlus },
];

export function ContactSidebar() {
  const { contactTab, contactSearch, setContactTab, setContactSearch } =
    useAppPanelStore();
  const { receivedList } = useFriendStore();

  const incomingRequestCount = receivedList.length;

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-[60px] items-center border-b border-sidebar-border px-3">
        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={contactSearch}
              onChange={(event) => setContactSearch(event.target.value)}
              placeholder="Tìm kiếm"
              className="pl-9"
            />
          </div>

          <AddFriendModal
            trigger={
              <Button size="icon" variant="outline" className="shrink-0">
                <UserPlus className="size-4" />
              </Button>
            }
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = contactTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setContactTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
              {item.id === "requests" && (
                <CountBadge count={incomingRequestCount} className="ml-auto" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
