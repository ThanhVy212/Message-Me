import { useAuthStore } from "@/stores/useAuthStore";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { chatService } from "@/services/chatService";
import type { Conversation } from "@/types/chat";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const [value, setValue] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một file hình ảnh");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Hình ảnh phải có dung lượng nhỏ hơn 2MB");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!value.trim() && !imageFile) return;
    const currValue = value;
    const currFile = imageFile;

    setValue("");
    handleRemoveImage();
    setIsUploading(true);

    try {
      let imgUrl: string | undefined;

      if (currFile) {
        const formData = new FormData();
        formData.append("file", currFile);
        imgUrl = await chatService.uploadMessageImage(formData);
      }

      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        
        if (!otherUser || !otherUser._id) {
          console.error("Không tìm thấy người nhận trong cuộc trò chuyện", {
            participants,
            userId: user._id,
          });
          toast.error("Không tìm thấy người nhận! Hãy thử lại");
          setIsUploading(false);
          return;
        }
        
        await sendDirectMessage(otherUser._id, currValue, imgUrl);
      } else {
        await sendGroupMessage(selectedConvo._id, currValue, imgUrl);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xảy ra khi gửi tin nhắn! Hãy thử lại");
      // Restore states on error
      setValue(currValue);
      if (currFile) {
        setImageFile(currFile);
        setImagePreview(URL.createObjectURL(currFile));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isUploading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full border-t border-border/40 bg-background">
      {/* Image preview box */}
      {imagePreview && (
        <div className="p-3 flex items-center justify-start border-b border-border/40 bg-muted/10">
          <div className="relative size-20 rounded-md overflow-hidden border border-border/60 shadow-sm bg-muted flex items-center justify-center">
            {isUploading ? (
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white text-[10px] gap-1 z-10">
                <Loader2 className="size-4 animate-spin" />
                <span>Đang gửi...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
            <img
              src={imagePreview}
              alt="Upload preview"
              className="size-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2 p-3 min-h-[56px]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-smooth cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ImagePlus className="size-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            onKeyDown={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Soạn tin nhắn..."
            className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
            disabled={isUploading}
          ></Input>

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-primary/10 transition-smooth cursor-pointer"
              disabled={isUploading}
            >
              <div>
                <EmojiPicker
                  onChange={(emoji: string) => setValue(`${value}${emoji}`)}
                />
              </div>
            </Button>
          </div>
        </div>

        <Button
          onClick={sendMessage}
          className="bg-primary hover:shadow-glow transition-smooth hover:scale-105 cursor-pointer"
          disabled={(!value.trim() && !imageFile) || isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 text-white animate-spin" />
          ) : (
            <Send className="size-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
