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

type RecoveryInfo = {
  failedPartner: Partner;
  replacementPartners: Partner[];
  costDifference: number;
};

export default function RecoveredPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [recovery, setRecovery] = useState<RecoveryInfo | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");
    const savedRecovery = localStorage.getItem("overmeshRecoveryInfo");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }

    if (savedRecovery) {
      setRecovery(JSON.parse(savedRecovery));
    }
  }, []);

  if (!order || !recovery) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading recovery result...
        </div>
      </main>
    );
  }

  const recoveredCapacity = recovery.replacementPartners.reduce(
    (total, partner) => total + partner.assigned,
    0
  );

  const replacementNames = recovery.replacementPartners
    .map((partner) => partner.name)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-[#cfe4d7] bg-[#f4faf6] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f7863]">
            Recovery Successful
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Coalition restored successfully
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f7772]">
            OverMesh replaced {recovery.failedPartner.name} with{" "}
            {replacementNames} and restored{" "}
            {recoveredCapacity.toLocaleString("en-IN")} units without
            cancelling the order.
          </p>

          <div className="mt-5 inline-flex rounded-full bg-[#e6f4eb] px-4 py-2 text-sm font-medium text-[#34745a]">
            Full Capacity Restored
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Capacity Recovered</p>
            <p className="mt-3 text-xl font-semibold">
              {recoveredCapacity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Failed Partner</p>
            <p className="mt-3 text-xl font-semibold">
              {recovery.failedPartner.name}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Replacement</p>
            <p className="mt-3 text-xl font-semibold">
              {replacementNames}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Cost Difference</p>
            <p
              className={`mt-3 text-xl font-semibold ${
                recovery.costDifference <= 0
                  ? "text-[#34745a]"
                  : "text-[#9b6b19]"
              }`}
            >
              {recovery.costDifference > 0 ? "+" : ""}
              ₹{recovery.costDifference.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-[#ead7d7] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9a5b5b]">
              Before Recovery
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Capacity shortage detected
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7d8388]">
                  {recovery.failedPartner.name}
                </span>
                <span className="font-medium text-[#a34747]">
                  Unavailable
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7d8388]">Capacity lost</span>
                <span className="font-medium">
                  {recovery.failedPartner.assigned} units
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#cee2d6] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f7863]">
              After Recovery
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Replacement capacity secured
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7d8388]">Replacement</span>
                <span className="font-medium text-[#34745a]">
                  {replacementNames}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7d8388]">Capacity restored</span>
                <span className="font-medium">
                  {recoveredCapacity} units
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <h2 className="text-lg font-semibold">Updated Coalition</h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Final merchant allocation after recovery.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#eceeef] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">UrbanPrint</p>
                <p className="mt-1 text-xs text-[#92979c]">
                  Primary Merchant
                </p>
              </div>

              <span className="text-sm font-medium">
                {order.ownCapacity.toLocaleString("en-IN")} units
              </span>
            </div>

            {order.selectedPartners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col justify-between gap-3 rounded-lg border border-[#eceeef] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{partner.name}</p>
                  <p className="mt-1 text-xs text-[#92979c]">
                    Fulfilment Partner
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {partner.assigned} units
                  </span>

                  <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-medium text-[#34745a]">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            OverMesh Impact
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            The order stayed active despite a merchant failure.
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#70777c]">
            OverMesh automatically replaced unavailable capacity while
            preserving the original order requirement and delivery deadline.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg border border-[#d8dcda] bg-white px-5 py-2.5 text-sm font-medium"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/analytics"
            className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </main>
  );
}