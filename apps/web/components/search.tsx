"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function Search({
  className,
  includeSubmitButton = true,
}: {
  className?: string;
  includeSubmitButton?: boolean;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchString, setSearchString] = useState("");

  const router = useRouter();

  const onSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      if (!searchString || searchString.length <= 0) {
        setIsSearching(false);
        return toast({
          title: "Error",
          description: "No search string provided copy",
          variant: "destructive",
        });
      }
      // TODO search logic
      // e.g. router.push(`/search/${searchString}`);
    } catch (e) {
      setIsSearching(false);
      toast({
        title: "Error",
        description: "Error searching. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-x-1">
      <Input
        type="text"
        placeholder="Search for markets..."
        className={cn(className)}
        onChange={(e) => setSearchString(e.target.value)}
      />
      {includeSubmitButton && (
        <button type="submit" className={cn(buttonVariants(), "gap-1")}>
          {isSearching && <Icons.spinner className="h-4 w-4 animate-spin" />}
          Search
        </button>
      )}
    </form>
  );
}
