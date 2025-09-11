"use client";

import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export interface SearchInputRef {
  focus: () => void;
}

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(({ 
  value, 
  onChange, 
  placeholder 
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const defaultPlaceholder = `Search models... (${isMac ? '⌘' : 'Ctrl'}+K)`;
  const finalPlaceholder = placeholder || defaultPlaceholder;

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }));

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={finalPlaceholder}
        value={value}
        aria-label={finalPlaceholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            inputRef.current?.blur();
          }
        }}
        className="pl-10 pr-10 placeholder:hidden sm:placeholder:inline"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";