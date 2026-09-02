const stats = [
  {
    label: "Own Capacity",
    value: "320",
    suffix: "units",
    note: "Available today",
  },
  {
    label: "Network Capacity",
    value: "1,850",
    suffix: "units",
    note: "Across 24 partners",
  },
  {
    label: "Orders Saved",
    value: "23",
    suffix: "",
    note: "This month",
  },
  {
    label: "Revenue Unlocked",
    value: "₹4.82L",
    suffix: "",
    note: "From overflow orders",
    highlight: true,
  },
];

const orders = [
  {
    id: "OM-2048",
    product: "Custom Cotton T-Shirts",
    requested: "500",
    overflow: "300",
    value: "₹73,540",
    status: "Building Coalition",
  },
  {
    id: "OM-2045",
    product: "Printed Hoodies",
    requested: "240",
    overflow: "90",
    value: "₹1,08,400",
    status: "Fulfilled",
  },
  {
    id: "OM-2041",
    product: "Corporate Polo Shirts",
    requested: "350",
    overflow: "120",
    value: "₹84,000",
    status: "Coalition Active",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#17191c]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-[#e4e6e8] bg-white lg:flex">
          <div className="border-b border-[#eceeef] px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#18201d] text-sm font-semibold text-white">
                OM
              </div>

              <div>
                <h1 className="text-[15px] font-semibold tracking-tight">
                  OverMesh AI
                </h1>
                <p className="text-xs text-[#8b9198]">Capacity Network</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a1a6ac]">
              Workspace
            </p>

            <div className="space-y-1">
              {[
                "Overview",
                "Orders",
                "Capacity Network",
                "Coalitions",
                "Analytics",
              ].map((item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    index === 0
                      ? "bg-[#f0f3f1] font-medium text-[#18201d]"
                      : "text-[#5f666d] hover:bg-[#f7f8f8] hover:text-[#202428]"
                  }`}
                >
                  <span
                    className={`mr-3 h-2 w-2 rounded-full ${
                      index === 0 ? "bg-[#18794e]" : "bg-[#c7cbcf]"
                    }`}
                  />
                  {item}
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-[#eceeef] p-4">
            <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#5f666d] hover:bg-[#f7f8f8]">
              Settings
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-[72px] items-center justify-between border-b border-[#e4e6e8] bg-white px-6 lg:px-10">
            <div>
              <p className="text-sm font-medium">UrbanPrint</p>
              <p className="mt-0.5 text-xs text-[#8b9198]">Bhopal, India</p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#dce9e2] bg-[#f4fbf7] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1f9d67]" />
              <span className="text-xs font-medium text-[#276749]">
                Network Active
              </span>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
            {/* Page intro */}
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#858b91]">
                Overview
              </p>

              <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                Capacity Overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
                Monitor your production capacity and the additional capacity
                available across the OverMesh merchant network.
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border p-5 ${
                    stat.highlight
                      ? "border-[#cfe5d8] bg-[#f4faf6]"
                      : "border-[#e3e5e7] bg-white"
                  }`}
                >
                  <p className="text-sm text-[#737a81]">{stat.label}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </span>

                    {stat.suffix && (
                      <span className="text-sm text-[#858b91]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-xs ${
                      stat.highlight ? "text-[#287252]" : "text-[#9a9fa4]"
                    }`}
                  >
                    {stat.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Active order */}
            <div className="mt-6 rounded-xl border border-[#e3e5e7] bg-white p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#90969c]">
                      Active Overflow Order
                    </p>

                    <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-[11px] font-medium text-[#856404]">
                      Building Coalition
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold">
                    Custom Cotton T-Shirts
                  </h3>

                  <p className="mt-1 text-sm text-[#81878d]">
                    OM-2048 · Deadline in 48 hours
                  </p>
                </div>

                <button className="rounded-lg bg-[#18201d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#27312d]">
                  View Coalition
                </button>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-4">
                <div>
                  <p className="text-xs text-[#92979d]">Requested</p>
                  <p className="mt-1 text-sm font-semibold">500 units</p>
                </div>

                <div>
                  <p className="text-xs text-[#92979d]">Own Capacity</p>
                  <p className="mt-1 text-sm font-semibold">200 units</p>
                </div>

                <div>
                  <p className="text-xs text-[#92979d]">Overflow Needed</p>
                  <p className="mt-1 text-sm font-semibold">300 units</p>
                </div>

                <div>
                  <p className="text-xs text-[#92979d]">Budget</p>
                  <p className="mt-1 text-sm font-semibold">₹80,000</p>
                </div>
              </div>

              <div className="mt-7">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-[#747b82]">Capacity secured</span>
                  <span className="font-medium">460 / 500 units</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#edf0ee]">
                  <div className="h-full w-[92%] rounded-full bg-[#2f7d5c]" />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#83898f]">
                  <span>200 own capacity</span>
                  <span>260 network capacity</span>
                  <span className="font-medium text-[#9b6b19]">
                    40 units remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-6 rounded-xl border border-[#e3e5e7] bg-white">
              <div className="flex items-center justify-between border-b border-[#eceeef] px-6 py-5">
                <div>
                  <h3 className="text-sm font-semibold">Recent Orders</h3>
                  <p className="mt-1 text-xs text-[#92979d]">
                    Latest overflow activity across your business.
                  </p>
                </div>

                <button className="text-xs font-medium text-[#34745a]">
                  View all orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-[#eceeef] bg-[#fafafa] text-[11px] uppercase tracking-[0.08em] text-[#989da2]">
                      <th className="px-6 py-3 font-medium">Order</th>
                      <th className="px-6 py-3 font-medium">Requirement</th>
                      <th className="px-6 py-3 font-medium">Requested</th>
                      <th className="px-6 py-3 font-medium">Overflow</th>
                      <th className="px-6 py-3 font-medium">Value</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#f0f1f2] last:border-0"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          {order.id}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#5e656c]">
                          {order.product}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#5e656c]">
                          {order.requested}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#5e656c]">
                          {order.overflow}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          {order.value}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              order.status === "Fulfilled"
                                ? "bg-[#eff8f3] text-[#34745a]"
                                : order.status === "Coalition Active"
                                  ? "bg-[#eef4ff] text-[#3f5f99]"
                                  : "bg-[#fff7df] text-[#8a681d]"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}