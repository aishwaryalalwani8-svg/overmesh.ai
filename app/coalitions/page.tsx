const coalitions = [
  {
    id: "OM-2048",
    product: "Custom Cotton T-Shirts",
    partners: 3,
    borrowed: 300,
    value: "₹76,500",
    deadline: "48 hrs",
    status: "Active",
  },
  {
    id: "OM-2045",
    product: "Printed Hoodies",
    partners: 2,
    borrowed: 90,
    value: "₹1,08,400",
    deadline: "Completed",
    status: "Completed",
  },
  {
    id: "OM-2041",
    product: "Corporate Polo Shirts",
    partners: 2,
    borrowed: 120,
    value: "₹84,000",
    deadline: "Completed",
    status: "Completed",
  },
  {
    id: "OM-2038",
    product: "Event Merchandise",
    partners: 3,
    borrowed: 180,
    value: "₹92,600",
    deadline: "32 hrs",
    status: "Recovered",
  },
];

export default function CoalitionsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
            Merchant Teams
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Coalitions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
            Track temporary merchant teams created to fulfil orders beyond your
            own capacity.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Active Coalitions", "6"],
            ["Completed", "31"],
            ["Recoveries", "7"],
            ["Capacity Borrowed", "3,420 units"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[#e2e5e7] bg-white p-5"
            >
              <p className="text-xs text-[#8b9197]">{label}</p>
              <p className="mt-3 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#e2e5e7] bg-white">
          <div className="border-b border-[#eceeef] px-6 py-5">
            <h2 className="text-lg font-semibold">All Coalitions</h2>
            <p className="mt-1 text-sm text-[#858b91]">
              Current and historical shared-capacity fulfilment groups.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-[#eceeef] bg-[#fafafa] text-xs text-[#8e9499]">
                  <th className="px-6 py-4 font-medium">Coalition</th>
                  <th className="px-6 py-4 font-medium">Requirement</th>
                  <th className="px-6 py-4 font-medium">Partners</th>
                  <th className="px-6 py-4 font-medium">Borrowed</th>
                  <th className="px-6 py-4 font-medium">Order Value</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {coalitions.map((coalition) => (
                  <tr
                    key={coalition.id}
                    className="border-b border-[#f0f1f2] last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {coalition.id}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#5f666c]">
                      {coalition.product}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {coalition.partners}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {coalition.borrowed} units
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold">
                      {coalition.value}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#5f666c]">
                      {coalition.deadline}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          coalition.status === "Completed"
                            ? "bg-[#edf7f1] text-[#34745a]"
                            : coalition.status === "Recovered"
                              ? "bg-[#fff6df] text-[#8b6a21]"
                              : "bg-[#eef4ff] text-[#47649a]"
                        }`}
                      >
                        {coalition.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#d8e5dd] bg-[#fbfdfc] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587365]">
            Network Insight
          </p>

          <p className="mt-2 text-lg font-semibold">
            31 orders have been completed using temporary merchant coalitions.
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#70777c]">
            OverMesh combines spare capacity from multiple verified merchants so
            large orders can be accepted instead of rejected.
          </p>
        </div>
      </div>
    </main>
  );
}