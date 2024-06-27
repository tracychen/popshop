"use client";

import { Fish, Lightbulb } from "@phosphor-icons/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectShop } from "@/providers/select-shop-provider";

import { DiscountStrategies } from "./strategies/discount-strategies";
import { FeeShareStrategies } from "./strategies/fee-share-strategies";
import { RewardStrategies } from "./strategies/reward-strategies";

export function StrategiesDashboard() {
  const { shop } = useSelectShop();

  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Manage Strategies</CardTitle>
            <CardDescription>
              You must select a shop to view and manage strategies.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card x-chunk="dashboard-07-chunk-0">
        <CardHeader>
          <CardTitle>Manage Strategies</CardTitle>
          <CardDescription>
            Create, deploy, and manage strategies for your shop.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {/* FAQ */}
          <Accordion type="single" collapsible>
            <AccordionItem value="overview">
              <AccordionTrigger>
                <div>
                  <Fish className="mr-2 inline" />
                  nani?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    <p>
                      Strategies are a way to incentivize purchases onchain.
                      Currently through the UI, you can create three types of
                      strategies:
                    </p>
                    <ul className="list-inside list-disc">
                      <li>Reward: Reward buyers for their purchases</li>
                      <li>
                        Fee Share: Share fees with other users e.g. referrers
                      </li>
                      <li>Discount: Offer discounts to buyers</li>
                    </ul>
                  </div>
                  <div>
                    Strategies are represented as smart contracts onchain. When
                    a buyer purchases an item, the strategy contract is called
                    to determine the incentives the buyer receives. Strategies
                    can be created from predefined templates or custom
                    contracts.
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-to">
              <AccordionTrigger>
                <div>
                  <Lightbulb className="mr-2 inline" />
                  how to create a strategy
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    <p>To create a strategy from a template:</p>
                    <ol className="list-inside list-decimal">
                      <li>
                        Find the type of strategy you want to create below
                      </li>
                      <li>
                        {`Click "Create from template" and select one of the predefined strategy
                templates`}
                      </li>
                      <li>Fill out the necessary inputs for the strategy</li>
                      <li>Deploy contract for the strategy</li>
                      <li>Complete strategy-specific funding requirements</li>
                    </ol>
                  </div>
                  <p>
                    Alternatively, you can also write and register your own for
                    more customization and creativity on purchase incentives
                    onchain! Docs coming soon.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <Tabs defaultValue={"reward"}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="reward">Reward</TabsTrigger>
            <TabsTrigger value="fee-share">Fee Share</TabsTrigger>
            <TabsTrigger value="discount">Discount</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="reward">
          <RewardStrategies />
        </TabsContent>
        <TabsContent value="fee-share">
          <FeeShareStrategies />
        </TabsContent>
        <TabsContent value="discount">
          <DiscountStrategies />
        </TabsContent>
      </Tabs>
    </main>
  );
}
