"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function MerchantRegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");

  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");

  const [capacity, setCapacity] = useState(100);
  const [unit, setUnit] = useState("pieces");

  const [price, setPrice] = useState(100);
  const [readyHours, setReadyHours] = useState(24);
  const [minimumOrder, setMinimumOrder] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      // 1. Create merchant
      const { data: merchant, error: merchantError } =
        await supabase
          .from("merchants")
          .insert({
            name: businessName,
            city: city,

            // These old columns still exist in our merchants table.
            // Capability-specific values will mainly live in
            // merchant_capabilities.
            category: category,
            capacity: capacity,
            price_per_unit: price,
            ready_hours: readyHours,

            reliability: 90,
            status: "Available",
          })
          .select("id")
          .single();

      if (merchantError) {
        throw merchantError;
      }

      // 2. Add merchant capability
      const { error: capabilityError } =
        await supabase
          .from("merchant_capabilities")
          .insert({
            merchant_id: merchant.id,
            category: category,
            product_name: productName,

            available_capacity: capacity,
            unit: unit,
            price_per_unit: price,

            ready_hours: readyHours,
            min_order_quantity: minimumOrder,

            is_available: true,
          });

      if (capabilityError) {
        throw capabilityError;
      }

      setSuccess(
        `${businessName} has joined the OverMesh network successfully.`
      );

      setBusinessName("");
      setCity("");
      setCategory("");
      setProductName("");

      setCapacity(100);
      setUnit("pieces");
      setPrice(100);
      setReadyHours(24);
      setMinimumOrder(1);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Merchant Network
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Join OverMesh
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Share your spare production or fulfilment capacity and
            receive orders that match what your business can provide.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#e2e5e7] bg-white p-6"
        >
          {/* Business */}
          <div>
            <h2 className="text-lg font-semibold">
              Business Information
            </h2>

            <p className="mt-1 text-sm text-[#858b91]">
              Tell us about your business.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#727980]">
                  Business Name
                </label>

                <input
                  required
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(e.target.value)
                  }
                  placeholder="e.g. Bhopal Bake Studio"
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
                  City
                </label>

                <input
                  required
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="e.g. Bhopal"
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Capability */}
          <div className="mt-8 border-t border-[#eceeef] pt-7">
            <h2 className="text-lg font-semibold">
              What can you fulfil?
            </h2>

            <p className="mt-1 text-sm text-[#858b91]">
              Add your first capability to the OverMesh network.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#727980]">
                  Category
                </label>

                <input
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  placeholder="e.g. Bakery, Printing, Packaging"
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
                  Product / Service
                </label>

                <input
                  required
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  placeholder="e.g. Cupcakes"
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
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
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
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
                <label className="text-xs font-medium text-[#727980]">
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
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
                  Ready Within
                </label>

                <div className="mt-2 flex items-center">
                  <input
                    required
                    type="number"
                    min="1"
                    value={readyHours}
                    onChange={(e) =>
                      setReadyHours(Number(e.target.value))
                    }
                    className="w-full rounded-l-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                  />

                  <span className="rounded-r-lg border border-l-0 border-[#dfe2e4] bg-[#f7f8f8] px-4 py-3 text-sm text-[#747b81]">
                    hrs
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#727980]">
                  Minimum Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={minimumOrder}
                  onChange={(e) =>
                    setMinimumOrder(Number(e.target.value))
                  }
                  className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 rounded-xl bg-[#f5f8f6] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
              Network Listing Preview
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {businessName || "Your Business"}
            </h3>

            <p className="mt-1 text-sm text-[#777e83]">
              {city || "City"} ·{" "}
              {category || "Category"}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[#92979c]">
                  Capability
                </p>

                <p className="mt-1 text-sm font-medium">
                  {productName || "Product"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#92979c]">
                  Capacity
                </p>

                <p className="mt-1 text-sm font-medium">
                  {capacity} {unit}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#92979c]">
                  Price
                </p>

                <p className="mt-1 text-sm font-medium">
                  ₹{price}/{unit}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#92979c]">
                  Ready
                </p>

                <p className="mt-1 text-sm font-medium">
                  {readyHours} hrs
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="mt-6 rounded-lg border border-[#cfe4d7] bg-[#f4faf6] p-4 text-sm text-[#34745a]">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#17201c] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Joining Network..."
                : "Join OverMesh Network"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}