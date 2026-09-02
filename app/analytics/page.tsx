const metrics = [
  {
    label: "Revenue Unlocked",
    value: "₹4.82L",
    note: "From orders that exceeded your own capacity",
    highlight: true,
  },
  {
    label: "Orders Saved",
    value: "23",
    note: "Orders completed using network capacity",
  },
  {
    label: "Capacity Borrowed",
    value: "3,420",
    suffix: "units",
    note: "From verified fulfilment partners",
  },
  {
    label: "Recoveries Completed",
    value: "7",
    note: "Partner failures recovered automatically",
  },
];

const orders = [
  {
    id: "OM-2048",
    product: "Custom Cotton T-Shirts",
    ownCapacity: 1200,
    borrowed: 300,
    revenue: "₹76,500",
    partners: 3,
    status: "Active",
  },
  {
    id: "OM-2045",
    product: "Printed Hoodies",
    ownCapacity: 150,
    borrowed: 90,
    revenue: "₹1,08,400",
    partners: 2,
    status: "Completed",
  },
  {
    id: "OM-2041",
    product: "Corporate Polo Shirts",
    ownCapacity: 230,
    borrowed: 120,
    revenue: "₹84,000",
    partners: 2,
    status: "Completed",
  },
  {
    id: "OM-2038",
    product: "Event Merchandise",
    ownCapacity: 400,
    borrowed: 180,
    revenue: "₹92,600",
    partners: 3,
    status: "Recovered",
  },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Business Impact
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            OverMesh Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            See how much revenue your business retained by using shared merchant
            capacity instead of rejecting large orders.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-xl border p-5 ${
                metric.highlight
                  ? "border-[#bfd9c9] bg-[#f3faf6]"
                  : "border-[#e2e5e7] bg-white"
              }`}
            >
              <p className="text-sm text-[#737a81]">{metric.label}</p>

              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-semibold tracking-tight">
                  {metric.value}
                </p>

                {metric.suffix && (
                  <span className="text-sm text-[#858b91]">
                    {metric.suffix}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs leading-5 text-[#8d9398]">
                {metric.note}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue impact */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-6 lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold">Revenue Impact</h2>

              <p className="mt-1 text-sm text-[#858b91]">
                Revenue generated from orders that could not be fulfilled using
                your own capacity alone.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#8d9398]">This month</p>
                  <p className="mt-1 text-4xl font-semibold">₹4,82,650</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#8d9398]">
                    Without OverMesh
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#a44d4d]">
                    ₹0
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-[#f4f7f5] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#668071]">
                  Revenue unlocked
                </p>

                <p className="mt-2 text-sm leading-6 text-[#60686d]">
                  These orders were larger than your available capacity and
                  would otherwise have been rejected or delayed.
                </p>
              </div>
            </div>
          </div>

          {/* Network efficiency */}
          <div className="rounded-xl border border-[#e2e5e7] bg-white p-6">
            <h2 className="text-lg font-semibold">Network Efficiency</h2>

            <p className="mt-1 text-sm text-[#858b91]">
              How effectively OverMesh is using partner capacity.
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#747b81]">
                    Coalition success rate
                  </span>
                  <span className="font-semibold">94%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-[#edf0ee]">
                  <div className="h-full w-[94%] rounded-full bg-[#37815f]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#747b81]">
                    Recovery success rate
                  </span>
                  <span className="font-semibold">87%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-[#edf0ee]">
                  <div className="h-full w-[87%] rounded-full bg-[#37815f]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#747b81]">
                    Partner reliability
                  </span>
                  <span className="font-semibold">96%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-[#edf0ee]">
                  <div className="h-full w-[96%] rounded-full bg-[#37815f]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white">
          <div className="border-b border-[#eceeef] px-6 py-5">
            <h2 className="text-lg font-semibold">Revenue-Saved Orders</h2>

            <p className="mt-1 text-sm text-[#858b91]">
              Orders completed through borrowed merchant capacity.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-[#eceeef] bg-[#fafafa] text-xs text-[#8e9499]">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Requirement</th>
                  <th className="px-6 py-4 font-medium">Own Capacity</th>
                  <th className="px-6 py-4 font-medium">Borrowed</th>
                  <th className="px-6 py-4 font-medium">Partners</th>
                  <th className="px-6 py-4 font-medium">Revenue</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#f0f1f2] last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {order.id}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#5f666c]">
                      {order.product}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {order.ownCapacity} units
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {order.borrowed} units
                    </td>

                    <td className="px-6 py-4 text-sm">{order.partners}</td>

                    <td className="px-6 py-4 text-sm font-semibold">
                      {order.revenue}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          order.status === "Recovered"
                            ? "bg-[#fff6df] text-[#8b6a21]"
                            : order.status === "Active"
                              ? "bg-[#eef4ff] text-[#47649a]"
                              : "bg-[#edf7f1] text-[#34745a]"
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

        {/* Impact message */}
        <div className="mt-6 rounded-xl border border-[#d5e4db] bg-[#f8fcf9] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            OverMesh Impact
          </p>

          <p className="mt-2 max-w-4xl text-lg font-semibold leading-7">
            23 orders that your business could not fulfil independently were
            completed using shared merchant capacity, unlocking ₹4.82 lakh in
            additional revenue.
          </p>
        </div>
      </div>
    </main>
  );
}