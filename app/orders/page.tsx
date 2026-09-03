"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
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

    if (error) {
      console.error(error);
    } else {
      setOrders((data || []) as Order[]);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        <div className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#102018] px-8 py-8 text-white shadow-[0_18px_50px_rgba(18,45,33,0.14)] md:px-10 md:py-9">

  {/* subtle background glow */}
  <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
  <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-emerald-300/5 blur-3xl" />

  <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

    <div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-300" />

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
          Order Network
        </p>
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        Orders
      </h1>

      <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
        Track live requester demand, payment status and fulfilment activity
        across the OverMesh network.
      </p>
    </div>

    <Link
      href="/orders/new"
      className="flash-card inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#102018] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
    >
      + Create Order
    </Link>

  </div>

</div>

        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-xl border bg-white p-8">
              No orders created yet.
            </div>
          ) : (
            orders.map((order) => {
              const reference = `OM-${String(
                order.id
              ).padStart(4, "0")}`;

              return (
               <div
  key={order.id}
  className="flash-card group rounded-2xl border border-[#d8e5de] border-l-4 border-l-[#159a69] bg-gradient-to-r from-white via-white to-[#f3faf6] p-6 shadow-[0_8px_28px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#a9cfba] hover:border-l-[#159a69] hover:shadow-[0_16px_38px_rgba(20,35,28,0.12)]"
>
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold">
                          {reference}
                        </p>

                        <span
  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold capitalize ${
    order.status === "recovered"
      ? "border-teal-200 bg-teal-50 text-teal-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700"
  }`}
>
  <span
    className={`h-1.5 w-1.5 rounded-full ${
      order.status === "recovered"
        ? "bg-teal-500"
        : "bg-emerald-500"
    }`}
  />

  {order.status}
</span>

                       <span
  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
    order.payment_status === "paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700"
  }`}
>
  <span
    className={`h-1.5 w-1.5 rounded-full ${
      order.payment_status === "paid"
        ? "bg-emerald-500"
        : "bg-amber-500"
    }`}
  />

  {order.payment_status === "paid"
    ? "Paid"
    : "Unpaid"}
</span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold">
                        {order.product}
                      </h2>

                      <p className="mt-1 text-sm text-[#858b91]">
                        {order.city || "Location not specified"}
                        {order.category
                          ? ` · ${order.category}`
                          : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

  <div className="rounded-xl border border-[#dfe8e2] bg-[#f8fbf9] px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8981]">
      Quantity
    </p>

    <p className="mt-1 text-sm font-semibold text-[#14231c]">
      {order.requested_quantity.toLocaleString("en-IN")}
    </p>
  </div>

  <div className="rounded-xl border border-[#cfe3d8] bg-[#eef7f2] px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#698073]">
      Network Cost
    </p>

    <p className="mt-1 text-sm font-semibold text-[#14231c]">
      ₹{Number(order.estimated_network_cost).toLocaleString("en-IN")}
    </p>
  </div>

  <div className="rounded-xl border border-[#dfe8e2] bg-white/80 px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8981]">
      Created
    </p>

    <p className="mt-1 text-sm font-semibold text-[#14231c]">
      {new Date(order.created_at).toLocaleDateString("en-IN")}
    </p>
  </div>

</div>
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