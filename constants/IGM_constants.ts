export const IssueLevels = ["ORDER", "ITEM", "FULFILLMENT", "AGENT"] as const;

export const IssueTaxonomy: Record<
  (typeof IssueLevels)[number],
  {
    label: string;
    value: string;
    code: string;
    description: string;
    type: string;
  }[]
> = {
  ORDER: [
    {
      label: "Order not received",
      value: "001",
      code: "ORD001",
      description: "Order delivery delay / Order not received",
      type: "BAP / LBNP",
    },
    {
      label: "Quality issue",
      value: "002",
      code: "ORD002",
      description: "Unsatisfactory order",
      type: "BAP",
    },
    {
      label: "Delayed delivery",
      value: "003",
      code: "ORD003",
      description: "Order delivered late",
      type: "BAP / LBNP",
    },
    {
      label: "Invoice missing",
      value: "004",
      code: "ORD004",
      description: "Invoice not provided to the buyer.",
      type: "BAP",
    },
    {
      label: "Store not responsive",
      value: "005",
      code: "ORD005",
      description:
        "No response from the seller/ seller app on updates on an order",
      type: "BAP",
    },
  ],
  ITEM: [
    {
      label: "Missing items",
      value: "001",
      code: "ITM001",
      description: "Item(s) that were ordered are not present",
      type: "BAP",
    },
    {
      label: "Quantity issue",
      value: "002",
      code: "ITM002",
      description: "Ordered 5 units, received 3 units",
      type: "BAP",
    },
    {
      label: "Item mismatch",
      value: "003",
      code: "ITM003",
      description:
        "Different from what was ordered (blue shirt received for red shirt ordered; 500ml pack received instead of 1lt)",
      type: "BAP",
    },
    {
      label: "Quality issue",
      value: "004",
      code: "ITM004",
      description:
        "Stale/ rotten food; buttons of a shirt missing; damaged item received; expired item",
      type: "BAP",
    },
    {
      label: "Expired item",
      value: "005",
      code: "ITM005",
      description: "Product was delivered beyond date of expiry",
      type: "BAP",
    },
    {
      label: "Incorrectly marked as returned",
      value: "006",
      code: "ITM006",
      description:
        "Product was to be picked up/ delivered to the seller, but was never picked up",
      type: "BAP",
    },
  ],
  FULFILLMENT: [
    {
      label: "Wrong delivery address",
      value: "001",
      code: "FLM001",
      description:
        "The address where delivery is being attempted is someone else's and not of the customer",
      type: "BAP / LBNP",
    },
    {
      label: "Unable to reach location",
      value: "002",
      code: "FLM002",
      description:
        "Unable to reach seller's location (Cause could be address is inside the mall, parking is paid and is non reimbursible, i.e., out of pocket",
      type: "BAP / BPP / LSP",
    },
    {
      label: "Delay in delivery",
      value: "004",
      code: "FLM004",
      description: "Fulfillment not delivered yet",
      type: "BAP / LBNP",
    },
    {
      label: "Packaging",
      value: "005",
      code: "FLM005",
      description: "Spillage/ Improper packaging",
      type: "BAP / LBNP",
    },
    {
      label: "Incorrectly marked as delivered",
      value: "011",
      code: "FLM011",
      description: "Agent/ seller marks the order as delivered incorrectly",
      type: "BAP / LBNP",
    },
  ],
  AGENT: [
    {
      label: "Agent behavioral issue",
      value: "001",
      code: "AGT001",
      description:
        "Agent misbehaves with either the customer (at the time of delivery) or with the seller on record (at the time of pick up)",
      type: "BAP, LBNP",
    },
  ],
};