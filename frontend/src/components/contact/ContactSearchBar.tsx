import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useAppPanelStore } from "@/stores/useAppPanelStore";

interface ContactSearchBarProps {
  placeholder: string;
}

const ContactSearchBar = ({ placeholder }: ContactSearchBarProps) => {
  const { contactSearch, setContactSearch } = useAppPanelStore();

  return (
    <div className="border-b border-border/40 px-6 py-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={contactSearch}
          onChange={(event) => setContactSearch(event.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
    </div>
  );
};

export default ContactSearchBar;
