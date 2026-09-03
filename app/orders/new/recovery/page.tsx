"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Partner = {
  capabilityId: number;
  merchantId: number;
  name: string;
  city: string;
  category: string;
  productName: string;
  capacity: number;
  unit: string;
  price: number;
  readyHours: number;
  reliability: number;
  minOrderQuantity: number;
  assigned: number;
  partnerCost: number;
};

type OrderData = {
  product: string;
  category: string;
  unit: string;
  databaseOrderId?: number;
orderReference?: string;
  requestedQuantity: number;
  ownCapacity: number;
  overflowNeeded: number;
  maxNetworkBudget: number;
  deadlineHours: number;
  requirements: string;
  securedCapacity: number;
  remainingCapacity: number;
  estimatedNetworkCost: number;
  selectedPartners: Partner[];
};

type CapabilityRow = {
  id: number;
  merchant_id: number;
  category: string;
  product_name: string;
  available_capacity: number;
  unit: string;
  price_per_unit: number;
  ready_hours: number;
  min_order_quantity: number;
  is_available: boolean;
};

type MerchantRow = {
  id: number;
  name: string;
  city: string;
  reliability: number;
  status: string;
};

type ReplacementCandidate = {
  capabilityId: number;
  merchantId: number;
  name: string;
  city: string;
  category: string;
  productName: string;
  capacity: number;
  unit: string;
  price: number;
  readyHours: number;
  reliability: number;
  minOrderQuantity: number;
};

function buildReplacementCoalition(
  candidates: ReplacementCandidate[],
  requiredCapacity: number
): Partner[] {
  const sorted = [...candidates].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }

    if (a.reliability !== b.reliability) {
      return b.reliability - a.reliability;
    }

    return a.readyHours - b.readyHours;
  });

  let remaining = requiredCapacity;
  const replacements: Partner[] = [];

  for (const merchant of sorted) {
    if (remaining <= 0) break;

    const assigned = Math.min(
      merchant.capacity,
      remaining
    );

    if (assigned < merchant.minOrderQuantity) {
      continue;
    }

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

  const [replacementCandidates, setReplacementCandidates] =
    useState<ReplacementCandidate[]>([]);

  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState("");

  useEffect(() => {
    const savedOrder =
      localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    } else {
      setLoading(false);
    }
  }, []);

  const failedPartner = useMemo(() => {
    if (!order || order.selectedPartners.length === 0) {
      return null;
    }

    // Demo behaviour:
    // last allocated merchant becomes unavailable.
    return order.selectedPartners[
      order.selectedPartners.length - 1
    ];
  }, [order]);

  useEffect(() => {
    async function findLiveReplacement() {
      if (!order || !failedPartner) return;

      setLoading(true);
      setNetworkError("");

      const { data: capabilities, error: capabilityError } =
        await supabase
          .from("merchant_capabilities")
          .select(
            `
            id,
            merchant_id,
            category,
            product_name,
            available_capacity,
            unit,
            price_per_unit,
            ready_hours,
            min_order_quantity,
            is_available
          `
          )
          .eq("product_name", order.product)
          .eq("is_available", true)
          .lte("ready_hours", order.deadlineHours);

      if (capabilityError) {
        setNetworkError(capabilityError.message);
        setLoading(false);
        return;
      }

      const { data: merchants, error: merchantError } =
        await supabase
          .from("merchants")
          .select(
            "id, name, city, reliability, status"
          )
          .eq("status", "Available");

      if (merchantError) {
        setNetworkError(merchantError.message);
        setLoading(false);
        return;
      }

      const merchantMap = new Map<number, MerchantRow>();

      (merchants || []).forEach((merchant) => {
        merchantMap.set(
          Number(merchant.id),
          merchant as MerchantRow
        );
      });

      const existingMerchantIds =
        order.selectedPartners.map(
          (partner) => partner.merchantId
        );

      const candidates: ReplacementCandidate[] = (
        (capabilities || []) as CapabilityRow[]
      )
        .map((capability) => {
          const merchant = merchantMap.get(
            Number(capability.merchant_id)
          );

          if (!merchant) return null;

          // Don't select merchant already in coalition
          if (
            existingMerchantIds.includes(
              Number(capability.merchant_id)
            )
          ) {
            return null;
          }

          return {
            capabilityId: Number(capability.id),

            merchantId: Number(
              capability.merchant_id
            ),

            name: merchant.name,
            city: merchant.city,

            category: capability.category,
            productName: capability.product_name,

            capacity: Number(
              capability.available_capacity
            ),

            unit: capability.unit,

            price: Number(
              capability.price_per_unit
            ),

            readyHours: Number(
              capability.ready_hours
            ),

            reliability: Number(
              merchant.reliability
            ),

            minOrderQuantity: Number(
              capability.min_order_quantity
            ),
          };
        })
        .filter(
          (
            item
          ): item is ReplacementCandidate =>
            item !== null
        );

      setReplacementCandidates(candidates);
      setLoading(false);
    }

    findLiveReplacement();
  }, [order, failedPartner]);

  const activePartners = useMemo(() => {
    if (!order || !failedPartner) return [];

    return order.selectedPartners.filter(
      (partner) =>
        partner.capabilityId !==
        failedPartner.capabilityId
    );
  }, [order, failedPartner]);

  const replacementPartners = useMemo(() => {
    if (!failedPartner) return [];

    return buildReplacementCoalition(
      replacementCandidates,
      failedPartner.assigned
    );
  }, [replacementCandidates, failedPartner]);

  const replacementCapacity =
    replacementPartners.reduce(
      (total, partner) =>
        total + partner.assigned,
      0
    );

  const replacementCost =
    replacementPartners.reduce(
      (total, partner) =>
        total + partner.partnerCost,
      0
    );

  const originalFailedCost =
    failedPartner?.partnerCost || 0;

  const revisedNetworkCost =
    order && failedPartner
      ? order.estimatedNetworkCost -
        originalFailedCost +
        replacementCost
      : 0;

  const costDifference =
    order
      ? revisedNetworkCost -
        order.estimatedNetworkCost
      : 0;

  const fullyRecovered =
    !!failedPartner &&
    replacementCapacity >= failedPartner.assigned;

  const revisedWithinBudget =
    !!order &&
    revisedNetworkCost <=
      order.maxNetworkBudget;

  async function handleApproveReplacement() {
  if (
    !order ||
    !failedPartner ||
    !fullyRecovered ||
    !revisedWithinBudget
  ) {
    return;
  }

  const updatedPartners = [
    ...activePartners,
    ...replacementPartners,
  ];

  const updatedOrder: OrderData = {
    ...order,

    selectedPartners: updatedPartners,

    estimatedNetworkCost: revisedNetworkCost,

    securedCapacity: updatedPartners.reduce(
      (total, partner) =>
        total + partner.assigned,
      0
    ),

    remainingCapacity: 0,
  };

  try {
    // Save recovery in Supabase if this is a database order
    if (order.databaseOrderId) {

      // 1. Mark failed merchant
      const { error: failedError } = await supabase
        .from("coalition_members")
        .update({
          status: "failed",
        })
        .eq("order_id", order.databaseOrderId)
        .eq(
          "capability_id",
          failedPartner.capabilityId
        );

      if (failedError) {
        throw failedError;
      }

      // 2. Insert replacement merchants
      const replacementRows =
        replacementPartners.map((partner) => ({
          order_id: order.databaseOrderId,

          merchant_id: partner.merchantId,
          capability_id: partner.capabilityId,

          merchant_name: partner.name,

          assigned_quantity: partner.assigned,

          unit: partner.unit,

          price_per_unit: partner.price,

          partner_cost: partner.partnerCost,

          status: "active",
        }));

      const { error: replacementError } =
        await supabase
          .from("coalition_members")
          .insert(replacementRows);

      if (replacementError) {
        throw replacementError;
      }

      // 3. Update main order
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          estimated_network_cost:
            revisedNetworkCost,

          secured_capacity:
            updatedPartners.reduce(
              (total, partner) =>
                total + partner.assigned,
              0
            ),

          remaining_capacity: 0,

          status: "recovered",
        })
        .eq("id", order.databaseOrderId);

      if (orderError) {
        throw orderError;
      }
    }

    // Keep local copy for current UI flow
    localStorage.setItem(
      "overmeshCurrentOrder",
      JSON.stringify(updatedOrder)
    );

    localStorage.setItem(
      "overmeshRecoveryInfo",
      JSON.stringify({
        product: order.product,
        unit: order.unit,

        failedPartner,

        replacementPartners,

        recoveredCapacity:
          replacementCapacity,

        previousCost:
          order.estimatedNetworkCost,

        revisedCost:
          revisedNetworkCost,

        costDifference,
      })
    );

    router.push("/orders/new/recovered");
  } catch (error) {
    console.error(
      "Recovery database error:",
      error
    );

    alert(
      "Recovery could not be saved to the database."
    );
  }
}

  if (!order || !failedPartner) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          No active coalition available for recovery.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Searching live OverMesh network for replacement capacity...
        </div>
      </main>
    );
  }

  if (networkError) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-white p-8">
          <h1 className="text-xl font-semibold">
            Recovery network error
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {networkError}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Alert */}
        <div className="rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b6b27]">
            Capacity Disruption Detected
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {failedPartner.name} can no longer fulfil{" "}
            {failedPartner.assigned} {order.unit}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77736a]">
            OverMesh detected a disruption in the{" "}
            {order.product} coalition and searched the
            live merchant network for replacement capacity.
          </p>
        </div>

        {/* Impact */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Product
            </p>

            <p className="mt-3 text-lg font-semibold">
              {order.product}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Capacity Lost
            </p>

            <p className="mt-3 text-xl font-semibold">
              {failedPartner.assigned} {order.unit}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Failed Partner
            </p>

            <p className="mt-3 text-lg font-semibold">
              {failedPartner.name}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Deadline
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.deadlineHours} hrs
            </p>
          </div>
        </div>

        {/* Current coalition */}
        <div className="mt-7">

          <h2 className="text-lg font-semibold">
            Current Coalition
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            One merchant is now unavailable.
          </p>

          <div className="mt-4 space-y-3">
            {order.selectedPartners.map((partner) => {
              const failed =
                partner.capabilityId ===
                failedPartner.capabilityId;

              return (
                <div
                  key={partner.capabilityId}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[#e2e5e7] bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {partner.name}
                    </p>

                    <p className="mt-1 text-xs text-[#92979c]">
                      {partner.city} · Assigned{" "}
                      {partner.assigned} {partner.unit}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                      failed
                        ? "bg-[#fff0f0] text-[#a34747]"
                        : "bg-[#edf7f1] text-[#34745a]"
                    }`}
                  >
                    {failed
                      ? "Unavailable"
                      : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery engine */}
        <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-white p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Live Recovery Engine
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {fullyRecovered
              ? "Replacement capacity found"
              : "Full replacement capacity unavailable"}
          </h2>

          <p className="mt-2 text-sm text-[#777e83]">
            OverMesh searched registered merchants offering{" "}
            <span className="font-medium">
              {order.product}
            </span>{" "}
            within the original {order.deadlineHours}-hour deadline.
          </p>
        </div>

        {/* Replacement merchants */}
        <div className="mt-7">

          <h2 className="text-lg font-semibold">
            Replacement Plan
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Replacement merchants selected from Supabase.
          </p>

          {replacementPartners.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">

              {replacementPartners.map(
                (partner, index) => (
                  <div
                    key={partner.capabilityId}
                    className={`rounded-xl border bg-white p-6 ${
                      index === 0
                        ? "border-[#bdd8c9]"
                        : "border-[#e2e5e7]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {partner.name}
                        </p>

                        <p className="mt-1 text-xs text-[#92979c]">
                          {partner.city} ·{" "}
                          {partner.productName}
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
                        <p className="text-xs text-[#92979c]">
                          Assigned
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {partner.assigned}{" "}
                          {partner.unit}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Price / unit
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          ₹{partner.price}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Ready in
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {partner.readyHours} hrs
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Reliability
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {partner.reliability}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">
              <p className="font-semibold">
                No replacement merchant available.
              </p>

              <p className="mt-2 text-sm text-[#77736a]">
                No other registered merchant currently offers enough{" "}
                {order.product} capacity within the required deadline.
              </p>
            </div>
          )}
        </div>

        {/* Revised coalition */}
        <div className="mt-6 rounded-xl border border-[#d8e5dd] bg-[#fbfdfc] p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Revised Coalition
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {fullyRecovered
              ? "Capacity restored"
              : "Recovery incomplete"}
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-4">

            <div>
              <p className="text-xs text-[#8c9297]">
                Capacity Lost
              </p>

              <p className="mt-1 text-lg font-semibold">
                {failedPartner.assigned} {order.unit}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Capacity Recovered
              </p>

              <p className="mt-1 text-lg font-semibold">
                {replacementCapacity} {order.unit}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Previous Cost
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹
                {order.estimatedNetworkCost.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#8c9297]">
                Revised Cost
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹
                {revisedNetworkCost.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white p-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">

              <span className="text-sm text-[#656c70]">
                Cost difference
              </span>

              <span
                className={`text-sm font-semibold ${
                  costDifference <= 0
                    ? "text-[#34745a]"
                    : "text-[#9b6b19]"
                }`}
              >
                {costDifference > 0 ? "+" : ""}
                ₹
                {costDifference.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>

          {!revisedWithinBudget &&
            fullyRecovered && (
              <div className="mt-4 rounded-lg bg-[#fff4e8] p-4 text-sm text-[#8b6b27]">
                Replacement capacity exists, but the revised coalition exceeds the current fulfilment budget.
              </div>
            )}

          <div className="mt-6">
            <button
              onClick={handleApproveReplacement}
              disabled={
                !fullyRecovered ||
                !revisedWithinBudget
              }
              className={`rounded-lg px-5 py-2.5 text-sm font-medium ${
                fullyRecovered &&
                revisedWithinBudget
                  ? "bg-[#17201c] text-white"
                  : "cursor-not-allowed bg-[#d7dad8] text-[#858a87]"
              }`}
            >
              {fullyRecovered
                ? revisedWithinBudget
                  ? "Approve Replacement"
                  : "Replacement Over Budget"
                : "Recovery Incomplete"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}