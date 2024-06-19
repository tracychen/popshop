"use client";

import User from "@/models/User.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { buttonVariants } from "../ui/button";
import { Icons } from "../icons";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

interface SettingsFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Partial<User>;
}

const settingsSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  deleteAccount: z.boolean().default(false).optional().nullable(),
});

type FormData = z.infer<typeof settingsSchema>;

export function SettingsForm({ user, className, ...props }: SettingsFormProps) {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      imageUrl: user?.imageUrl,
      deleteAccount: false,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    // TODO replace with correct endpoint
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO confirm that this is the correct data to send
        imageUrl: data.imageUrl,
        deleteAccount: data.deleteAccount,
      }),
    });

    setIsSaving(false);

    if (!response?.ok) {
      return toast({
        title: "Error",
        description: "Error updating settings. Please try again.",
        variant: "destructive",
      });
    }

    toast({
      description: "Settings updated.",
    });

    router.refresh();
  }

  return (
    <form
      className={cn(className, "flex flex-col gap-4")}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="imageUrl">Profile Picture</Label>
        <Input id="imageUrl" {...register("imageUrl")} type="file" />
        {errors.imageUrl && (
          <p className="px-1 text-xs text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>
      <div className="items-top flex space-x-2">
        <Checkbox
          id="deleteAccount"
          {...register("deleteAccount")}
          checked={watch("deleteAccount")}
          onCheckedChange={(checked: boolean) => {
            setValue("deleteAccount", checked);
          }}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="deleteAccount"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Delete Account
          </label>
          {watch("deleteAccount") && (
            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        className={cn(buttonVariants(), "w-full sm:w-[400px]")}
        disabled={isSaving}
      >
        {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        <span>Save</span>
      </button>
    </form>
  );
}
