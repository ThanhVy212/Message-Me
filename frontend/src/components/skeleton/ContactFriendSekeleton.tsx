import { Card } from "../ui/card";

const ContactFriendSekeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="p-3 glass border-border/40 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ContactFriendSekeleton;
