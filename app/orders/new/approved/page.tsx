"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
declare global {
  interface Window {
    Razorpay: any;
  }
}
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
  databaseOrderId?: number;
orderReference?: string;
  unit: string;

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

export default function ApprovedCoalitionPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
const [isPaying, setIsPaying] = useState(false);
const [paymentMessage, setPaymentMessage] = useState("");
  useEffect(() => {
    const savedOrder = localStorage.getItem("overmeshCurrentOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);
async function handleRazorpayPayment() {
  if (!order) return;

  setIsPaying(true);
  setPaymentMessage("");

  try {
    // Load Razorpay Checkout script
    const existingScript = document.getElementById(
      "razorpay-checkout-script"
    );

    if (!existingScript) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");

        script.id = "razorpay-checkout-script";
        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve();
        script.onerror = () =>
          reject(
            new Error("Razorpay Checkout could not load.")
          );

        document.body.appendChild(script);
      });
    }

    // Create Razorpay Order on our server
    const response = await fetch(
      "/api/razorpay/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: order.estimatedNetworkCost,
          orderReference:
            order.orderReference || "OverMesh Demo",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Could not create payment order."
      );
    }

    const options = {
      key: result.keyId,

      amount: result.razorpayOrder.amount,

      currency: result.razorpayOrder.currency,

      name: "OverMesh AI",

      description: `${order.product} fulfilment`,

      order_id: result.razorpayOrder.id,

      handler: async function (paymentResponse: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  setPaymentMessage("Verifying payment...");

  try {
    const verifyResponse = await fetch(
      "/api/razorpay/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id:
            paymentResponse.razorpay_order_id,

          razorpay_payment_id:
            paymentResponse.razorpay_payment_id,

          razorpay_signature:
            paymentResponse.razorpay_signature,

            databaseOrderId: order.databaseOrderId,
        }),
      }
    );

    const verification =
      await verifyResponse.json();

    if (
      !verifyResponse.ok ||
      !verification.success
    ) {
      throw new Error(
        verification.error ||
          "Payment verification failed."
      );
    }

    setPaymentMessage(
      `✅ Payment Verified · ID: ${paymentResponse.razorpay_payment_id}`
    );
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    setPaymentMessage(
      "❌ Payment received but verification failed."
    );
  } finally {
    setIsPaying(false);
  }
},

      notes: {
        overmesh_order:
          order.orderReference || "demo-order",
      },

      theme: {
        color: "#17201c",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function () {
        setPaymentMessage(
          "Test payment failed. You can try again."
        );

        setIsPaying(false);
      }
    );

    razorpay.open();
  } catch (error) {
    console.error(error);

    setPaymentMessage(
      "Razorpay checkout could not be started."
    );

    setIsPaying(false);
  }
}
  if (!order) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] p-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8">
          Loading approved coalition...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Success Banner */}
        <div className="rounded-xl border border-[#cfe4d7] bg-[#f4faf6] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f7863]">
            Coalition Approved
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Your fulfilment capacity is secured
          </h1>
         {order.orderReference && (
  <p className="mt-3 text-sm font-semibold text-[#34745a]">
    Order ID: {order.orderReference}
  </p>
)}
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f7772]">
            OverMesh has allocated the required capacity for{" "}
            <span className="font-medium">{order.product}</span>{" "}
            across {order.selectedPartners.length} merchant
            {order.selectedPartners.length === 1 ? "" : "s"}.
          </p>

          <div className="mt-5 inline-flex rounded-full bg-[#e6f4eb] px-4 py-2 text-sm font-medium text-[#34745a]">
            100% Capacity Secured
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Requirement
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.requestedQuantity.toLocaleString("en-IN")}{" "}
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
              Merchant Partners
            </p>

            <p className="mt-3 text-xl font-semibold">
              {order.selectedPartners.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e5e7] bg-white p-5">
            <p className="text-xs text-[#8b9197]">
              Network Cost
            </p>

            <p className="mt-3 text-xl font-semibold">
              ₹
              {order.estimatedNetworkCost.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#718078]">
            Fulfilment Requirement
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {order.product}
              </h2>

              <p className="mt-1 text-sm text-[#858b91]">
                {order.category} · Required within{" "}
                {order.deadlineHours} hours
              </p>

              {order.requirements && (
                <p className="mt-2 text-sm text-[#697076]">
                  {order.requirements}
                </p>
              )}
            </div>

            <span className="w-fit rounded-full bg-[#f2f5f3] px-3 py-1.5 text-xs text-[#59615d]">
              {order.requestedQuantity.toLocaleString("en-IN")}{" "}
              {order.unit}
            </span>
          </div>
        </div>

        {/* Capacity Secured */}
        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold">
                Capacity Secured
              </p>

              <p className="mt-1 text-xs text-[#8c9297]">
                Required fulfilment capacity has been allocated.
              </p>
            </div>

            <p className="text-2xl font-semibold">
              100%
            </p>
          </div>

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#edf0ee]">
            <div className="h-full w-full rounded-full bg-[#2f7d5c]" />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[#8b9197]">
            <span>
              Required:{" "}
              {order.requestedQuantity.toLocaleString("en-IN")}{" "}
              {order.unit}
            </span>

            <span>
              Secured:{" "}
              {(
                order.ownCapacity + order.securedCapacity
              ).toLocaleString("en-IN")}{" "}
              {order.unit}
            </span>
          </div>
        </div>

        {/* Existing Capacity */}
        {order.ownCapacity > 0 && (
          <div className="mt-6 rounded-xl border border-[#dbe5df] bg-white p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">
                  Your existing capacity
                </p>

                <p className="mt-1 text-xs text-[#92979c]">
                  Capacity contributed before using the OverMesh network
                </p>
              </div>

              <span className="text-sm font-semibold">
                {order.ownCapacity.toLocaleString("en-IN")}{" "}
                {order.unit}
              </span>
            </div>
          </div>
        )}

        {/* Coalition Members */}
        <div className="mt-7">
          <h2 className="text-lg font-semibold">
            Active Coalition
          </h2>

          <p className="mt-1 text-sm text-[#858b91]">
            Merchants currently allocated to this fulfilment plan.
          </p>

          <div className="mt-4 space-y-3">
            {order.selectedPartners.map((partner) => (
              <div
                key={partner.capabilityId}
                className="rounded-xl border border-[#e2e5e7] bg-white p-5"
              >
                <div className="grid gap-5 md:grid-cols-6 md:items-center">

                  <div className="md:col-span-2">
                    <p className="font-semibold">
                      {partner.name}
                    </p>

                    <p className="mt-1 text-xs text-[#92979c]">
                      {partner.city} · {partner.productName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#92979c]">
                      Assigned
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {partner.assigned} {partner.unit}
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

                  <div>
                    <p className="text-xs text-[#92979c]">
                      Status
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-[#edf7f1] px-2.5 py-1 text-xs font-medium text-[#34745a]">
                      Allocated
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Fulfilment Summary
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-4">

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
                Budget
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
                ₹
                {(
                  order.maxNetworkBudget -
                  order.estimatedNetworkCost
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#92979c]">
                Deadline
              </p>

              <p className="mt-1 text-lg font-semibold">
                {order.deadlineHours} hrs
              </p>
            </div>
          </div>
        </div>

        {/* Demo Recovery */}
        <div className="mt-6 rounded-xl border border-[#ead9b5] bg-[#fffaf0] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8b6b27]">
  Resilience Demo
</p>
           <div className="mt-6 rounded-xl border border-[#d7e5dc] bg-white p-6">
  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
    Payment
  </p>

  <h2 className="mt-2 text-xl font-semibold">
    Secure fulfilment with Razorpay
  </h2>

  <p className="mt-2 text-sm text-[#858b91]">
    Test Mode payment for{" "}
    {order.orderReference || "this order"}.
  </p>

  <div className="mt-5 flex flex-wrap items-center gap-4">
    <button
      type="button"
      onClick={handleRazorpayPayment}
      disabled={isPaying}
      className="rounded-lg bg-[#17201c] px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPaying
        ? "Opening Razorpay..."
        : `Pay ₹${order.estimatedNetworkCost.toLocaleString(
            "en-IN"
          )} with Razorpay`}
    </button>

    <span className="text-xs text-[#8b9197]">
      Test Mode · No real money
    </span>
  </div>

  {paymentMessage && (
    <p className="mt-4 text-sm text-[#34745a]">
      {paymentMessage}
    </p>
  )}
</div>
 <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8b6b27]">
  Resilience Demo
</p>

          <h2 className="mt-2 text-lg font-semibold">
            Test OverMesh self-healing
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77736a]">
            Simulate a fulfilment partner becoming unavailable and see
            whether OverMesh can rebuild the coalition using remaining
            merchant capacity.
          </p>

          <Link
            href="/orders/new/recovery"
            className="mt-5 inline-block rounded-lg border border-[#e2c98f] bg-white px-5 py-2.5 text-sm font-medium text-[#8b6b27]"
          >
            Simulate Merchant Disruption
          </Link>
        </div>

        {/* Bottom actions */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/"
            className="rounded-lg border border-[#d8dcda] bg-white px-5 py-2.5 text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}