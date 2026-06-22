import type { Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
  groupAvatarUrl?: string | null;
  groupName?: string;
}

const GroupChatAvatar = ({
  participants,
  type,
  groupAvatarUrl,
  groupName,
}: GroupChatAvatarProps) => {
  if (groupAvatarUrl) {
    return (
      <UserAvatar
        type={type}
        name={groupName ?? "Group"}
        avatarUrl={groupAvatarUrl}
        className="size-12 shrink-0"
      />
    );
  }

  const showBadge = participants.length > 4;

  const visible = showBadge ? participants.slice(0, 3) : participants;

  const extra = participants.length - 3;

  return (
    <div className="relative size-12 shrink-0">
      <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full">
        {visible.map((member, index) => (
          <UserAvatar
            key={member._id ?? index}
            type={type}
            name={member.displayName}
            avatarUrl={member.avatarUrl ?? undefined}
            className="size-full"
          />
        ))}

        {showBadge && (
          <div className="flex items-center justify-center rounded-full bg-muted text-xs font-medium">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatAvatar;
