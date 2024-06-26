import { cn } from "@/lib/utils";

import { Icons } from "../icons";

export const Logo = ({ className }: { className?: string }) => {
  return <Icons.flower className={cn("h-8 w-8", className)} weight="fill" />;
};

export default Logo;
