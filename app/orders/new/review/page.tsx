"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Partner = {
  name: string;
  city: string;
  capacity: number;
  price: number;
  readyHours: number;
  reliability: number;
  assigned: number;
  partnerCost: number;
};

type OrderData = {
  requestedQuantity: number;
  ownCapacity: number;
  overflowNeeded: number;
  maxNetworkBudget: number;
  deadlineHours: number;
  securedCapacity: number;
  remainingCapacity: number;
  estimatedNetworkCost: number;
  selectedPartners: Partner[];
};

export default function ReviewCoalition() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-8">
            <p className="text-sm text-[#737a81]">
              Loading coalition details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Coalition Review
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Review Coalition
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Review how your order will be distributed between your own
            business and selected OverMesh partners before approval.
          </p>
        </div>

        {/* Order Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Total Order</p>
            <p className="mt-3 text-xl font-semibold">
              {order.requestedQuantity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Own Capacity</p>
            <p className="mt-3 text-xl font-semibold">
              {order.ownCapacity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Borrowed Capacity</p>
            <p className="mt-3 text-xl font-semibold">
              {order.securedCapacity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Partners</p>
            <p className="mt-3 text-xl font-semibold">
              {order.selectedPartners.length}
            </p>
          </div>
        </div>

        {/* Primary Merchant */}
        <div className="mt-6 rounded-xl border border-[#dbe5df] bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#628071]">
                Primary Merchant
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                UrbanPrint
              </h2>

              <p className="mt-1 text-sm text-[#858b91]">
                Original merchant handling the customer order
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#edf7f1] px-3 py-1.5 text-xs font-medium text-[#34745a]">
              {order.ownCapacity.toLocaleString("en-IN")} units
            </span>
          </div>
        </div>

        {/* Partners */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">
            Fulfilment Partners
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Partners selected dynamically by the OverMesh coalition engine.
          </p>

          <div className="mt-4 space-y-3">
            {order.selectedPartners.map((partner) => (
              <div
                key={partner.name}
                className="grid gap-5 rounded-xl border border-[#e2e5e7] bg-white p-5 md:grid-cols-7 md:items-center"
              >
                <div className="md:col-span-2">
                  <p className="font-semibold">{partner.name}</p>

                  <p className="mt-1 text-xs text-[#8b9197]">
                    {partner.city} · Verified OverMesh Partner
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#969ca1]">
                    Available
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {partner.capacity} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#969ca1]">
                    Assigned
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#34745a]">
                    {partner.assigned} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#969ca1]">
                    Price / unit
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    ₹{partner.price}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#969ca1]">
                    Ready in
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {partner.readyHours} hrs
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#969ca1]">
                    Partner Cost
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    ₹{partner.partnerCost.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coalition Summary */}
        <div className="mt-6 rounded-xl border border-[#d8e5dd] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Coalition Summary
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Full capacity secured
          </h2>

          <p className="mt-2 text-sm text-[#747b81]">
            {order.ownCapacity.toLocaleString("en-IN")} own units +{" "}
            {order.securedCapacity.toLocaleString("en-IN")} partner units ={" "}
            {(
              order.ownCapacity + order.securedCapacity
            ).toLocaleString("en-IN")} units
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-[#92979c]">
                Overflow Required
              </p>
              <p className="mt-1 text-lg font-semibold">
                {order.overflowNeeded.toLocaleString("en-IN")} units
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Network Cost
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{order.estimatedNetworkCost.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Overflow Budget
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{order.maxNetworkBudget.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Deadline
              </p>
              <p className="mt-1 text-lg font-semibold">
                {order.deadlineHours} hrs
              </p>
            </div>
          </div>

          {/* Budget Saving */}
          <div className="mt-6 rounded-lg bg-white p-4">
            <p className="text-xs text-[#8b9197]">
              Remaining overflow budget
            </p>

            <p className="mt-1 text-lg font-semibold text-[#34745a]">
              ₹
              {(
                order.maxNetworkBudget -
                order.estimatedNetworkCost
              ).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-[#e5ebe7] pt-5">
            <Link
              href="/orders/new"
              className="rounded-lg border border-[#d8dcda] bg-white px-5 py-2.5 text-sm font-medium"
            >
              Back
            </Link>

            <Link
              href="/orders/new/approved"
              className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white"
            >
              Approve Coalition
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#81878d]">
            No payment will be processed until the coalition is approved.
          </p>
        </div>
      </div>
    </main>
  );
}