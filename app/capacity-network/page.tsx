const merchants = [
  {
    name: "Urban Threads",
    city: "Bhopal",
    category: "T-Shirts",
    capacity: 160,
    price: 147,
    reliability: 96,
    ready: "31 hrs",
    status: "Available",
  },
  {
    name: "PrintForge",
    city: "Indore",
    category: "Apparel Printing",
    capacity: 100,
    price: 151,
    reliability: 92,
    ready: "22 hrs",
    status: "Available",
  },
  {
    name: "ThreadLab",
    city: "Bhopal",
    category: "T-Shirts",
    capacity: 40,
    price: 148,
    reliability: 95,
    ready: "34 hrs",
    status: "Busy",
  },
  {
    name: "FabricWorks",
    city: "Indore",
    category: "Apparel",
    capacity: 240,
    price: 153,
    reliability: 94,
    ready: "28 hrs",
    status: "Available",
  },
  {
    name: "StitchCore",
    city: "Nagpur",
    category: "Garments",
    capacity: 310,
    price: 158,
    reliability: 91,
    ready: "24 hrs",
    status: "Available",
  },
  {
    name: "CottonCraft",
    city: "Bhopal",
    category: "T-Shirts",
    capacity: 0,
    price: 145,
    reliability: 97,
    ready: "—",
    status: "Offline",
  },
];

export default function CapacityNetworkPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f8] px-6 py-10 text-[#17191c]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">
              Merchant Network
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Capacity Network
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a81]">
              Explore verified merchants currently sharing spare production
              capacity across the OverMesh network.
            </p>
          </div>

          <button className="rounded-lg bg-[#17201c] px-5 py-2.5 text-sm font-medium text-white">
            Share My Capacity
          </button>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Network Merchants", "24"],
            ["Capacity Available", "1,850 units"],
            ["Available Now", "18"],
            ["Avg. Reliability", "94.6%"],
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

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#e2e5e7] bg-white p-4 md:flex-row">
          <input
            placeholder="Search merchant..."
            className="flex-1 rounded-lg border border-[#dfe2e4] px-4 py-2.5 text-sm outline-none"
          />

          <select className="rounded-lg border border-[#dfe2e4] bg-white px-4 py-2.5 text-sm">
            <option>All Categories</option>
            <option>T-Shirts</option>
            <option>Apparel</option>
            <option>Garments</option>
          </select>

          <select className="rounded-lg border border-[#dfe2e4] bg-white px-4 py-2.5 text-sm">
            <option>All Locations</option>
            <option>Bhopal</option>
            <option>Indore</option>
            <option>Nagpur</option>
          </select>

          <select className="rounded-lg border border-[#dfe2e4] bg-white px-4 py-2.5 text-sm">
            <option>All Status</option>
            <option>Available</option>
            <option>Busy</option>
            <option>Offline</option>
          </select>
        </div>

        {/* Merchant cards */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {merchants.map((merchant) => (
            <div
              key={merchant.name}
              className="rounded-xl border border-[#e2e5e7] bg-white p-6"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{merchant.name}</h2>

                  <p className="mt-1 text-xs text-[#8c9297]">
                    {merchant.city} · {merchant.category}
                  </p>
                </div>

                <span
                  className={`h-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                    merchant.status === "Available"
                      ? "bg-[#edf7f1] text-[#34745a]"
                      : merchant.status === "Busy"
                        ? "bg-[#fff6df] text-[#8b6a21]"
                        : "bg-[#f1f2f3] text-[#777d82]"
                  }`}
                >
                  {merchant.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
                <div>
                  <p className="text-xs text-[#92979c]">Capacity</p>
                  <p className="mt-1 text-sm font-semibold">
                    {merchant.capacity} units
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">Price / unit</p>
                  <p className="mt-1 text-sm font-semibold">
                    ₹{merchant.price}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">Ready in</p>
                  <p className="mt-1 text-sm font-semibold">{merchant.ready}</p>
                </div>

                <div>
                  <p className="text-xs text-[#92979c]">Reliability</p>
                  <p className="mt-1 text-sm font-semibold">
                    {merchant.reliability}%
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#eceeef] pt-4">
                <span className="text-xs text-[#8c9297]">
                  Verified OverMesh Partner
                </span>

                <button
                  disabled={merchant.status === "Offline"}
                  className={`rounded-lg px-4 py-2 text-xs font-medium ${
                    merchant.status === "Offline"
                      ? "cursor-not-allowed bg-[#f0f1f2] text-[#a0a4a8]"
                      : "border border-[#d8dcda] bg-white text-[#343a3f]"
                  }`}
                >
                  View Merchant
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}