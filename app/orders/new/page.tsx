"use client";
import { parseOrderIntent } from "../../../lib/intentParser";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

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

type NetworkOffer = {
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

type SelectedPartner = NetworkOffer & {
  assigned: number;
  partnerCost: number;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/t[\s-]?shirts?/g, "t shirt")
    .replace(/cupcakes?/g, "cupcake")
    .replace(/notebooks?/g, "notebook")
    .replace(/boxes?/g, "box")
    .replace(/mugs?/g, "mug")
    .replace(/hoodies?/g, "hoodie")
    .replace(/chairs?/g, "chair")
    .replace(/tables?/g, "table")
    .replace(/certificates?/g, "certificate")
    .replace(/kits?/g, "kit")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchScore(query: string, offer: NetworkOffer) {
  const q = normalizeText(query);

  if (!q) return 0;

  const product = normalizeText(offer.productName);
  const category = normalizeText(offer.category);

  if (q === product) return 100;
  if (product.includes(q) || q.includes(product)) return 80;

  const queryWords = q.split(" ").filter(Boolean);
  const productWords = product.split(" ").filter(Boolean);

  const productMatches = queryWords.filter((word) =>
    productWords.includes(word)
  ).length;

  if (productMatches > 0) {
    return 40 + productMatches * 10;
  }

  if (category.includes(q) || q.includes(category)) {
    return 25;
  }

  return 0;
}

function buildCoalition(
  offers: NetworkOffer[],
  requiredCapacity: number
): SelectedPartner[] {
  if (requiredCapacity <= 0) return [];

  const sorted = [...offers].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }

    if (a.reliability !== b.reliability) {
      return b.reliability - a.reliability;
    }

    return a.readyHours - b.readyHours;
  });

  let remaining = requiredCapacity;

  const selected: SelectedPartner[] = [];

  for (const merchant of sorted) {
    if (remaining <= 0) break;

    if (remaining < merchant.minOrderQuantity) {
      continue;
    }

    const assigned = Math.min(
      merchant.capacity,
      remaining
    );

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
const [smartRequirement, setSmartRequirement] = useState("");
const [expandLocationSearch, setExpandLocationSearch] = useState(false);
const [detectedCity, setDetectedCity] = useState("");
const [parserMessage, setParserMessage] = useState("");
  const [network, setNetwork] = useState<NetworkOffer[]>([]);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [networkError, setNetworkError] = useState("");
const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productNeed, setProductNeed] = useState("");
  const [requestedQuantity, setRequestedQuantity] =
    useState(500);

  const [existingCapacity, setExistingCapacity] =
    useState(0);

  const [maxNetworkBudget, setMaxNetworkBudget] =
    useState(50000);

  const [deadlineHours, setDeadlineHours] =
    useState(48);

  const [requirements, setRequirements] =
    useState("");

  useEffect(() => {
    async function loadNetwork() {
      setLoadingNetwork(true);
      setNetworkError("");

      const {
        data: capabilities,
        error: capabilityError,
      } = await supabase
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
        .eq("is_available", true);

      if (capabilityError) {
        setNetworkError(capabilityError.message);
        setLoadingNetwork(false);
        return;
      }

      const {
        data: merchants,
        error: merchantError,
      } = await supabase
        .from("merchants")
        .select(
          "id, name, city, reliability, status"
        )
        .eq("status", "Available");

      if (merchantError) {
        setNetworkError(merchantError.message);
        setLoadingNetwork(false);
        return;
      }

      const merchantMap = new Map<number, MerchantRow>();

      (merchants || []).forEach((merchant) => {
        merchantMap.set(
          Number(merchant.id),
          merchant as MerchantRow
        );
      });

      const merged: NetworkOffer[] = (
        (capabilities || []) as CapabilityRow[]
      )
        .map((capability) => {
          const merchant = merchantMap.get(
            Number(capability.merchant_id)
          );

          if (!merchant) return null;

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
          (item): item is NetworkOffer =>
            item !== null
        );

      setNetwork(merged);
      setLoadingNetwork(false);
    }

    loadNetwork();
  }, []);

  const availableProducts = useMemo(() => {
    return Array.from(
      new Set(
        network.map((offer) => offer.productName)
      )
    ).sort();
  }, [network]);

  const productDetection = useMemo(() => {
    if (!productNeed.trim()) {
      return null;
    }

    const scored = network
      .map((offer) => ({
        offer,
        score: getMatchScore(
          productNeed,
          offer
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return null;
    }

    return scored[0].offer;
  }, [network, productNeed]);

  const matchingOffers = useMemo(() => {
  if (!productDetection) return [];

  const productKey = normalizeText(
    productDetection.productName
  );

  const requestedCity = detectedCity
    .trim()
    .toLowerCase();

  return network.filter((offer) => {
    const productMatches =
      normalizeText(offer.productName) === productKey;

    const deadlineMatches =
      offer.readyHours <= deadlineHours;

    const hasCapacity =
      offer.capacity > 0;

    const cityMatches =
  expandLocationSearch ||
  !requestedCity ||
  offer.city.trim().toLowerCase() === requestedCity;
    return (
      productMatches &&
      deadlineMatches &&
      hasCapacity &&
      cityMatches
    );
  });
}, [
  network,
  productDetection,
  deadlineHours,
  detectedCity,
  expandLocationSearch,
]);

  const overflowNeeded = Math.max(
    requestedQuantity - existingCapacity,
    0
  );

  const selectedPartners = useMemo(
    () =>
      buildCoalition(
        matchingOffers,
        overflowNeeded
      ),
    [matchingOffers, overflowNeeded]
  );

  const securedCapacity =
    selectedPartners.reduce(
      (total, merchant) =>
        total + merchant.assigned,
      0
    );

  const remainingCapacity = Math.max(
    overflowNeeded - securedCapacity,
    0
  );

  const estimatedNetworkCost =
    selectedPartners.reduce(
      (total, merchant) =>
        total + merchant.partnerCost,
      0
    );

  const eligibleNetworkCapacity =
    matchingOffers.reduce(
      (total, merchant) =>
        total + merchant.capacity,
      0
    );

  const fullCapacitySecured =
    overflowNeeded > 0 &&
    remainingCapacity === 0;

  const withinBudget =
    estimatedNetworkCost <= maxNetworkBudget;

  const canReview =
    !!productDetection &&
    fullCapacitySecured &&
    withinBudget;

  const detectedUnit =
    productDetection?.unit || "pieces";
async function handleAnalyzeRequirement() {
  if (!smartRequirement.trim()) {
    setParserMessage("Please describe your requirement first.");
    return;
  }
setExpandLocationSearch(false);
  setIsAnalyzing(true);
  setParserMessage("AI is analyzing your requirement...");

  try {
    const response = await fetch("/api/parse-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirement: smartRequirement,
      }),
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const result = await response.json();
    const parsed = result.data;

    if (parsed.product) {
      setProductNeed(parsed.product);
    }

    if (parsed.quantity !== null) {
      setRequestedQuantity(Number(parsed.quantity));
    }

    if (parsed.budget !== null) {
      setMaxNetworkBudget(Number(parsed.budget));
    }

    if (parsed.deadlineHours !== null) {
      setDeadlineHours(Number(parsed.deadlineHours));
    }

    if (parsed.city) {
      setDetectedCity(parsed.city);
    }

    if (parsed.additionalRequirements) {
      setRequirements(parsed.additionalRequirements);
    }

    setParserMessage(
      "✨ AI understood your requirement and updated the order."
    );
  } catch (error) {
    console.log("Gemini unavailable, using fallback parser.");

    const parsed = parseOrderIntent(smartRequirement);

    if (parsed.product) {
      setProductNeed(parsed.product);
    }

    if (parsed.quantity !== null) {
      setRequestedQuantity(parsed.quantity);
    }

    if (parsed.budget !== null) {
      setMaxNetworkBudget(parsed.budget);
    }

    if (parsed.deadlineHours !== null) {
      setDeadlineHours(parsed.deadlineHours);
    }

    if (parsed.city) {
      setDetectedCity(parsed.city);
    }

    setParserMessage(
      "Requirement analyzed using OverMesh fallback parser."
    );
  } finally {
    setIsAnalyzing(false);
  }
}
  function handleReviewCoalition() {
    if (!productDetection) return;

    const orderData = {
      product: productDetection.productName,
      category: productDetection.category,
      unit: detectedUnit,
city: detectedCity,
      requestedQuantity,
      ownCapacity: existingCapacity,

      overflowNeeded,
      maxNetworkBudget,
      deadlineHours,

      requirements,

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
  }

  if (loadingNetwork) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading OverMesh merchant network...
        </div>
      </main>
    );
  }

  if (networkError) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-white p-8">
          <h1 className="text-xl font-semibold">
            Could not load merchant network
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

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Fulfilment Request
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            What do you need to fulfil?
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Enter your requirement. OverMesh will search
            live merchant capabilities and build a
            suitable fulfilment coalition.
          </p>
        </div>
{/* Smart Requirement Parser */}
<div className="mb-6 rounded-xl border border-[#d7e5dc] bg-[#fbfdfc] p-6">
  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
    Smart Requirement
  </p>

  <h2 className="mt-2 text-xl font-semibold">
    Describe your order naturally
  </h2>

  <p className="mt-1 text-sm text-[#858b91]">
    Example: Need 900 cupcakes tomorrow under ₹30000 in Bhopal
  </p>

  <textarea
    value={smartRequirement}
    onChange={(e) => setSmartRequirement(e.target.value)}
    placeholder="Need 900 cupcakes tomorrow under ₹30000 in Bhopal"
    rows={3}
    className="mt-5 w-full resize-none rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm outline-none"
  />

  <div className="mt-4 flex flex-wrap items-center gap-3">
    <button
  type="button"
  onClick={handleAnalyzeRequirement}
  disabled={isAnalyzing}
  className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {isAnalyzing
    ? "Analyzing with AI..."
    : "Analyze Requirement ✨"}
</button>

    {detectedCity && (
      <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[#59615d]">
        Location: {detectedCity}
      </span>
    )}
  </div>

  {parserMessage && (
    <p className="mt-3 text-xs text-[#4f7863]">
      {parserMessage}
    </p>
  )}
</div>
        {/* Form */}
        <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
          <h2 className="text-lg font-semibold">
            Requirement
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* Product Need */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                What do you need?
              </label>

              <input
                type="text"
                value={productNeed}
                onChange={(e) =>
                  setProductNeed(e.target.value)
                }
                placeholder="e.g. Cupcakes, Printed Notebooks, Cardboard Boxes"
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none focus:border-[#9fb6aa]"
              />
            </div>

            {/* Quantity */}
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
                    Math.max(
                      Number(e.target.value),
                      0
                    )
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* Existing Capacity */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Existing Capacity
                <span className="ml-1 font-normal text-[#9a9fa4]">
                  (optional)
                </span>
              </label>

              <input
                type="number"
                min="0"
                value={existingCapacity}
                onChange={(e) =>
                  setExistingCapacity(
                    Math.max(
                      Number(e.target.value),
                      0
                    )
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
              />

              <p className="mt-1 text-xs text-[#9a9fa4]">
                Keep 0 for a direct buyer request.
              </p>
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Maximum Fulfilment Budget
              </label>

              <input
                type="number"
                min="0"
                value={maxNetworkBudget}
                onChange={(e) =>
                  setMaxNetworkBudget(
                    Math.max(
                      Number(e.target.value),
                      0
                    )
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
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
                  setDeadlineHours(
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] bg-white px-4 py-3 text-sm"
              >
                <option value={18}>
                  18 hours
                </option>

                <option value={24}>
                  24 hours
                </option>

                <option value={30}>
                  30 hours
                </option>

                <option value={36}>
                  36 hours
                </option>

                <option value={48}>
                  48 hours
                </option>

                <option value={72}>
                  72 hours
                </option>
              </select>
            </div>

            {/* Requirements */}
            <div>
              <label className="text-xs font-medium text-[#727980]">
                Additional Requirements
              </label>

              <input
                type="text"
                value={requirements}
                onChange={(e) =>
                  setRequirements(e.target.value)
                }
                placeholder="e.g. logo printing, eco-friendly packaging"
                className="mt-2 w-full rounded-lg border border-[#dfe2e4] px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Database products */}
          <div className="mt-6 border-t border-[#eceeef] pt-5">
            <p className="text-xs text-[#8b9197]">
              Products currently available in the
              OverMesh network
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {availableProducts.map((product) => (
                <button
                  key={product}
                  type="button"
                  onClick={() =>
                    setProductNeed(product)
                  }
                  className="rounded-full border border-[#dfe3e0] bg-[#fafbfa] px-3 py-1.5 text-xs text-[#59615d] hover:bg-[#f1f5f2]"
                >
                  {product}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detected product */}
        {productNeed.trim() !== "" && (
          <div className="mt-6">
            {productDetection ? (
              <div className="rounded-xl border border-[#cfe4d7] bg-[#f4faf6] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4f7863]">
                  Requirement Matched
                </p>

                <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {productDetection.productName}
                    </p>

                    <p className="mt-1 text-sm text-[#6f7772]">
                      Category:{" "}
                      {productDetection.category}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#34745a]">
                    Live database match
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-5">
                <p className="font-semibold">
                  No matching capability found
                </p>

                <p className="mt-2 text-sm text-[#77736a]">
                  No registered OverMesh merchant
                  currently offers this product.
                </p>
                {detectedCity && !expandLocationSearch && (
  <button
    type="button"
    onClick={() => setExpandLocationSearch(true)}
    className="mt-4 rounded-lg border border-[#d9c58f] bg-white px-4 py-2 text-sm font-medium"
  >
    Expand Search Across OverMesh Network
  </button>
)}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {productDetection && (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-4">

              <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
                <p className="text-xs text-[#8b9197]">
                  Required
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {requestedQuantity.toLocaleString(
                    "en-IN"
                  )}{" "}
                  {detectedUnit}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
                <p className="text-xs text-[#8b9197]">
                  Existing Capacity
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {existingCapacity.toLocaleString(
                    "en-IN"
                  )}{" "}
                  {detectedUnit}
                </p>
              </div>

              <div className="rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-5">
                <p className="text-xs text-[#8b9197]">
                  Capacity Needed
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {overflowNeeded.toLocaleString(
                    "en-IN"
                  )}{" "}
                  {detectedUnit}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
                <p className="text-xs text-[#8b9197]">
                  Matching Network Capacity
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {eligibleNetworkCapacity.toLocaleString(
                    "en-IN"
                  )}{" "}
                  {detectedUnit}
                </p>
              </div>
            </div>

            {/* Merchants */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
                Live Merchant Matching
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Selected fulfilment partners
              </h2>

              <p className="mt-1 text-sm text-[#858b91]">
                These merchants are being selected from
                your Supabase database.
              </p>

              {selectedPartners.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {selectedPartners.map(
                    (merchant, index) => (
                      <div
                        key={merchant.capabilityId}
                        className="rounded-xl border border-[#e2e5e7] bg-white p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {merchant.name}
                            </p>

                            <p className="mt-1 text-xs text-[#92979c]">
                              {merchant.city} ·{" "}
                              {merchant.category}
                            </p>
                          </div>

                          {index === 0 && (
                            <span className="rounded-full bg-[#edf7f1] px-2.5 py-1 text-[11px] font-medium text-[#34745a]">
                              Best Match
                            </span>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
                          <div>
                            <p className="text-xs text-[#92979c]">
                              Available
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {merchant.capacity}{" "}
                              {merchant.unit}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#92979c]">
                              Assigned
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#34745a]">
                              {merchant.assigned}{" "}
                              {merchant.unit}
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
                              Cost
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
                    )
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">
                  <p className="font-semibold">
  {detectedCity
    ? `No eligible merchant found in ${detectedCity}.`
    : "No eligible merchant found within this deadline."}
</p>
                </div>
              )}
            </div>

            {/* Coalition */}
            <div className="mt-6 rounded-xl border border-[#d6e4dc] bg-[#fbfdfc] p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
                    Recommended Coalition
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Database-backed merchant combination
                  </h2>
                </div>

                <span
                  className={`h-fit rounded-full px-3 py-1.5 text-xs font-medium ${
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
                    Required
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {overflowNeeded} {detectedUnit}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Secured
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {securedCapacity} {detectedUnit}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">
                    Still Required
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {remainingCapacity} {detectedUnit}
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
                    Cost
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    ₹
                    {estimatedNetworkCost.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              <div
                className={`mt-6 rounded-lg p-4 ${
                  withinBudget
                    ? "bg-[#f2f8f4]"
                    : "bg-[#fff4e8]"
                }`}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <span className="text-sm">
                    Budget: ₹
                    {maxNetworkBudget.toLocaleString(
                      "en-IN"
                    )}
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
                        ).toLocaleString(
                          "en-IN"
                        )} remaining`
                      : `₹${(
                          estimatedNetworkCost -
                          maxNetworkBudget
                        ).toLocaleString(
                          "en-IN"
                        )} over budget`}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-[#e5ebe7] pt-5">
                {canReview ? (
                  <button
                    onClick={
                      handleReviewCoalition
                    }
                    className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white"
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
                      : "Increase Budget"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}