"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import HeroNetworkAnimation from "../components/HeroNetworkAnimation";
type Order = {
  id: number;
  product: string;
  city: string | null;
  requested_quantity: number;
  secured_capacity: number;
  estimated_network_cost: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type Capability = {
  available_capacity: number;
  is_available: boolean;
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: orderData, error: orderError } =
        await supabase
          .from("orders")
          .select(`
            id,
            product,
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

      const { data: capabilityData, error: capabilityError } =
        await supabase
          .from("merchant_capabilities")
          .select(`
            available_capacity,
            is_available
          `);

      if (orderError) {
        console.error(orderError);
      }

      if (capabilityError) {
        console.error(capabilityError);
      }

      setOrders((orderData || []) as Order[]);
      setCapabilities(
        (capabilityData || []) as Capability[]
      );

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const networkCapacity = capabilities
      .filter((capability) => capability.is_available)
      .reduce(
        (total, capability) =>
          total + Number(capability.available_capacity),
        0
      );

    const paidRevenue = orders
      .filter((order) => order.payment_status === "paid")
      .reduce(
        (total, order) =>
          total + Number(order.estimated_network_cost),
        0
      );

    const recoveredOrders = orders.filter(
      (order) => order.status === "recovered"
    ).length;

    const paidOrders = orders.filter(
      (order) => order.payment_status === "paid"
    ).length;

    return {
      networkCapacity,
      paidRevenue,
      recoveredOrders,
      paidOrders,
    };
  }, [orders, capabilities]);

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading OverMesh dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#17191c]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#e2e5e7] bg-white p-6 md:block">
          <div>
            <h1 className="text-xl font-bold">
              OverMesh AI
            </h1>

            <p className="mt-1 text-xs text-[#92979c]">
              Self-Healing Commerce
            </p>
          </div>

          <nav className="mt-10">

  {/* Overview */}
  <Link
    href="/"
    className="block rounded-lg bg-[#eef3f0] px-4 py-3 text-sm font-medium"
  >
    Overview
  </Link>

  {/* Requester */}
  <div className="mt-7">
    <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa19d]">
      Requester Business
    </p>

    <div className="mt-2 space-y-1">
      <Link
        href="/orders/new"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        + Request Capacity
      </Link>

      <Link
        href="/orders"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Orders
      </Link>

      <Link
        href="/coalitions"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Coalitions
      </Link>
    </div>
  </div>

  {/* Capacity Partner */}
  <div className="mt-7">
    <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa19d]">
      Capacity Partner
    </p>

    <div className="mt-2 space-y-1">
      <Link
        href="/merchant/dashboard"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Merchant Console
      </Link>

      <Link
        href="/merchant/register"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Join Capacity Network
      </Link>
    </div>
  </div>

  {/* Network */}
  <div className="mt-7">
    <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa19d]">
      Network Intelligence
    </p>

    <div className="mt-2 space-y-1">
      <Link
        href="/capacity-network"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Capacity Network
      </Link>

      <Link
        href="/analytics"
        className="block rounded-lg px-4 py-2.5 text-sm text-[#697076] hover:bg-[#f5f6f6]"
      >
        Analytics
      </Link>
    </div>
  </div>

  {/* Role switch */}
  <div className="mt-8 border-t border-[#ecefed] pt-5">
    <Link
      href="/start"
      className="block rounded-lg px-4 py-2.5 text-sm font-medium text-[#34745a] hover:bg-[#f3f7f4]"
    >
      ⇄ Switch Role
    </Link>
  </div>
</nav>

          <div className="mt-10 rounded-xl bg-[#f5f8f6] p-4">
            <p className="text-xs font-semibold">
              Merchant Network
            </p>

            <p className="mt-2 text-xs leading-5 text-[#858b91]">
              Share spare capacity and receive matching fulfilment
              opportunities.
            </p>

            <Link
              href="/merchant/register"
              className="mt-4 inline-block text-xs font-semibold text-[#34745a]"
            >
              Join OverMesh →
            </Link>
          </div>
        </aside>

        {/* Dashboard */}
        <section className="flex-1 px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
        {/* Advanced Hero */}
<div className="relative overflow-hidden rounded-3xl bg-[#0d1713] px-7 py-9 text-white md:px-10 md:py-11">
  

  {/* Background decoration */}
  <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

  <div
    className="pointer-events-none absolute inset-0 opacity-[0.07]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}
  />

  <div className="relative z-10">

    {/* Status */}
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
        OverMesh Intelligence
      </span>

      <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>

        Network Online
      </span>
    </div>

    {/* Main content */}
<div className="relative z-10 mt-8 grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">

  {/* LEFT SIDE */}
  <div>
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
      AI-Powered Shared Capacity Network
    </p>

    <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
      Don&apos;t reject the order.
      <br />
      <span className="text-emerald-200">
        Borrow the capacity.
      </span>
    </h2>

    <p className="mt-7 max-w-2xl text-sm leading-7 text-white/65">
      OverMesh connects businesses with spare capacity, builds intelligent
      fulfilment coalitions and automatically rebuilds them when a partner fails.
    </p>

    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/orders/new"
        className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0d1713] transition hover:bg-emerald-50"
      >
        + Request Capacity
      </Link>

      <Link
        href="/start"
        className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Explore Roles →
      </Link>
    </div>
  </div>


  {/* RIGHT SIDE — MEDIUM LIVE NETWORK */}
  <div className="relative hidden h-[285px] overflow-hidden rounded-[24px] border border-white/10 bg-[#10231c]/80 lg:block">

    <HeroNetworkAnimation />

    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0b1813] via-[#0b1813]/70 to-transparent px-5 pb-5 pt-16">
      <div className="flex items-end justify-between gap-4">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/60">
            Live Capacity Mesh
          </p>

          <p className="mt-1 text-sm text-white/80">
            Merchant nodes coordinating in real time
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/5 px-3 py-1.5 text-[10px] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Active
        </div>

      </div>
    </div>

  </div>

</div>

    {/* Live data */}
    <div className="mt-8 grid gap-3 sm:grid-cols-3">

      <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition hover:bg-white/[0.08]">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
          Live Orders
        </p>

        <p className="mt-2 text-xl font-semibold">
          {orders.length}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition hover:bg-white/[0.08]">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
          Shared Capacity
        </p>

        <p className="mt-2 text-xl font-semibold">
          {metrics.networkCapacity.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition hover:bg-white/[0.08]">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
          Self-Healed
        </p>

        <p className="mt-2 text-xl font-semibold">
          {metrics.recoveredOrders}
        </p>
      </div>
    </div>
  </div>
</div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

  {/* Total Orders */}
  <div className="flash-card group rounded-2xl border border-[#d7e4dc] bg-white p-6 shadow-[0_10px_30px_rgba(19,48,35,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(19,48,35,0.14)]">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#728078]">
        Total Orders
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef6f1] text-lg text-[#159a69]">
        ↗
      </div>
    </div>

    <p className="mt-4 text-3xl font-semibold text-[#14231c]">
      {orders.length}
    </p>

    <p className="mt-2 text-xs text-[#7a8981]">
      Live demand across the network
    </p>
  </div>


  {/* Live Network Capacity */}
  <div className="flash-card group rounded-2xl border border-[#b8ddc9] bg-[#eaf7f0] p-6 shadow-[0_10px_30px_rgba(19,48,35,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(19,48,35,0.14)]">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#628071]">
        Live Network Capacity
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-lg font-medium text-[#159a69]">
        ◎
      </div>
    </div>

    <p className="mt-4 text-3xl font-semibold text-[#14231c]">
      {metrics.networkCapacity.toLocaleString("en-IN")}
    </p>

    <div className="mt-2 flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </span>

      <p className="text-xs text-[#678072]">
        Capacity available right now
      </p>
    </div>
  </div>


  {/* Self-Healed Orders */}
  <div className="flash-card group rounded-2xl border border-[#c8ddd3] bg-[#f0f6f3] p-6 shadow-[0_10px_30px_rgba(19,48,35,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(19,48,35,0.14)]">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f8278]">
        Self-Healed Orders
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-lg text-[#4f8069]">
        ↻
      </div>
    </div>

    <p className="mt-4 text-3xl font-semibold text-[#14231c]">
      {metrics.recoveredOrders}
    </p>

    <p className="mt-2 text-xs text-[#75877e]">
      Automatically recovered after partner disruption
    </p>
  </div>


  {/* Paid Network Value */}
  <div className="flash-card group rounded-2xl border border-[#9fd0b5] bg-gradient-to-br from-[#dff3e8] to-[#f7fbf9] p-6 shadow-[0_10px_30px_rgba(19,48,35,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(19,48,35,0.15)]">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#587565]">
        Paid Network Value
      </p>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-lg font-semibold text-[#159a69]">
        ₹
      </div>
    </div>

    <p className="mt-4 text-3xl font-semibold text-[#14231c]">
      ₹{metrics.paidRevenue.toLocaleString("en-IN")}
    </p>

    <div className="mt-2 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />

      <p className="text-xs text-[#5f7d6d]">
        {metrics.paidOrders} verified payments
      </p>
    </div>
  </div>

</div>

            {/* Recent orders */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Recent Orders
                  </h3>

                  <p className="mt-1 text-sm text-[#858b91]">
                    Latest fulfilment activity.
                  </p>
                </div>

                <Link
                  href="/orders"
                  className="text-sm font-semibold text-[#34745a]"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="rounded-xl border bg-white p-6">
                    No orders yet.
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-[#e2e5e7] bg-white p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              OM-
                              {String(order.id).padStart(
                                4,
                                "0"
                              )}
                            </p>

                            <span className="rounded-full bg-[#f2f5f3] px-2.5 py-1 text-xs capitalize">
                              {order.status}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${
                                order.payment_status === "paid"
                                  ? "bg-[#e8f5ed] text-[#34745a]"
                                  : "bg-[#fff4e8] text-[#946c24]"
                              }`}
                            >
                              {order.payment_status === "paid"
                                ? "Paid"
                                : "Unpaid"}
                            </span>
                          </div>

                          <h4 className="mt-2 font-medium">
                            {order.product}
                          </h4>

                          <p className="mt-1 text-xs text-[#92979c]">
                            {order.city ||
                              "Location not specified"}
                          </p>
                        </div>

                        <div className="flex gap-8">

                          <div>
                            <p className="text-xs text-[#92979c]">
                              Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {order.requested_quantity.toLocaleString(
                                "en-IN"
                              )}
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
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}