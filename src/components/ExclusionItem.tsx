import { X } from "lucide-react";

interface ExclusionItemProps {
  text: string;
}

export const ExclusionItem = ({ text }: ExclusionItemProps) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
        <X className="w-3 h-3 text-destructive" />
      </span>
      <span className="text-body">{text}</span>
    </div>
  );
};
