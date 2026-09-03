"use client";

import Link from "next/link";
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

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

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
        setError(error.message);
      } else {
        setOrders((data || []) as Order[]);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (order) => order.payment_status === "paid"
    );

    const unpaidOrders = orders.filter(
      (order) => order.payment_status !== "paid"
    );

    const recoveredOrders = orders.filter(
      (order) => order.status === "recovered"
    );

    const paidRevenue = paidOrders.reduce(
      (total, order) =>
        total + Number(order.estimated_network_cost),
      0
    );

    const averageOrderValue =
      paidOrders.length > 0
        ? paidRevenue / paidOrders.length
        : 0;

    const recoveryRate =
      totalOrders > 0
        ? (recoveredOrders.length / totalOrders) * 100
        : 0;

    const totalDemand = orders.reduce(
      (total, order) =>
        total + Number(order.requested_quantity),
      0
    );

    const productMap = new Map<
      string,
      {
        quantity: number;
        orders: number;
        value: number;
      }
    >();

    orders.forEach((order) => {
      const current = productMap.get(order.product) || {
        quantity: 0,
        orders: 0,
        value: 0,
      };

      productMap.set(order.product, {
        quantity:
          current.quantity +
          Number(order.requested_quantity),

        orders: current.orders + 1,

        value:
          current.value +
          Number(order.estimated_network_cost),
      });
    });

    const productDemand = Array.from(
      productMap.entries()
    )
      .map(([product, values]) => ({
        product,
        ...values,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    const cityMap = new Map<
      string,
      {
        orders: number;
        quantity: number;
      }
    >();

    orders.forEach((order) => {
      const city =
        order.city?.trim() || "Not specified";

      const current = cityMap.get(city) || {
        orders: 0,
        quantity: 0,
      };

      cityMap.set(city, {
        orders: current.orders + 1,
        quantity:
          current.quantity +
          Number(order.requested_quantity),
      });
    });

    const cityDemand = Array.from(cityMap.entries())
      .map(([city, values]) => ({
        city,
        ...values,
      }))
      .sort((a, b) => b.orders - a.orders);

    return {
      totalOrders,
      paidOrders: paidOrders.length,
      unpaidOrders: unpaidOrders.length,
      recoveredOrders: recoveredOrders.length,

      paidRevenue,
      averageOrderValue,
      recoveryRate,
      totalDemand,

      productDemand,
      cityDemand,
    };
  }, [orders]);

  const maxProductDemand =
    analytics.productDemand.length > 0
      ? Math.max(
          ...analytics.productDemand.map(
            (item) => item.quantity
          )
        )
      : 1;

  const maxCityOrders =
    analytics.cityDemand.length > 0
      ? Math.max(
          ...analytics.cityDemand.map(
            (item) => item.orders
          )
        )
      : 1;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading OverMesh analytics...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-7xl rounded-xl border border-red-200 bg-white p-8">
          <h1 className="text-xl font-semibold">
            Could not load analytics
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
       <div className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#102018] px-8 py-8 text-white shadow-[0_18px_50px_rgba(18,45,33,0.14)] md:px-10 md:py-9">

  {/* Ambient depth */}
  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
  <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-emerald-300/5 blur-3xl" />

  <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

    <div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
          Network Intelligence
        </p>
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        Analytics
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
        Live operational, payment and fulfilment intelligence generated from
        OverMesh network activity.
      </p>
    </div>

    <div className="hidden items-center gap-2 rounded-full border border-emerald-300/10 bg-white/5 px-4 py-2 text-[11px] font-medium text-emerald-100/80 md:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-30" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
      </span>
      Live Intelligence Feed
    </div>

          <Link
            href="/orders/new"
            className="w-fit rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white"
          >
            + Create Order
          </Link>

  </div>
        </div>

        {/* Main metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
<div className="flash-card analytics-kpi-card group rounded-[24px] border border-[#d8e5de] bg-gradient-to-br from-white via-[#fbfdfc] to-[#f1f7f3] p-6 shadow-[0_12px_34px_rgba(20,35,28,0.07)] transition-all duration-300 hover:border-[#abcdbb] hover:shadow-[0_22px_48px_rgba(20,35,28,0.13)]">

  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#718078]">
        Total Orders
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#14231c]">
        {analytics.totalOrders}
      </p>
    </div>

    <div className="flex h-11 w-11 items-center justify-center rounded-[17px] border border-[#dce8e1] bg-[#eef6f1] text-lg font-semibold text-[#159a69]">
      ↗
    </div>
  </div>

  <div className="mt-3 flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-[#159a69]" />

    <p className="text-xs text-[#718078]">
      Live orders stored in Supabase
    </p>
  </div>

</div>

          <div className="flash-card analytics-kpi-card group rounded-[24px] border border-[#b9ddc9] bg-gradient-to-br from-[#e7f6ed] via-[#f4faf6] to-white p-6 shadow-[0_12px_34px_rgba(20,35,28,0.08)] transition-all duration-300 hover:border-[#8fc3a7] hover:shadow-[0_22px_48px_rgba(20,35,28,0.14)]">

  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5f786a]">
        Verified Network Value
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#14231c]">
        ₹{analytics.paidRevenue.toLocaleString("en-IN")}
      </p>
    </div>

    <div className="flex h-11 w-11 items-center justify-center rounded-[17px] border border-white/70 bg-white/75 text-lg font-semibold text-[#159a69] shadow-sm">
      ₹
    </div>
  </div>

  <div className="mt-3 flex items-center gap-2">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>

    <p className="text-xs text-[#60796b]">
      Razorpay verified payments
    </p>
  </div>

</div>

          <div className="flash-card analytics-kpi-card group rounded-[24px] border border-[#c7dfd3] bg-gradient-to-br from-[#edf8f2] via-[#f7fbf9] to-white p-6 shadow-[0_12px_34px_rgba(20,35,28,0.07)] transition-all duration-300 hover:border-[#9fcbb5] hover:shadow-[0_22px_48px_rgba(20,35,28,0.13)]">

  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#667d70]">
        Self-Healed Orders
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#14231c]">
        {analytics.recoveredOrders}
      </p>
    </div>

    <div className="flex h-11 w-11 items-center justify-center rounded-[17px] border border-[#d7e8df] bg-white/80 text-xl text-[#159a69]">
      ↻
    </div>
  </div>

  <div className="mt-3 flex items-center gap-2">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>

    <p className="text-xs text-[#6d8176]">
      Automatically recovered after disruption
    </p>
  </div>

</div>
<div className="flash-card analytics-kpi-card group rounded-[24px] border border-[#d4e2da] bg-gradient-to-br from-white via-[#f8fbf9] to-[#eef6f2] p-6 shadow-[0_12px_34px_rgba(20,35,28,0.07)] transition-all duration-300 hover:border-[#a9c9b8] hover:shadow-[0_22px_48px_rgba(20,35,28,0.13)]">

  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6b7f74]">
        Recovery Rate
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#14231c]">
        {analytics.recoveryRate.toFixed(1)}%
      </p>
    </div>

    <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d6e6dd] bg-white/80">
      <div className="absolute inset-[5px] rounded-full border-2 border-emerald-400/70" />

      <span className="text-xs font-semibold text-[#159a69]">
        %
      </span>
    </div>
  </div>

  <p className="mt-3 text-xs text-[#708178]">
    Self-healed orders compared with total network orders
  </p>

</div>
        </div>

        {/* Secondary metrics */}
        <div className="mt-4 grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#92979c]">
              Paid Orders
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.paidOrders}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#92979c]">
              Unpaid Orders
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.unpaidOrders}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#92979c]">
              Avg. Paid Order Value
            </p>

            <p className="mt-2 text-xl font-semibold">
              ₹
              {Math.round(
                analytics.averageOrderValue
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#92979c]">
              Total Demand
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.totalDemand.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>
        </div>

        {/* Payment overview */}
        <div className="mt-8 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
            Payment Health
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Paid vs Unpaid Orders
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div className="rounded-lg bg-[#f5faf7] p-5">
              <p className="text-sm text-[#65736b]">
                Razorpay Verified
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">
                  {analytics.paidOrders}
                </p>

                <span className="rounded-full bg-[#e7f4eb] px-3 py-1 text-xs font-medium text-[#34745a]">
                  Paid
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-[#fff9ef] p-5">
              <p className="text-sm text-[#796f5e]">
                Awaiting Payment
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">
                  {analytics.unpaidOrders}
                </p>

                <span className="rounded-full bg-[#fff1d8] px-3 py-1 text-xs font-medium text-[#946c24]">
                  Unpaid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product demand */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
              Demand Intelligence
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Product Demand
            </h2>

            <p className="mt-1 text-sm text-[#858b91]">
              Products ranked by total requested quantity.
            </p>

            <div className="mt-6 space-y-5">
              {analytics.productDemand.length === 0 ? (
                <p className="text-sm text-[#92979c]">
                  No product data available.
                </p>
              ) : (
                analytics.productDemand
                  .slice(0, 8)
                  .map((item) => {
                    const width =
                      (item.quantity /
                        maxProductDemand) *
                      100;

                    return (
                      <div key={item.product}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.product}
                            </p>

                            <p className="mt-1 text-xs text-[#92979c]">
                              {item.orders} order
                              {item.orders === 1 ? "" : "s"}
                            </p>
                          </div>

                          <p className="text-sm font-semibold">
                            {item.quantity.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full border border-[#dbe7e0] bg-[#edf3ef] shadow-inner">
                          <div
                            className="analytics-demand-bar h-full rounded-full bg-gradient-to-r from-[#1f8f64] via-[#34c98a] to-[#8ee0ba] shadow-[0_0_14px_rgba(52,201,138,0.35)]"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* City demand */}
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
              Location Intelligence
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              City-wise Demand
            </h2>

            <p className="mt-1 text-sm text-[#858b91]">
              Cities ranked by number of fulfilment requests.
            </p>

            <div className="mt-6 space-y-5">
              {analytics.cityDemand.length === 0 ? (
                <p className="text-sm text-[#92979c]">
                  No city data available.
                </p>
              ) : (
                analytics.cityDemand
                  .slice(0, 8)
                  .map((item) => {
                    const width =
                      (item.orders /
                        maxCityOrders) *
                      100;

                    return (
                      <div key={item.city}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.city}
                            </p>

                            <p className="mt-1 text-xs text-[#92979c]">
                              {item.quantity.toLocaleString(
                                "en-IN"
                              )}{" "}
                              requested units
                            </p>
                          </div>

                          <p className="text-sm font-semibold">
                            {item.orders} order
                            {item.orders === 1 ? "" : "s"}
                          </p>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0ee]">
                          <div
                            className="h-full rounded-full bg-[#667287]"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Recent business activity */}
        <div className="mt-8 rounded-xl border border-[#e2e5e7] bg-white p-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                Network Activity
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Recent Orders
              </h2>
            </div>

            <Link
              href="/orders"
              className="text-sm font-semibold text-[#34745a]"
            >
              View all →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-[#edf0ee]">
            {orders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold">
                    OM-
                    {String(order.id).padStart(4, "0")}
                    {" · "}
                    {order.product}
                  </p>

                  <p className="mt-1 text-xs text-[#92979c]">
                    {order.city || "Location not specified"} ·{" "}
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                      order.status === "recovered"
                        ? "bg-[#edf1ff] text-[#4c5d94]"
                        : "bg-[#edf7f1] text-[#34745a]"
                    }`}
                  >
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

                  <span className="text-sm font-semibold">
                    ₹
                    {Number(
                      order.estimated_network_cost
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}