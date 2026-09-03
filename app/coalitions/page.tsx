"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: number;
  product: string;
  category: string | null;
  city: string | null;
  requested_quantity: number;
  secured_capacity: number;
  estimated_network_cost: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type CoalitionMember = {
  id: number;
  order_id: number;
  merchant_id: number;
  capability_id: number | null;
  merchant_name: string;
  assigned_quantity: number;
  unit: string;
  price_per_unit: number;
  partner_cost: number;
  status: string;
};

export default function CoalitionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [members, setMembers] = useState<CoalitionMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoalitions();
  }, []);

  async function loadCoalitions() {
    setLoading(true);

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
          product,
          category,
          city,
          requested_quantity,
          secured_capacity,
          estimated_network_cost,
          status,
          payment_status,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

    const { data: memberData, error: memberError } =
      await supabase
        .from("coalition_members")
        .select(`
          id,
          order_id,
          merchant_id,
          capability_id,
          merchant_name,
          assigned_quantity,
          unit,
          price_per_unit,
          partner_cost,
          status
        `)
        .order("id", {
          ascending: true,
        });

    if (orderError) {
      console.error(orderError);
    }

    if (memberError) {
      console.error(memberError);
    }

    setOrders((orderData || []) as Order[]);
    setMembers(
      (memberData || []) as CoalitionMember[]
    );

    setLoading(false);
  }

  const coalitionOrders = useMemo(() => {
    return orders.filter((order) =>
      members.some(
        (member) => member.order_id === order.id
      )
    );
  }, [orders, members]);

  const recoveredCount = coalitionOrders.filter(
    (order) => order.status === "recovered"
  ).length;

  const activeMemberCount = members.filter(
    (member) => member.status === "active"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading coalitions...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#102018] px-8 py-8 text-white shadow-[0_18px_50px_rgba(18,45,33,0.14)] md:px-10 md:py-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-emerald-300/5 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
                Coalition Intelligence
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="flash-card group rounded-[22px] border border-[#d9e6df] bg-white p-5 shadow-[0_10px_30px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8d6c5] hover:shadow-[0_18px_38px_rgba(20,35,28,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#74837b]">
                      Total Coalitions
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-[#14231c]">
                      {coalitionOrders.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f1] text-lg text-[#159a69]">
                    ◌
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#7a8981]">
                  Merchant teams assembled
                </p>
              </div>

              <div className="flash-card group rounded-[22px] border border-[#bfe0ce] bg-gradient-to-br from-[#e9f7ef] to-[#f8fbf9] p-5 shadow-[0_10px_30px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#99c9ae] hover:shadow-[0_18px_38px_rgba(20,35,28,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#60786b]">
                      Active Allocations
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-[#14231c]">
                      {activeMemberCount}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#688073]">
                  Partners fulfilling orders now
                </p>
              </div>

              <div className="flash-card group rounded-[22px] border border-[#d1e1d8] bg-[#f3f8f5] p-5 shadow-[0_10px_30px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#abcdbb] hover:shadow-[0_18px_38px_rgba(20,35,28,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#687c71]">
                      Self-Healed Coalitions
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-[#14231c]">
                      {recoveredCount}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-lg text-[#4c8067]">
                    ↻
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#74867d]">
                  Automatically rebuilt after disruption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coalitions */}
        <div className="mt-8 space-y-6">
          {coalitionOrders.length === 0 ? (
            <div className="rounded-xl border bg-white p-8">
              No coalition records found yet.
            </div>
          ) : (
            coalitionOrders.map((order) => {
              const orderMembers = members.filter(
                (member) =>
                  member.order_id === order.id
              );

              const activeMembers =
                orderMembers.filter(
                  (member) =>
                    member.status === "active"
                );

              const failedMembers =
                orderMembers.filter(
                  (member) =>
                    member.status === "failed"
                );

              const reference = `OM-${String(
                order.id
              ).padStart(4, "0")}`;

              return (
                <div
  key={order.id}
  className="flash-card coalition-3d-card group relative overflow-hidden rounded-[26px] border border-[#d6e4dc] bg-gradient-to-br from-white via-[#fbfdfc] to-[#eef7f2] p-6 shadow-[0_14px_40px_rgba(20,35,28,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#a9cfba] hover:shadow-[0_24px_55px_rgba(20,35,28,0.14)]"
>
                  {/* Order header */}
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {reference}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            order.status ===
                            "recovered"
                              ? "bg-[#edf1ff] text-[#4c5d94]"
                              : "bg-[#edf7f1] text-[#34745a]"
                          }`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            order.payment_status ===
                            "paid"
                              ? "bg-[#e8f5ed] text-[#34745a]"
                              : "bg-[#fff4e8] text-[#946c24]"
                          }`}
                        >
                          {order.payment_status ===
                          "paid"
                            ? "Paid"
                            : "Unpaid"}
                        </span>
                      </div>
                      {/* Live Coalition Map */}
<div className="coalition-network-panel mt-6">

  <div className="relative z-10 flex flex-col gap-5 px-5 py-5">

    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#688073]">
          Live Coalition Map
        </p>

        <p className="mt-1 text-xs text-[#7b8982]">
          Capacity distributed across connected partners
        </p>
      </div>

      <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        Coalition Live
      </span>
    </div>


    {/* Network */}
    <div className="relative flex min-h-[130px] items-center justify-between gap-6">

      {/* Requester */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="coalition-requester-node">
          R
        </div>

        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#60756a]">
          Requester
        </p>
      </div>


      {/* Animated connection */}
      <div className="coalition-flow-line flex-1" />


      {/* Partners */}
      <div className="relative z-10 flex max-w-[65%] flex-wrap justify-end gap-3">

        {activeMembers.slice(0, 3).map((member) => (
          <div
            key={member.id}
            className="coalition-partner-node"
          >
            <div className="coalition-node-orb">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
            </div>

            <p className="mt-2 max-w-[100px] truncate text-center text-[10px] font-semibold text-[#254536]">
              {member.merchant_name}
            </p>

            <p className="mt-0.5 text-[9px] text-[#819087]">
              {member.assigned_quantity} {member.unit}
            </p>
          </div>
        ))}


        {failedMembers.slice(0, 1).map((member) => (
          <div
            key={member.id}
            className="coalition-partner-node opacity-75"
          >
            <div className="coalition-node-orb coalition-node-failed">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
            </div>

            <p className="mt-2 max-w-[100px] truncate text-center text-[10px] font-semibold text-rose-700">
              {member.merchant_name}
            </p>

            <p className="mt-0.5 text-[9px] text-rose-400">
              Disrupted
            </p>
          </div>
        ))}

      </div>

    </div>


    {order.status === "recovered" && (
      <div className="coalition-recovery-chip">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        Self-healing completed — coalition automatically reconnected
      </div>
    )}

  </div>

</div>

                      <h2 className="mt-3 text-xl font-semibold">
                        {order.product}
                      </h2>

                      <p className="mt-1 text-sm text-[#858b91]">
                        {order.city ||
                          "Location not specified"}
                        {order.category
                          ? ` · ${order.category}`
                          : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Required
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {order.requested_quantity.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Active Partners
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {activeMembers.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#92979c]">
                          Network Cost
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          ₹
                          {Number(
                            order.estimated_network_cost
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mt-6 border-t border-[#edf0ee] pt-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                      Coalition Members
                    </p>

                    <div className="mt-4 space-y-3">
                      {orderMembers.map(
                        (member) => (
                          <div
                            key={member.id}
                            className={`rounded-lg border p-4 ${
                              member.status ===
                              "failed"
                                ? "border-[#efd0d0] bg-[#fff8f8]"
                                : "border-[#e2e5e7] bg-[#fafbfa]"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">
                                    {
                                      member.merchant_name
                                    }
                                  </p>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                                      member.status ===
                                      "failed"
                                        ? "bg-[#fff0f0] text-[#a34747]"
                                        : "bg-[#edf7f1] text-[#34745a]"
                                    }`}
                                  >
                                    {member.status}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs text-[#92979c]">
                                  Merchant ID:{" "}
                                  {member.merchant_id}
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-6">

                                <div>
                                  <p className="text-xs text-[#92979c]">
                                    Assigned
                                  </p>

                                  <p className="mt-1 text-sm font-semibold">
                                    {
                                      member.assigned_quantity
                                    }{" "}
                                    {member.unit}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-[#92979c]">
                                    Price
                                  </p>

                                  <p className="mt-1 text-sm font-semibold">
                                    ₹
                                    {
                                      member.price_per_unit
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-[#92979c]">
                                    Cost
                                  </p>

                                  <p className="mt-1 text-sm font-semibold">
                                    ₹
                                    {Number(
                                      member.partner_cost
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Recovery info */}
                    {failedMembers.length > 0 && (
                      <div className="mt-4 rounded-lg border border-[#d7e5dc] bg-[#f5faf7] p-4">
                        <p className="text-sm font-semibold text-[#34745a]">
                          Self-Healing Event Detected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#707873]">
                          {failedMembers.length} merchant
                          {failedMembers.length === 1
                            ? ""
                            : "s"}{" "}
                          failed during fulfilment.
                          OverMesh rebuilt the coalition
                          using replacement capacity.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
