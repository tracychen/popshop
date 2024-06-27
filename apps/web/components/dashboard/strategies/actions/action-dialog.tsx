import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ActionDialogTab = {
  tabValue: string;
  tabTitle: string;
  tabShortTitle?: string;
  tabDescription?: string;
  tabContent: React.ReactNode;
  tabFooter?: React.ReactNode;
};

export function ActionDialog({
  tabs,
  children,
}: {
  tabs: ActionDialogTab[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

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
          <DialogHeader>
            <DialogTitle>Actions</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={tabs[0].tabValue} className="pt-3">
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.tabValue} value={tab.tabValue}>
                  {tab.tabShortTitle || tab.tabTitle}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.tabValue} value={tab.tabValue}>
                <Card>
                  <CardHeader>
                    <CardTitle>{tab.tabTitle}</CardTitle>
                    {tab.tabDescription && (
                      <CardDescription>{tab.tabDescription}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>{tab.tabContent}</CardContent>
                  {tab.tabFooter && <CardFooter>{tab.tabFooter}</CardFooter>}
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
