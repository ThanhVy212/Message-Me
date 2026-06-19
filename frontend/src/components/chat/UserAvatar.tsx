import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  const bgColor = !avatarUrl ? "bg-pink-400" : "";

  const displayName = name || "Meme";

  return (
    <Avatar
      className={cn(
        type === "profile" && "size-24 text-3xl shadow-md",

        type === "sidebar" && (className ? className : "size-12 text-base"),

        type === "chat" && (className ? className : "size-8 text-sm"),
      )}
    >
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
