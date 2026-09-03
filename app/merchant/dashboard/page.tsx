"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

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

export default function MerchantDashboardPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] =
    useState<number | null>(null);

  const [capabilities, setCapabilities] = useState<Capability[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // New capability form
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [unit, setUnit] = useState("pieces");
  const [price, setPrice] = useState(100);
  const [readyHours, setReadyHours] = useState(24);
  const [minimumOrder, setMinimumOrder] = useState(1);

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    if (selectedMerchantId) {
      loadCapabilities(selectedMerchantId);
    }
  }, [selectedMerchantId]);

  async function loadMerchants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("merchants")
      .select("id, name, city, reliability, status")
      .order("name");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const merchantList = (data || []) as Merchant[];

    setMerchants(merchantList);

    if (merchantList.length > 0) {
      setSelectedMerchantId(merchantList[0].id);
    }

    setLoading(false);
  }

  async function loadCapabilities(merchantId: number) {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("merchant_capabilities")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("product_name");

    if (error) {
      setError(error.message);
    } else {
      setCapabilities((data || []) as Capability[]);
    }

    setLoading(false);
  }

  async function updateCapacity(
    capabilityId: number,
    newCapacity: number
  ) {
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("merchant_capabilities")
      .update({
        available_capacity: Math.max(newCapacity, 0),
      })
      .eq("id", capabilityId);

    if (error) {
      setError(error.message);
      return;
    }

    setCapabilities((current) =>
      current.map((capability) =>
        capability.id === capabilityId
          ? {
              ...capability,
              available_capacity: Math.max(newCapacity, 0),
            }
          : capability
      )
    );

    setMessage("Capacity updated successfully.");
  }

  async function toggleAvailability(capability: Capability) {
    setMessage("");
    setError("");

    const newStatus = !capability.is_available;

    const { error } = await supabase
      .from("merchant_capabilities")
      .update({
        is_available: newStatus,
      })
      .eq("id", capability.id);

    if (error) {
      setError(error.message);
      return;
    }

    setCapabilities((current) =>
      current.map((item) =>
        item.id === capability.id
          ? {
              ...item,
              is_available: newStatus,
            }
          : item
      )
    );

    setMessage(
      newStatus
        ? `${capability.product_name} is now available.`
        : `${capability.product_name} is now unavailable.`
    );
  }

  async function handleAddCapability(e: FormEvent) {
    e.preventDefault();

    if (!selectedMerchantId) return;

    setMessage("");
    setError("");

    const { error } = await supabase
      .from("merchant_capabilities")
      .insert({
        merchant_id: selectedMerchantId,
        category,
        product_name: productName,
        available_capacity: capacity,
        unit,
        price_per_unit: price,
        ready_hours: readyHours,
        min_order_quantity: minimumOrder,
        is_available: true,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("New capability added to OverMesh network.");

    setCategory("");
    setProductName("");
    setCapacity(100);
    setUnit("pieces");
    setPrice(100);
    setReadyHours(24);
    setMinimumOrder(1);

    await loadCapabilities(selectedMerchantId);
  }

  const selectedMerchant = merchants.find(
    (merchant) => merchant.id === selectedMerchantId
  );

  if (loading && merchants.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        Loading merchant dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Merchant Console
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Capacity Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Manage the capacity your business shares with the
            OverMesh fulfilment network.
          </p>
        </div>

        {/* Merchant selector */}
        <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
          <label className="text-xs font-medium text-[#727980]">
            Demo Merchant
          </label>

          <select
            value={selectedMerchantId || ""}
            onChange={(e) =>
              setSelectedMerchantId(Number(e.target.value))
            }
            className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm md:w-96"
          >
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name} — {merchant.city}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-[#92979c]">
            Demo mode: authentication will later identify the merchant
            automatically.
          </p>
        </div>

        {selectedMerchant && (
          <>
            {/* Merchant summary */}
            <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-[#fbfdfc] p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
                    Active Merchant
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {selectedMerchant.name}
                  </h2>

                  <p className="mt-1 text-sm text-[#858b91]">
                    {selectedMerchant.city}
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs">
                    Reliability {selectedMerchant.reliability}%
                  </span>

                  <span className="rounded-full bg-[#e8f5ed] px-3 py-1.5 text-xs font-medium text-[#34745a]">
                    {selectedMerchant.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="mt-5 rounded-lg border border-[#cfe4d7] bg-[#f4faf6] p-4 text-sm text-[#34745a]">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Existing capabilities */}
            <div className="mt-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                  Live Capabilities
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Your shared capacity
                </h2>

                <p className="mt-1 text-sm text-[#858b91]">
                  These values directly affect OverMesh coalition
                  matching.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {capabilities.length === 0 ? (
                  <div className="rounded-xl border bg-white p-6">
                    No capabilities added yet.
                  </div>
                ) : (
                  capabilities.map((capability) => (
                    <div
                      key={capability.id}
                      className="rounded-xl border border-[#e2e5e7] bg-white p-6"
                    >
                      <div className="flex flex-col justify-between gap-5 md:flex-row">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {capability.product_name}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                capability.is_available
                                  ? "bg-[#edf7f1] text-[#34745a]"
                                  : "bg-[#fff0f0] text-[#a34747]"
                              }`}
                            >
                              {capability.is_available
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-[#858b91]">
                            {capability.category}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            toggleAvailability(capability)
                          }
                          className={`h-fit rounded-lg border px-4 py-2 text-sm font-medium ${
                            capability.is_available
                              ? "border-[#e4caca] text-[#9a4747]"
                              : "border-[#cfe4d7] text-[#34745a]"
                          }`}
                        >
                          {capability.is_available
                            ? "Mark Unavailable"
                            : "Make Available"}
                        </button>
                      </div>

                      <div className="mt-6 grid gap-5 md:grid-cols-5">

                        {/* Editable capacity */}
                        <div>
                          <p className="text-xs text-[#92979c]">
                            Available Capacity
                          </p>

                          <input
                            type="number"
                            min="0"
                            value={
                              capability.available_capacity
                            }
                            onChange={(e) => {
                              const value = Number(
                                e.target.value
                              );

                              setCapabilities((current) =>
                                current.map((item) =>
                                  item.id === capability.id
                                    ? {
                                        ...item,
                                        available_capacity:
                                          value,
                                      }
                                    : item
                                )
                              );
                            }}
                            className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-3 py-2 text-sm"
                          />

                          <button
                            onClick={() =>
                              updateCapacity(
                                capability.id,
                                capability.available_capacity
                              )
                            }
                            className="mt-2 text-xs font-semibold text-[#34745a]"
                          >
                            Save Capacity
                          </button>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Unit
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            {capability.unit}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Price
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            ₹{capability.price_per_unit}/
                            {capability.unit}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Ready Within
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            {capability.ready_hours} hrs
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92979c]">
                            Minimum Order
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            {capability.min_order_quantity}{" "}
                            {capability.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add capability */}
            <form
              onSubmit={handleAddCapability}
              className="mt-8 rounded-xl border border-[#e2e5e7] bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                Network Expansion
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Add another capability
              </h2>

              <p className="mt-1 text-sm text-[#858b91]">
                Example: a bakery can add Cakes in addition to
                Cupcakes.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div>
                  <label className="text-xs font-medium">
                    Category
                  </label>

                  <input
                    required
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    placeholder="Bakery"
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Product / Service
                  </label>

                  <input
                    required
                    value={productName}
                    onChange={(e) =>
                      setProductName(e.target.value)
                    }
                    placeholder="Cakes"
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Available Capacity
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) =>
                      setCapacity(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Unit
                  </label>

                  <select
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm"
                  >
                    <option value="pieces">pieces</option>
                    <option value="boxes">boxes</option>
                    <option value="kg">kg</option>
                    <option value="sets">sets</option>
                    <option value="hours">hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Price per Unit
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Ready Within (hours)
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={readyHours}
                    onChange={(e) =>
                      setReadyHours(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Minimum Order
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={minimumOrder}
                    onChange={(e) =>
                      setMinimumOrder(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 rounded-lg bg-[#17201c] px-6 py-3 text-sm font-medium text-white"
              >
                Add Capability
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}