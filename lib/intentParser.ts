export type ParsedIntent = {
  product: string;
  quantity: number | null;
  budget: number | null;
  deadlineHours: number | null;
  city: string;
};

export function parseOrderIntent(text: string): ParsedIntent {
  const input = text.toLowerCase();

  let quantity: number | null = null;
  let budget: number | null = null;
  let deadlineHours: number | null = null;
  let city = "";

  // Quantity
  const quantityMatch = input.match(
    /(?:need|want|require|required|order|chahiye)?\s*(\d+)\s*(?:pieces|pcs|units|cupcakes|boxes|notebooks|mugs|kits)?/i
  );

  if (quantityMatch) {
    quantity = Number(quantityMatch[1]);
  }

  // Budget examples:
  // under 30000
  // budget 50000
  // ₹20,000
  const budgetMatch =
    input.match(/(?:under|budget|within)\s*₹?\s*([\d,]+)/i) ||
    input.match(/₹\s*([\d,]+)/i);

  if (budgetMatch) {
    budget = Number(
      budgetMatch[1].replace(/,/g, "")
    );
  }

  // Deadline
  if (
    input.includes("tomorrow") ||
    input.includes("kal")
  ) {
    deadlineHours = 24;
  }

  const hourMatch = input.match(
    /(\d+)\s*(?:hours|hour|hrs|hr)/i
  );

  if (hourMatch) {
    deadlineHours = Number(hourMatch[1]);
  }

  const dayMatch = input.match(
    /(\d+)\s*(?:days|day)/i
  );

  if (dayMatch) {
    deadlineHours =
      Number(dayMatch[1]) * 24;
  }

  // Known products in our demo network
  const products = [
    "Cupcakes",
    "Cakes",
    "Custom T-Shirts",
    "Event Hoodies",
    "Cardboard Boxes",
    "Gift Boxes",
    "Printed Notebooks",
    "Certificates",
    "Printed Mugs",
    "Study Tables",
    "Office Chairs",
    "Event Kits",
    "Decoration Kits",
  ];

  let product = "";

  for (const item of products) {
    const normalized = item.toLowerCase();

    const singular = normalized.replace(
      /s$/,
      ""
    );

    if (
      input.includes(normalized) ||
      input.includes(singular)
    ) {
      product = item;
      break;
    }
  }

  // Basic city detection
  const cities = [
    "Bhopal",
    "Indore",
    "Nagpur",
  ];

  for (const item of cities) {
    if (input.includes(item.toLowerCase())) {
      city = item;
      break;
    }
  }

  return {
    product,
    quantity,
    budget,
    deadlineHours,
    city,
  };
}