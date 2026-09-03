"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  city?: string;
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

export default function ReviewCoalitionPage() {
  const router = useRouter();

const [isApproving, setIsApproving] = useState(false);
const [approvalError, setApprovalError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);
async function handleApproveCoalition() {
  if (!order) return;

  setIsApproving(true);
  setApprovalError("");

  const { data, error } = await supabase
    .from("orders")
    .insert({
      product: order.product,
      category: order.category,
      unit: order.unit,
      city: order.city || null,

      requested_quantity: order.requestedQuantity,
      own_capacity: order.ownCapacity,
      overflow_needed: order.overflowNeeded,

      max_budget: order.maxNetworkBudget,
      deadline_hours: order.deadlineHours,

      requirements: order.requirements || null,

      secured_capacity: order.securedCapacity,
      remaining_capacity: order.remainingCapacity,
      estimated_network_cost: order.estimatedNetworkCost,

      status: "approved",
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    setApprovalError(error.message);
    setIsApproving(false);
    return;
  }
const coalitionRows = order.selectedPartners.map((partner) => ({
  order_id: data.id,
  merchant_id: partner.merchantId,
  capability_id: partner.capabilityId,
  merchant_name: partner.name,
  assigned_quantity: partner.assigned,
  unit: partner.unit,
  price_per_unit: partner.price,
  partner_cost: partner.partnerCost,
  status: "active",
}));

const { error: coalitionError } = await supabase
  .from("coalition_members")
  .insert(coalitionRows);

if (coalitionError) {
  console.error(coalitionError);
  setApprovalError(
    "Order was created, but coalition members could not be saved."
  );
  setIsApproving(false);
  return;
}
  const orderReference = `OM-${String(data.id).padStart(4, "0")}`;

  const updatedOrder = {
    ...order,
    databaseOrderId: data.id,
    orderReference,
  };

  localStorage.setItem(
    "overmeshCurrentOrder",
    JSON.stringify(updatedOrder)
  );

  router.push("/orders/new/approved");
}
  if (!order) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading coalition...
        </div>
      </main>
    );
  }

  const budgetRemaining =
    order.maxNetworkBudget - order.estimatedNetworkCost;

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Coalition Review
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Review fulfilment plan
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Review the merchants selected by OverMesh before confirming this
            fulfilment coalition.
          </p>
        </div>

        {/* Product */}
        <div className="rounded-xl border border-[#d7e5dc] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Requirement
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {order.product}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[#59615d]">
              {order.category}
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[#59615d]">
              {order.deadlineHours} hrs
            </span>

            {order.requirements && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[#59615d]">
                {order.requirements}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Total Required
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.requestedQuantity.toLocaleString("en-IN")}{" "}
              {order.unit}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Existing Capacity
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.ownCapacity.toLocaleString("en-IN")}{" "}
              {order.unit}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Network Capacity
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.securedCapacity.toLocaleString("en-IN")}{" "}
              {order.unit}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Partners
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.selectedPartners.length}
            </p>
          </div>
        </div>

        {/* Existing capacity */}
        {order.ownCapacity > 0 && (
          <div className="mt-6 rounded-xl border border-[#dbe5df] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#628071]">
              Existing Capacity
            </p>

            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Your business
                </h2>

                <p className="mt-1 text-sm text-[#858b91]">
                  Capacity already available before using OverMesh.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#edf7f1] px-3 py-1.5 text-xs font-medium text-[#34745a]">
                {order.ownCapacity.toLocaleString("en-IN")}{" "}
                {order.unit}
              </span>
            </div>
          </div>
        )}

        {/* Partners */}
        <div className="mt-7">
          <h2 className="text-lg font-semibold">
            Fulfilment Partners
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Merchants selected from the live OverMesh network.
          </p>

          <div className="mt-4 space-y-3">
            {order.selectedPartners.map((partner, index) => (
              <div
                key={partner.capabilityId}
                className="rounded-xl border border-[#e2e5e7] bg-white p-5"
              >
                <div className="grid gap-5 md:grid-cols-7 md:items-center">

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {partner.name}
                      </p>

                      {index === 0 && (
                        <span className="rounded-full bg-[#edf7f1] px-2 py-1 text-[10px] font-medium text-[#34745a]">
                          Best Match
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#92979c]">
                      {partner.city} · {partner.productName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#969ca1]">
                      Available
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {partner.capacity} {partner.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#969ca1]">
                      Assigned
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#34745a]">
                      {partner.assigned} {partner.unit}
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
                      Cost
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      ₹
                      {partner.partnerCost.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final summary */}
        <div className="mt-6 rounded-xl border border-[#d8e5dd] bg-[#fbfdfc] p-6">

          <div className="flex flex-col justify-between gap-5 md:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
                Coalition Summary
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Full requirement secured
              </h2>

              <p className="mt-2 text-sm text-[#747b81]">
                {order.requestedQuantity.toLocaleString(
                  "en-IN"
                )}{" "}
                {order.unit} can be fulfilled within{" "}
                {order.deadlineHours} hours.
              </p>
            </div>

            <span className="h-fit rounded-full bg-[#e8f5ed] px-3 py-1.5 text-xs font-medium text-[#34745a]">
              Ready for approval
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">

            <div>
              <p className="text-xs text-[#92979c]">
                Network Cost
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹
                {order.estimatedNetworkCost.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Maximum Budget
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹
                {order.maxNetworkBudget.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Budget Remaining
              </p>

              <p className="mt-1 text-lg font-semibold text-[#34745a]">
                ₹{budgetRemaining.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Merchant Partners
              </p>

              <p className="mt-1 text-lg font-semibold">
                {order.selectedPartners.length}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-[#e5ebe7] pt-5">
            <Link
              href="/orders/new"
              className="rounded-lg border border-[#d8dcda] bg-white px-5 py-2.5 text-sm font-medium"
            >
              Back
            </Link>

            <button
  type="button"
  onClick={handleApproveCoalition}
  disabled={isApproving}
  className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {isApproving
    ? "Creating Order..."
    : "Approve Coalition"}
</button>
{approvalError && (
  <p className="mt-3 text-sm text-red-600">
    {approvalError}
  </p>
)}
          </div>

          <p className="mt-4 text-xs text-[#81878d]">
            Payment has not been processed yet.
          </p>
        </div>
      </div>
    </main>
  );
}