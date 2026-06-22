import { useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Conversation, Participant } from "@/types/chat";
import { isSameId } from "@/lib/utils";

export function useDirectConversationPeer(selectedConvo: Conversation | null) {
  const { user } = useAuthStore();
  const { friends } = useFriendStore();

  return useMemo(() => {
    if (!selectedConvo || selectedConvo.type !== "direct" || !user) {
      return { otherUser: null as Participant | null, isFriend: true };
    }

    const otherUser =
      selectedConvo.participants.find((p) => !isSameId(p._id, user._id)) ??
      null;

    if (!otherUser) {
      return { otherUser: null, isFriend: true };
    }

    const isFriend = friends.some((friend) => isSameId(friend._id, otherUser._id));

    return { otherUser, isFriend };
  }, [selectedConvo, user, friends]);
}
