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

export default function ApprovedCoalitionPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading active coalition...
        </div>
      </main>
    );
  }

  const totalPartners = order.selectedPartners.length;

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Success Header */}
        <div className="rounded-xl border border-[#d7e7dd] bg-[#f6fbf8] p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f7863]">
                Coalition Active
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Your overflow order is now secured
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f7772]">
                {order.requestedQuantity.toLocaleString("en-IN")} units have
                been allocated across UrbanPrint and {totalPartners} fulfilment
                partner{totalPartners === 1 ? "" : "s"}.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#e7f5ec] px-4 py-2 text-sm font-medium text-[#34745a]">
              Full Capacity Secured
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
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
            <p className="text-xs text-[#8b9197]">Borrowed</p>
            <p className="mt-3 text-xl font-semibold">
              {order.securedCapacity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Partner Cost</p>
            <p className="mt-3 text-xl font-semibold">
              ₹{order.estimatedNetworkCost.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Fulfilment */}
        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold">Overall Fulfilment</p>
              <p className="mt-1 text-xs text-[#8c9297]">
                Production allocation across the active coalition
              </p>
            </div>

            <p className="text-2xl font-semibold">100%</p>
          </div>

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#edf0ee]">
            <div className="h-full w-full rounded-full bg-[#2f7d5c]" />
          </div>

          <div className="mt-3 flex justify-between text-xs text-[#8b9197]">
            <span>
              {order.ownCapacity.toLocaleString("en-IN")} own units
            </span>
            <span>
              {order.securedCapacity.toLocaleString("en-IN")} network units
            </span>
          </div>
        </div>

        {/* Coalition Members */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Coalition Members</h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Merchant allocation for this order.
          </p>

          <div className="mt-4 space-y-3">

            {/* Primary Merchant */}
            <div className="rounded-xl border border-[#dbe5df] bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">UrbanPrint</p>

                    <span className="rounded-full bg-[#eef4f1] px-2.5 py-1 text-[11px] font-medium text-[#4d715f]">
                      Primary
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#92979c]">
                    Original merchant
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">Assigned</p>
                  <p className="mt-1 text-sm font-semibold">
                    {order.ownCapacity.toLocaleString("en-IN")} units
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic partners */}
            {order.selectedPartners.map((partner) => (
              <div
                key={partner.name}
                className="rounded-xl border border-[#e2e5e7] bg-white p-5"
              >
                <div className="grid gap-5 md:grid-cols-6 md:items-center">
                  <div className="md:col-span-2">
                    <p className="font-semibold">{partner.name}</p>
                    <p className="mt-1 text-xs text-[#92979c]">
                      {partner.city} · Fulfilment Partner
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Assigned</p>
                    <p className="mt-1 text-sm font-semibold">
                      {partner.assigned} units
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Ready in</p>
                    <p className="mt-1 text-sm font-semibold">
                      {partner.readyHours} hrs
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Reliability</p>
                    <p className="mt-1 text-sm font-semibold">
                      {partner.reliability}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Status</p>
                    <span className="mt-1 inline-block rounded-full bg-[#edf7f1] px-2.5 py-1 text-xs font-medium text-[#34745a]">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <p className="text-xs text-[#8b9197]">Delivery Deadline</p>

          <p className="mt-2 text-xl font-semibold">
            {order.deadlineHours} hours
          </p>

          <p className="mt-2 text-sm text-[#858b91]">
            Every selected partner is capable of fulfilling their allocation
            within this deadline.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg border border-[#d8dcda] bg-white px-5 py-2.5 text-sm font-medium"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/orders/new/recovery"
            className="rounded-lg border border-[#e2c98f] bg-[#fffaf0] px-5 py-2.5 text-sm font-medium text-[#8b6b27]"
          >
            Simulate Capacity Disruption
          </Link>
        </div>
      </div>
    </main>
  );
}