"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
} from "viem";
import { z } from "zod";

import { storeShopMetadata } from "@/app/actions/shopMetadata";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { useSelectShop } from "@/providers/select-shop-provider";

const shopMetadataSchema = z.object({
  imageFile: z
    .any()
    .superRefine((files, ctx) => {
      if (!files) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload a file.",
          fatal: true,
        });

        return z.NEVER;
      }
      const fileList = Array.from(files as FileList) as File[];
      if (fileList.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload one file.",
          fatal: true,
        });

        return z.NEVER;
      }
      const file = fileList[0];
      if (file.size > 5000000 || file.size <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File size must be less than 5MB.",
          fatal: true,
        });

        return z.NEVER;
      }
      if (!file.type.startsWith("image/")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid file type. Please upload an image.",
          fatal: true,
        });

        return z.NEVER;
      }
    })
    .transform((files) => {
      const fileList = files as FileList;
      const file = Array.from(fileList) as File[];
      return file[0];
    }),
  name: z.string(),
  description: z.string().optional().nullable(),
});

type ShopMetadataFormData = z.infer<typeof shopMetadataSchema>;

export function CreateShopForm({ children }: { children: React.ReactNode }) {
  const { wallets } = useWallets();
  const { getShops } = useSelectShop();

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShopMetadataFormData>({
    resolver: zodResolver(shopMetadataSchema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(data: ShopMetadataFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Uploading metadata...",
      });
      const formData = new FormData();
      formData.append("file", data.imageFile);
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: formData,
        },
      );
      const resData = await res.json();
      const imageHash = resData.IpfsHash;

      const hash = await storeShopMetadata(
        data.name,
        data.description || "",
        imageHash,
      );
      console.log({ hash });

      await createShop(hash);

      getShops(wallets[0]);

      toast({
        title: "Success",
        description: "Created shop successfully",
      });

      // reset form
      reset();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error creating shop. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  const createShop = async (shopMetadataURI: string) => {
    toast({
      title: "Processing",
      description: "Sending transaction...",
    });

    const publicClient = createPublicClient({
      chain: chain,
      transport: custom(await wallets[0].getEthereumProvider()),
    });

    const walletClient = createWalletClient({
      chain: chain,
      transport: custom(await wallets[0].getEthereumProvider()),
      account: wallets[0].address as `0x${string}`,
    });
    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });

    // @ts-ignore
    const shopFactoryContract = getContract({
      address: contracts.ShopFactory.address as `0x${string}`,
      abi: contracts.ShopFactory.abi,
      client: {
        wallet: walletClient,
        public: publicClient,
      },
    });

    const initialAdmin = wallets[0].address;
    const hash = await shopFactoryContract.write.createShop([
      shopMetadataURI,
      initialAdmin,
    ]);
    toast({
      title: "Processing",
      description: `Waiting for transaction receipt, hash: ${hash}`,
    });
    // @ts-ignore
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });
    if (receipt.status !== "success") {
      throw new Error("Transaction failed, hash: " + hash);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={async (isOpen) => {
          setOpen(isOpen);
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent x-chunk="dashboard-07-chunk-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
          >
            <DialogHeader>
              <DialogTitle>Create new shop</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new onchain popshop*.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  type="text"
                  className="w-full"
                  placeholder="Onchain Summer Flowers"
                />
                {errors.name && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />
                {errors.description && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="imageFile">Image</Label>
                <Input
                  id="image"
                  multiple={false}
                  accept="image/*"
                  {...register("imageFile")}
                  type="file"
                  className="w-full"
                />
                {errors.imageFile && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.imageFile.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-x-2"
              >
                {isSaving && (
                  <Loader className="h-4 w-4 text-primary-foreground" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
