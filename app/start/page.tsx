import Link from "next/link";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-12 text-[#17191c]">
      <div className="mx-auto max-w-6xl">

        {/* Brand */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587365]">
            OverMesh AI
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Don&apos;t reject the order.
            <br />
            Borrow the capacity.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#737a81] md:text-base">
            OverMesh is a B2B shared-capacity network where
            businesses can request additional fulfilment capacity
            or share their unused capacity with other businesses.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">

          {/* Requester */}
          <div className="rounded-2xl border border-[#d7e5dc] bg-white p-8">
            <div className="inline-flex rounded-full bg-[#edf7f1] px-3 py-1.5 text-xs font-semibold text-[#34745a]">
              REQUESTER BUSINESS
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              I Need Capacity
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#737a81]">
              Received an order your business cannot fulfil alone?
              Let OverMesh find spare capacity across compatible
              merchants and build a temporary coalition.
            </p>

            <div className="mt-6 space-y-3 text-sm text-[#59615d]">
              <p>✓ Describe requirement using AI</p>
              <p>✓ Find matching merchant capacity</p>
              <p>✓ Build fulfilment coalition</p>
              <p>✓ Pay securely with Razorpay</p>
              <p>✓ Self-heal if a partner fails</p>
            </div>

            <Link
              href="/orders/new"
              className="mt-8 inline-block rounded-lg bg-[#17201c] px-6 py-3 text-sm font-medium text-white"
            >
              Request Capacity →
            </Link>

            <div className="mt-4">
              <Link
                href="/orders"
                className="text-xs font-semibold text-[#587365]"
              >
                View existing orders
              </Link>
            </div>
          </div>

          {/* Partner */}
          <div className="rounded-2xl border border-[#e2e5e7] bg-white p-8">
            <div className="inline-flex rounded-full bg-[#f1f3f8] px-3 py-1.5 text-xs font-semibold text-[#58647a]">
              CAPACITY PARTNER
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              I Have Spare Capacity
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#737a81]">
              Have unused production or fulfilment capacity?
              Join the OverMesh network and become eligible for
              matching fulfilment opportunities.
            </p>

            <div className="mt-6 space-y-3 text-sm text-[#59615d]">
              <p>✓ Register your business</p>
              <p>✓ List products and capabilities</p>
              <p>✓ Set available capacity</p>
              <p>✓ Control availability</p>
              <p>✓ Join matching coalitions</p>
            </div>

            <Link
              href="/merchant/register"
              className="mt-8 inline-block rounded-lg bg-[#17201c] px-6 py-3 text-sm font-medium text-white"
            >
              Join Capacity Network →
            </Link>

            <div className="mt-4">
              <Link
                href="/merchant/dashboard"
                className="text-xs font-semibold text-[#587365]"
              >
                Already registered? Open Merchant Console
              </Link>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 rounded-2xl border border-[#e2e5e7] bg-[#fbfdfc] p-7 text-center">
          <p className="text-sm font-semibold">
            One business. Two possible roles.
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#7b8287]">
            A business can request capacity when overloaded and
            share capacity when it has spare resources. OverMesh
            connects both sides through one intelligent network.
          </p>
        </div>

        {/* Existing admin/network dashboard */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-[#587365]"
          >
            Open Network Command Center →
          </Link>
        </div>
      </div>
    </main>
  );
}