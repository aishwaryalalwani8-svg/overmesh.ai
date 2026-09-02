"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type Merchant = {
  name: string;
  city: string;
  capacity: number;
  price: number;
  readyHours: number;
  reliability: number;
  status: "Available" | "Busy" | "Offline";
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

const merchantPool: Merchant[] = [
  {
    name: "CottonCraft",
    city: "Bhopal",
    capacity: 180,
    price: 145,
    readyHours: 42,
    reliability: 97,
    status: "Available",
  },
  {
    name: "Urban Threads",
    city: "Bhopal",
    capacity: 160,
    price: 147,
    readyHours: 31,
    reliability: 96,
    status: "Available",
  },
  {
    name: "ThreadLab",
    city: "Bhopal",
    capacity: 40,
    price: 148,
    readyHours: 34,
    reliability: 95,
    status: "Available",
  },
  {
    name: "PrintForge",
    city: "Indore",
    capacity: 100,
    price: 151,
    readyHours: 22,
    reliability: 92,
    status: "Available",
  },
  {
    name: "FabricWorks",
    city: "Indore",
    capacity: 240,
    price: 153,
    readyHours: 28,
    reliability: 94,
    status: "Available",
  },
  {
    name: "StitchCore",
    city: "Nagpur",
    capacity: 310,
    price: 158,
    readyHours: 24,
    reliability: 91,
    status: "Available",
  },
];

function findReplacement(
  requiredUnits: number,
  deadlineHours: number,
  excludedNames: string[]
): Partner[] {
  const eligible = merchantPool
    .filter(
      (merchant) =>
        merchant.status === "Available" &&
        merchant.readyHours <= deadlineHours &&
        !excludedNames.includes(merchant.name)
    )
    .sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      return b.reliability - a.reliability;
    });

  let remaining = requiredUnits;
  const replacements: Partner[] = [];

  for (const merchant of eligible) {
    if (remaining <= 0) break;

    const assigned = Math.min(merchant.capacity, remaining);

    replacements.push({
      ...merchant,
      assigned,
      partnerCost: assigned * merchant.price,
    });

    remaining -= assigned;
  }

  return replacements;
}

export default function RecoveryPage() {
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  const failedPartner = useMemo(() => {
    if (!order || order.selectedPartners.length === 0) return null;

    // For demo, last selected merchant experiences disruption
    return order.selectedPartners[order.selectedPartners.length - 1];
  }, [order]);

  const activePartners = useMemo(() => {
    if (!order || !failedPartner) return [];

    return order.selectedPartners.filter(
      (partner) => partner.name !== failedPartner.name
    );
  }, [order, failedPartner]);

  const replacementPartners = useMemo(() => {
    if (!order || !failedPartner) return [];

    return findReplacement(
      failedPartner.assigned,
      order.deadlineHours,
      order.selectedPartners.map((partner) => partner.name)
    );
  }, [order, failedPartner]);

  const replacementCapacity = replacementPartners.reduce(
    (total, partner) => total + partner.assigned,
    0
  );

  const replacementCost = replacementPartners.reduce(
    (total, partner) => total + partner.partnerCost,
    0
  );

  const oldFailedCost = failedPartner?.partnerCost ?? 0;

  const revisedNetworkCost =
    order && failedPartner
      ? order.estimatedNetworkCost - oldFailedCost + replacementCost
      : 0;

  const costDifference =
    order && failedPartner
      ? revisedNetworkCost - order.estimatedNetworkCost
      : 0;

  const fullyRecovered =
    failedPartner &&
    replacementCapacity >= failedPartner.assigned;

  const handleApproveReplacement = () => {
    if (!order || !failedPartner || !fullyRecovered) return;

    const updatedPartners = [
      ...activePartners,
      ...replacementPartners,
    ];

    const updatedOrder = {
      ...order,
      selectedPartners: updatedPartners,
      estimatedNetworkCost: revisedNetworkCost,
    };

    localStorage.setItem(
      "overmeshCurrentOrder",
      JSON.stringify(updatedOrder)
    );

    localStorage.setItem(
      "overmeshRecoveryInfo",
      JSON.stringify({
        failedPartner,
        replacementPartners,
        costDifference,
      })
    );

    router.push("/orders/new/recovered");
  };

  if (!order || !failedPartner) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading recovery engine...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Disruption */}
        <div className="rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b6b27]">
            Capacity Disruption Detected
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            {failedPartner.name} can no longer fulfil{" "}
            {failedPartner.assigned} units
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77736a]">
            OverMesh detected a partner capacity failure and automatically
            searched the network for replacement capacity.
          </p>
        </div>

        {/* Impact */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Capacity Lost</p>
            <p className="mt-3 text-xl font-semibold">
              {failedPartner.assigned} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Failed Partner</p>
            <p className="mt-3 text-xl font-semibold">
              {failedPartner.name}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Deadline</p>
            <p className="mt-3 text-xl font-semibold">
              {order.deadlineHours} hrs
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">Status</p>
            <p className="mt-3 text-xl font-semibold text-[#9b6b19]">
              Recovering
            </p>
          </div>
        </div>

        {/* Current Coalition */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Current Coalition</h2>

          <p className="mt-1 text-sm text-[#858b91]">
            One merchant has become unavailable.
          </p>

          <div className="mt-4 space-y-3">
            {order.selectedPartners.map((partner) => {
              const failed = partner.name === failedPartner.name;

              return (
                <div
                  key={partner.name}
                  className="flex items-center justify-between rounded-xl border border-[#e2e5e7] bg-white p-5"
                >
                  <div>
                    <p className="font-semibold">{partner.name}</p>
                    <p className="mt-1 text-xs text-[#92979c]">
                      Assigned {partner.assigned} units
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      failed
                        ? "bg-[#fff0f0] text-[#a34747]"
                        : "bg-[#edf7f1] text-[#34745a]"
                    }`}
                  >
                    {failed ? "Unavailable" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Engine */}
        <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            OverMesh Recovery Engine
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {fullyRecovered
              ? "Replacement capacity found"
              : "Not enough replacement capacity"}
          </h2>

          <p className="mt-2 text-sm text-[#777e83]">
            OverMesh searched merchants outside the current coalition while
            preserving the original deadline.
          </p>
        </div>

        {/* Replacement */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Replacement Plan</h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Best available merchants for the missing capacity.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {replacementPartners.map((merchant, index) => (
              <div
                key={merchant.name}
                className={`rounded-xl border bg-white p-6 ${
                  index === 0
                    ? "border-[#bdd8c9]"
                    : "border-[#e2e5e7]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{merchant.name}</p>
                    <p className="mt-1 text-xs text-[#92979c]">
                      {merchant.city} · Verified Partner
                    </p>
                  </div>

                  {index === 0 && (
                    <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-medium text-[#34745a]">
                      Best Replacement
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-[#92979c]">Assigned</p>
                    <p className="mt-1 font-semibold">
                      {merchant.assigned} units
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Price / unit</p>
                    <p className="mt-1 font-semibold">
                      ₹{merchant.price}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Ready in</p>
                    <p className="mt-1 font-semibold">
                      {merchant.readyHours} hrs
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">Reliability</p>
                    <p className="mt-1 font-semibold">
                      {merchant.reliability}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revised Plan */}
        <div className="mt-6 rounded-xl border border-[#d8e5dd] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Revised Coalition
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {fullyRecovered
              ? "Full capacity restored"
              : "Recovery incomplete"}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-[#8c9297]">
                Capacity Recovered
              </p>
              <p className="mt-1 text-lg font-semibold">
                {replacementCapacity} units
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Replacement Partners
              </p>
              <p className="mt-1 text-lg font-semibold">
                {replacementPartners.length}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Previous Cost
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{order.estimatedNetworkCost.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Revised Cost
              </p>
              <p className="mt-1 text-lg font-semibold">
                ₹{revisedNetworkCost.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white p-4 text-sm text-[#61686d]">
            Cost difference:{" "}
            <span
              className={`font-semibold ${
                costDifference <= 0
                  ? "text-[#34745a]"
                  : "text-[#9b6b19]"
              }`}
            >
              {costDifference > 0 ? "+" : ""}
              ₹{costDifference.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-6">
            <button
              onClick={handleApproveReplacement}
              disabled={!fullyRecovered}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium ${
                fullyRecovered
                  ? "bg-[#17201c] text-white"
                  : "cursor-not-allowed bg-[#d7dad8] text-[#858a87]"
              }`}
            >
              Approve Replacement
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}