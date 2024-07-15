"use client";
import { Graph, Lightbulb, Question, ShoppingBag } from "@phosphor-icons/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function FAQModal({ children }: { children: React.ReactNode }) {
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
            <DialogTitle>FAQ</DialogTitle>
            <DialogDescription>
              Need more guidance? Watch a{" "}
              <Link
                href="https://www.loom.com/share/0690aaf7013749fe950aac16ac8dd78f?sid=31622049-7272-4540-8486-7a25ca627dd9"
                target="_blank"
                className="underline"
              >
                demo
              </Link>{" "}
              or{" "}
              <Link
                href="mailto:support@popshop.fun"
                target="_blank"
                className="underline"
              >
                contact us
              </Link>
              .
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible>
            <AccordionItem value="what-is-popshop">
              <AccordionTrigger>
                <div>
                  <Question className="mr-2 inline" />
                  What is popshop*?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    <p>
                      Popshop* is a platform for browsing and managing your own
                      ecommerce shops onchain. We are currently deployed on Base
                      Sepolia Testnet and Base Mainnet. You make purchases from
                      existing shops or create your own shop, list products, and
                      incentivize purchases with onchain strategies. Strategies
                      include:
                    </p>
                    <br />
                    <ul className="list-inside list-disc">
                      <li>
                        <b>Reward Strategies</b>: Reward buyers for their
                        purchases, e.g. using a bonding curve on product supply
                        to reward custom shop ERC20 tokens when supply is higher
                        and incentivize early buyers
                      </li>
                      <li>
                        <b>Fee Share Strategies</b>: Share fees with other users
                        e.g. referrers if you buy a product through their
                        referral link
                      </li>
                      <li>
                        <b>Discount Strategies</b>: Offer discounts to buyers
                        based on certain onchain conditions, e.g. allowlists or
                        EAS attestations.
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="what-are-strategies">
              <AccordionTrigger>
                <div>
                  <Graph className="mr-2 inline" />
                  What are strategies?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    Strategies are a way to incentivize purchases onchain.
                    Currently popshop* supports three types of strategies:
                    reward, fee share, and discount.
                  </div>
                  <div>
                    Strategies are represented as individual smart contracts and
                    can be attached to products when creating or editing a
                    product. When a buyer purchases an item, the applicable
                    strategy contracts are called to determine the incentives or
                    discounts the buyer receives. Strategies can be created from
                    predefined templates or by writing a custom contract that
                    extends off the base strategy contracts.
                  </div>
                  <div>
                    Currently, the popshop* frontend client enables deploying
                    predefined templates and helps you register them to your
                    shop onchain. This allows you to easily be able to track and
                    apply your strategies to products. Changes to a strategys'
                    configuration will apply immediately to all products
                    configured to use it. We are working on adding more
                    templates and custom strategy creation in the future.
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-to-create-a-strategy">
              <AccordionTrigger>
                <div>
                  <Lightbulb className="mr-2 inline" />
                  How to create a strategy
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    <p>To create a strategy from a template:</p>
                    <ol className="list-inside list-decimal">
                      <li>
                        Find the type of strategy you want to create in your
                        shop dashboard.
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
            <AccordionItem value="why-onchain">
              <AccordionTrigger>
                <div>
                  <ShoppingBag className="mr-2 inline" />
                  Why onchain shopping?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <div>
                    <p>Onchain commerce allows us to: </p>
                    <ol className="list-inside list-disc">
                      <li>
                        Removes the middleman and delays in rewards/discounts
                        issuance. Reduces potential errors with client-side
                        access gating and discount application mechanisms. Users
                        interact directly with contracts, ensuring immediate
                        application of rewards, fee shares, and discounts based
                        on specific criteria
                      </li>
                      <li>
                        Leverage onchain assets and primitives to create more
                        interesting shopping experiences as the world goes more
                        onchain
                      </li>
                      <li>
                        Smart contract events and the open nature of protocols
                        helps link relevant activity and track the attribution
                        funnel
                      </li>
                    </ol>
                  </div>
                  <p>
                    By enabling anyone to create onchain shopping experiences,
                    popshop* allows open experimentation with different models
                    and keeps the platform open and flexible!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              className="flex items-center gap-x-2"
              onClick={() => setOpen(false)}
            >
              Got it!!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
