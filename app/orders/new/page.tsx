"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
type Merchant = {
  name: string;
  city: string;
  capacity: number;
  price: number;
  readyHours: number;
  reliability: number;
  status: "Available" | "Busy" | "Offline";
};

type SelectedMerchant = Merchant & {
  assigned: number;
  partnerCost: number;
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

function buildCoalition(
  requiredCapacity: number,
  deadlineHours: number
): SelectedMerchant[] {
  if (requiredCapacity <= 0) return [];

  const eligibleMerchants = merchantPool
    .filter(
      (merchant) =>
        merchant.status === "Available" &&
        merchant.readyHours <= deadlineHours &&
        merchant.capacity > 0
    )
    .sort((a, b) => {
      // First prefer lower price
      if (a.price !== b.price) {
        return a.price - b.price;
      }

      // Then prefer better reliability
      if (a.reliability !== b.reliability) {
        return b.reliability - a.reliability;
      }

      // Then prefer faster delivery
      return a.readyHours - b.readyHours;
    });

  let remaining = requiredCapacity;

  const selected: SelectedMerchant[] = [];

  for (const merchant of eligibleMerchants) {
    if (remaining <= 0) break;

    const assigned = Math.min(merchant.capacity, remaining);

    selected.push({
      ...merchant,
      assigned,
      partnerCost: assigned * merchant.price,
    });

    remaining -= assigned;
  }

  return selected;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [requestedQuantity, setRequestedQuantity] = useState(1500);
  const [ownCapacity, setOwnCapacity] = useState(1200);
  const [maxNetworkBudget, setMaxNetworkBudget] = useState(50000);
  const [deadlineHours, setDeadlineHours] = useState(48);

  const overflowNeeded = Math.max(
    requestedQuantity - ownCapacity,
    0
  );

  const selectedPartners = useMemo(
    () => buildCoalition(overflowNeeded, deadlineHours),
    [overflowNeeded, deadlineHours]
  );

  const securedCapacity = selectedPartners.reduce(
    (total, merchant) => total + merchant.assigned,
    0
  );

  const estimatedNetworkCost = selectedPartners.reduce(
    (total, merchant) => total + merchant.partnerCost,
    0
  );

  const remainingCapacity = Math.max(
    overflowNeeded - securedCapacity,
    0
  );

  const fullCapacitySecured =
    overflowNeeded > 0 && remainingCapacity === 0;

  const withinBudget =
    estimatedNetworkCost <= maxNetworkBudget;

  const eligibleNetworkCapacity = merchantPool
    .filter(
      (merchant) =>
        merchant.status === "Available" &&
        merchant.readyHours <= deadlineHours
    )
    .reduce(
      (total, merchant) => total + merchant.capacity,
      0
    );

  const canReview =
    fullCapacitySecured && withinBudget;
const handleReviewCoalition = () => {
  const orderData = {
    requestedQuantity,
    ownCapacity,
    overflowNeeded,
    maxNetworkBudget,
    deadlineHours,
    securedCapacity,
    remainingCapacity,
    estimatedNetworkCost,
    selectedPartners,
  };

  localStorage.setItem(
    "overmeshCurrentOrder",
    JSON.stringify(orderData)
  );

  router.push("/orders/new/review");
};
  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            New Overflow Order
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Find extra capacity
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Enter your order requirement. OverMesh will calculate
            the capacity shortage and automatically build a suitable
            merchant coalition.
          </p>
        </div>

        {/* Order Requirement */}
        <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
          <h2 className="text-lg font-semibold">
            Order Requirement
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Tell OverMesh what your business needs to fulfil.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* Product */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Product
              </label>

              <input
                type="text"
                defaultValue="Custom Cotton T-Shirts"
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>

            {/* Required Quantity */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Required Quantity
              </label>

              <input
                type="number"
                min="0"
                value={requestedQuantity}
                onChange={(e) =>
                  setRequestedQuantity(
                    Math.max(Number(e.target.value), 0)
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>

            {/* Own Capacity */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Your Available Capacity
              </label>

              <input
                type="number"
                min="0"
                value={ownCapacity}
                onChange={(e) =>
                  setOwnCapacity(
                    Math.max(Number(e.target.value), 0)
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>

            {/* Network Budget */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Maximum Overflow Budget
              </label>

              <input
                type="number"
                min="0"
                value={maxNetworkBudget}
                onChange={(e) =>
                  setMaxNetworkBudget(
                    Math.max(Number(e.target.value), 0)
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Required Within
              </label>

              <select
                value={deadlineHours}
                onChange={(e) =>
                  setDeadlineHours(Number(e.target.value))
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none"
              >
                <option value={24}>24 hours</option>
                <option value={36}>36 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
            </div>

            {/* Requirements */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Additional Requirements
              </label>

              <input
                type="text"
                defaultValue="Black cotton, front logo printing"
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>
          </div>
        </div>

        {/* Capacity Calculation */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Requested
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {requestedQuantity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Your Capacity
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {ownCapacity.toLocaleString("en-IN")} units
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 ${
              overflowNeeded > 0
                ? "border-[#ead9b5] bg-[#fffaf0]"
                : "border-[#cfe4d7] bg-[#f4faf6]"
            }`}
          >
            <p className="text-xs text-[#8b9197]">
              Overflow Needed
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {overflowNeeded.toLocaleString("en-IN")} units
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Eligible Network Capacity
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {eligibleNetworkCapacity.toLocaleString("en-IN")} units
            </p>

            <p className="mt-2 text-xs text-[#92979c]">
              Within {deadlineHours} hrs
            </p>
          </div>
        </div>

        {/* No Overflow */}
        {overflowNeeded === 0 && (
          <div className="mt-6 rounded-xl border border-[#cfe4d7] bg-[#f4faf6] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f7863]">
              No Overflow Required
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              You can fulfil this order independently.
            </h2>

            <p className="mt-2 text-sm text-[#6f7772]">
              Your available capacity is already enough to complete
              the requested order.
            </p>
          </div>
        )}

        {overflowNeeded > 0 && (
          <>
            {/* Selected Partners */}
            <div className="mt-8">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                    Dynamic Merchant Matching
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Selected fulfilment partners
                  </h2>

                  <p className="mt-1 text-sm text-[#858b91]">
                    Selection updates automatically based on required
                    capacity, price, deadline and merchant reliability.
                  </p>
                </div>

                <p className="text-xs text-[#8b9197]">
                  {selectedPartners.length} merchant
                  {selectedPartners.length === 1 ? "" : "s"} selected
                </p>
              </div>

              {selectedPartners.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {selectedPartners.map((merchant, index) => (
                    <div
                      key={merchant.name}
                      className="rounded-xl border border-[#e2e5e7] bg-white p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {merchant.name}
                            </p>

                            {index === 0 && (
                              <span className="rounded-full bg-[#edf7f1] px-2.5 py-1 text-[11px] font-medium text-[#34745a]">
                                Best Match
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#92979c]">
                            {merchant.city} · Verified OverMesh Partner
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Available
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {merchant.capacity} units
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Assigned
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#34745a]">
                            {merchant.assigned} units
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Price / unit
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            ₹{merchant.price}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Ready in
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {merchant.readyHours} hrs
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Reliability
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {merchant.reliability}%
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Partner Cost
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            ₹
                            {merchant.partnerCost.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">
                  <p className="font-semibold">
                    No eligible merchants found
                  </p>

                  <p className="mt-2 text-sm text-[#77736a]">
                    Try increasing the delivery deadline.
                  </p>
                </div>
              )}
            </div>

            {/* Coalition Summary */}
            <div className="mt-6 rounded-xl border border-[#d6e4dc] bg-[#fbfdfc] p-6">

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
                    Recommended Coalition
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Best-fit merchant combination
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#747b81]">
                    OverMesh selected the smallest suitable group of
                    merchants needed to cover your capacity shortage.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                    fullCapacitySecured
                      ? "bg-[#e8f5ed] text-[#34745a]"
                      : "bg-[#fff3df] text-[#8b6a21]"
                  }`}
                >
                  {fullCapacitySecured
                    ? "Full Capacity Secured"
                    : "Capacity Shortage"}
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-5">

                <div>
                  <p className="text-xs text-[#92979c]">
                    Overflow Required
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {overflowNeeded.toLocaleString("en-IN")} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Network Secured
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {securedCapacity.toLocaleString("en-IN")} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Still Required
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${
                      remainingCapacity > 0
                        ? "text-[#9b6b19]"
                        : "text-[#34745a]"
                    }`}
                  >
                    {remainingCapacity.toLocaleString("en-IN")} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Partners
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedPartners.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Network Cost
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    ₹
                    {estimatedNetworkCost.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Budget check */}
              <div
                className={`mt-6 rounded-lg p-4 ${
                  withinBudget
                    ? "bg-[#f2f8f4]"
                    : "bg-[#fff4e8]"
                }`}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <span className="text-sm text-[#656c70]">
                    Overflow budget:
                    {" "}
                    ₹{maxNetworkBudget.toLocaleString("en-IN")}
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      withinBudget
                        ? "text-[#34745a]"
                        : "text-[#9b6b19]"
                    }`}
                  >
                    {withinBudget
                      ? `₹${(
                          maxNetworkBudget -
                          estimatedNetworkCost
                        ).toLocaleString("en-IN")} remaining`
                      : `₹${(
                          estimatedNetworkCost -
                          maxNetworkBudget
                        ).toLocaleString("en-IN")} over budget`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 border-t border-[#e5ebe7] pt-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <p className="text-xs text-[#8b9197]">
                    No payment will be processed yet.
                  </p>

                  {canReview ? (
                  <button
  onClick={handleReviewCoalition}
  className="w-fit rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white"
>
  Review Coalition
</button>
                  ) : (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-lg bg-[#d7dad8] px-5 py-2.5 text-sm font-medium text-[#858a87]"
                    >
                      {remainingCapacity > 0
                        ? "More Capacity Required"
                        : "Increase Overflow Budget"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}