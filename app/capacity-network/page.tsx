"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Merchant = {
  id: number;
  name: string;
  city: string;
  reliability: number;
  status: string;
};

type Capability = {
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

type NetworkItem = Capability & {
  merchantName: string;
  city: string;
  reliability: number;
  merchantStatus: string;
};

export default function CapacityNetworkPage() {
  const [network, setNetwork] = useState<NetworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    loadNetwork();
  }, []);

  async function loadNetwork() {
    setLoading(true);

    const { data: merchants, error: merchantError } =
      await supabase
        .from("merchants")
        .select("id, name, city, reliability, status");

    const { data: capabilities, error: capabilityError } =
      await supabase
        .from("merchant_capabilities")
        .select("*")
        .order("product_name");

    if (merchantError || capabilityError) {
      console.error(merchantError || capabilityError);
      setLoading(false);
      return;
    }

    const merchantMap = new Map<number, Merchant>();

    ((merchants || []) as Merchant[]).forEach((merchant) => {
      merchantMap.set(Number(merchant.id), merchant);
    });

    const merged = ((capabilities || []) as Capability[])
      .map((capability) => {
        const merchant = merchantMap.get(
          Number(capability.merchant_id)
        );

        if (!merchant) return null;

        return {
          ...capability,
          merchantName: merchant.name,
          city: merchant.city,
          reliability: merchant.reliability,
          merchantStatus: merchant.status,
        };
      })
      .filter(
        (item): item is NetworkItem => item !== null
      );

    setNetwork(merged);
    setLoading(false);
  }

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(network.map((item) => item.category))
      ).sort(),
    ];
  }, [network]);

  const cities = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(network.map((item) => item.city))
      ).sort(),
    ];
  }, [network]);

  const filteredNetwork = useMemo(() => {
    const query = search.toLowerCase().trim();

    return network.filter((item) => {
      const matchesSearch =
        !query ||
        item.merchantName.toLowerCase().includes(query) ||
        item.product_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesCity =
        cityFilter === "All" ||
        item.city === cityFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity
      );
    });
  }, [
    network,
    search,
    categoryFilter,
    cityFilter,
  ]);

  const totalCapacity = filteredNetwork
    .filter((item) => item.is_available)
    .reduce(
      (total, item) =>
        total + Number(item.available_capacity),
      0
    );

  const activeCapabilities = filteredNetwork.filter(
    (item) => item.is_available
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading live merchant network...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#102018] px-8 py-8 text-white shadow-[0_18px_50px_rgba(18,45,33,0.14)] md:px-10 md:py-9">

  <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

  <div className="relative z-10">
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-emerald-300" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
        OverMesh Network
      </p>
    </div>

    <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
      Capacity Network
    </h1>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
      Discover live spare capacity, merchant availability and fulfilment strength
      across the OverMesh network.
    </p>
  </div>

</div>

        {/* Metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

  {/* Capabilities */}
  <div className="flash-card group rounded-[22px] border border-[#d9e6df] bg-white p-5 shadow-[0_8px_28px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8d6c5] hover:shadow-[0_16px_36px_rgba(20,35,28,0.11)]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#74837b]">
          Capabilities
        </p>

        <p className="mt-3 text-3xl font-semibold text-[#14231c]">
          {filteredNetwork.length}
        </p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f1] text-lg text-[#159a69]">
        ◫
      </div>
    </div>

    <p className="mt-2 text-xs text-[#7a8981]">
      Matching merchant capabilities
    </p>
  </div>


  {/* Currently Available */}
  <div className="flash-card group rounded-[22px] border border-[#bfe0ce] bg-gradient-to-br from-[#e9f7ef] to-[#f7fbf9] p-5 shadow-[0_8px_28px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#98c9ad] hover:shadow-[0_16px_36px_rgba(20,35,28,0.11)]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#60786b]">
          Currently Available
        </p>

        <p className="mt-3 text-3xl font-semibold text-[#14231c]">
          {activeCapabilities}
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
      Partners ready to accept capacity
    </p>
  </div>


  {/* Shared Capacity */}
  <div className="flash-card group rounded-[22px] border border-[#d2e1d9] bg-[#f3f8f5] p-5 shadow-[0_8px_28px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#abcdbb] hover:shadow-[0_16px_36px_rgba(20,35,28,0.11)]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#687c71]">
          Shared Capacity
        </p>

        <p className="mt-3 text-3xl font-semibold text-[#14231c]">
          {totalCapacity.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-lg text-[#4c8067]">
        ↗
      </div>
    </div>

    <p className="mt-2 text-xs text-[#74867d]">
      Total units available in network
    </p>
  </div>

</div>
{/* Live Network Pulse */}
<div className="capacity-pulse-strip mt-6">
  <div className="capacity-pulse-line" />

  <span className="capacity-pulse-node node-one" />
  <span className="capacity-pulse-node node-two" />
  <span className="capacity-pulse-node node-three" />
  <span className="capacity-pulse-node node-four" />

  <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#688073]">
        Live Capacity Flow
      </p>

      <p className="mt-1 text-sm font-medium text-[#183328]">
        Available partners are continuously updating the shared network.
      </p>
    </div>

    <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Network Live
    </div>
  </div>
</div>
        {/* Filters */}
        <div className="mt-6 rounded-[24px] border border-[#d9e6df] bg-gradient-to-br from-white to-[#f4f9f6] p-5 shadow-[0_10px_32px_rgba(20,35,28,0.05)]">

  <div className="grid gap-4 md:grid-cols-[1.3fr_0.85fr_0.85fr]">

    {/* Search */}
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78877f]">
        Search Network
      </p>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search merchant or product..."
        className="w-full rounded-2xl border border-[#d9e5de] bg-white px-4 py-3 text-sm text-[#14231c] outline-none transition-all duration-200 placeholder:text-[#9aa6a0] focus:border-[#8fc2a7] focus:ring-4 focus:ring-emerald-100/60"
      />
    </div>


    {/* Category */}
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78877f]">
        Category
      </p>

      <select
        value={categoryFilter}
        onChange={(e) =>
          setCategoryFilter(e.target.value)
        }
        className="w-full rounded-2xl border border-[#d9e5de] bg-white px-4 py-3 text-sm text-[#14231c] outline-none transition-all duration-200 focus:border-[#8fc2a7] focus:ring-4 focus:ring-emerald-100/60"
      >
        {categories.map((category) => (
          <option
            key={category}
            value={category}
          >
            {category === "All"
              ? "All Categories"
              : category}
          </option>
        ))}
      </select>
    </div>


    {/* City */}
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78877f]">
        City
      </p>

      <select
        value={cityFilter}
        onChange={(e) =>
          setCityFilter(e.target.value)
        }
        className="w-full rounded-2xl border border-[#d9e5de] bg-white px-4 py-3 text-sm text-[#14231c] outline-none transition-all duration-200 focus:border-[#8fc2a7] focus:ring-4 focus:ring-emerald-100/60"
      >
        {cities.map((city) => (
          <option
            key={city}
            value={city}
          >
            {city === "All"
              ? "All Cities"
              : city}
          </option>
        ))}
      </select>
    </div>

  </div>

</div>

        {/* Network */}
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {filteredNetwork.length === 0 ? (
            <div className="rounded-xl border bg-white p-8">
              No matching merchant capabilities found.
            </div>
          ) : (
            filteredNetwork.map((item) => (
              <div
                key={item.id}
                className="flash-card group relative overflow-hidden rounded-[24px] border border-[#d7e5dd] bg-gradient-to-br from-white via-white to-[#f2f8f4] p-6 shadow-[0_10px_30px_rgba(20,35,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#a9cfba] hover:shadow-[0_18px_40px_rgba(20,35,28,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#92979c]">
                      {item.category}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      {item.product_name}
                    </h2>

                    <p className="mt-2 text-sm text-[#6f777d]">
                      {item.merchantName} · {item.city}
                    </p>
                  </div>

                  <span
  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
    item.is_available
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700"
  }`}
>
  <span
    className={`relative flex h-2 w-2 ${
      item.is_available ? "" : "opacity-80"
    }`}
  >
    {item.is_available && (
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
    )}

    <span
      className={`relative inline-flex h-2 w-2 rounded-full ${
        item.is_available
          ? "bg-emerald-500"
          : "bg-rose-500"
      }`}
    />
  </span>

  {item.is_available
    ? "Available"
    : "Unavailable"}
</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

  {/* Capacity */}
  <div className="rounded-[18px] border border-[#d8e7df] bg-[#f4faf6] px-4 py-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74837b]">
      Capacity
    </p>

    <p className="mt-2 text-sm font-semibold text-[#14231c]">
      {Number(item.available_capacity).toLocaleString("en-IN")} {item.unit}
    </p>
  </div>


  {/* Price */}
  <div className="rounded-[18px] border border-[#cfe3d8] bg-[#edf7f1] px-4 py-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#687e72]">
      Price
    </p>

    <p className="mt-2 text-sm font-semibold text-[#14231c]">
      ₹{item.price_per_unit}/{item.unit}
    </p>
  </div>


  {/* Ready */}
  <div className="rounded-[18px] border border-[#dce7e1] bg-white/80 px-4 py-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74837b]">
      Ready In
    </p>

    <p className="mt-2 text-sm font-semibold text-[#14231c]">
      {item.ready_hours} hrs
    </p>
  </div>


  {/* Reliability */}
  <div className="rounded-[18px] border border-[#d5e4dc] bg-[#f5f8f6] px-4 py-3.5">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74837b]">
        Reliability
      </p>

      <span className="h-2 w-2 rounded-full bg-emerald-500" />
    </div>

    <p className="mt-2 text-sm font-semibold text-[#14231c]">
      {item.reliability}%
    </p>
  </div>

</div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#dce8e1] bg-white/70 px-4 py-3">

  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b8981]">
      Minimum Order
    </p>

    <p className="mt-1 text-sm font-semibold text-[#14231c]">
      {item.min_order_quantity} {item.unit}
    </p>
  </div>

  <div className="flex items-center gap-2 rounded-full bg-[#eef7f2] px-3 py-1.5 text-[10px] font-medium text-[#4f7965]">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    Fulfilment Ready
  </div>

</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}