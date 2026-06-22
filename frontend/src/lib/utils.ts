import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Participant } from "@/types/chat";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeId(id: unknown): string {
  if (id == null) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && "_id" in id) {
    return normalizeId((id as { _id: unknown })._id);
  }
  return String(id);
}

export function isSameId(a: unknown, b: unknown): boolean {
  return normalizeId(a) === normalizeId(b);
}

export function normalizeParticipant(part: unknown): Participant {
  const p = part as Record<string, unknown>;
  const userId = p.userId;

  if (typeof userId === "object" && userId !== null && "displayName" in userId) {
    const user = userId as Record<string, unknown>;
    return {
      _id: normalizeId(user._id),
      username: user.username as string | undefined,
      displayName: (user.displayName as string) ?? "",
      avatarUrl: (user.avatarUrl as string | null) ?? null,
      joinedAt: (p.joinedAt as string) ?? "",
      role: (p.role as Participant["role"]) ?? "member",
    };
  }

  return {
    _id: normalizeId(p._id ?? p.userId),
    username: p.username as string | undefined,
    displayName: (p.displayName as string) ?? "",
    avatarUrl: (p.avatarUrl as string | null) ?? null,
    joinedAt: (p.joinedAt as string) ?? "",
    role: (p.role as Participant["role"]) ?? "member",
  };
}

export const formatOnlineTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 60) {
    return `${diffMins}m`; // 5m, 45m
  } else if (diffHours < 24) {
    return `${diffHours}h`; // 3h, 20h
  } else if (diffDays < 30) {
    return `${diffDays}d`; // 1d, 12d
  } else if (diffMonths < 12) {
    return `${diffMonths}m`; // 1m, 2m, 11m
  } else {
    return `${diffYears}y`; // 1y, 2y
  }
};

export const formatMessageTime = (date: Date) => {
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) {
    return timeStr;
  }

  if (isYesterday) {
    return `Hôm qua, ${timeStr}`;
  }

  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return `${dateStr}, ${timeStr}`;
};
