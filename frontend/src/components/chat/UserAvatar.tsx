import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvaterProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvaterProps) => {
  const bgColor = !avatarUrl ? "bg-pink-400" : "";
  if (!name) {
    name = "Meme";
  }

  return (
    <Avatar
      className={cn(
        className ?? "",
        type === "sidebar" && "size-12 text-base",
        type === "chat" && "size-8 text-sm",
        type === "profile" && "size-24 text-3xl shadow-md",
      )}
    >
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
