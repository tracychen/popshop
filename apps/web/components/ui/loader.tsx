import { cn } from "@/lib/utils";
import { Icons } from "../icons";

const Loader = ({className}) => {
  return <Icons.spinner className={cn("animate-spin text-foreground", className)} />;
};

export { Loader };
