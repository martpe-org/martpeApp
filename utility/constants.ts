import { parseTemporalDuration } from "./helpers";


export const CLOUDINARY_FETCH_PREFIX =
  "https://res.cloudinary.com/dp4lrzpsk/image/fetch/w_200,c_scale/q_auto/f_auto/";

export const compareDateWithDuration = (duration: string, dateStr: string) => {
  try {
    const currentDate = new Date();
    const providedDate = new Date(dateStr);

    // Parse the duration into milliseconds
    const durationInMilliseconds = parseTemporalDuration(duration);

    // Add duration to date
    const newDate = new Date(providedDate.getTime() + durationInMilliseconds);

    // Compare new date with current
    return currentDate.getTime() > newDate.getTime();
  } catch (error) {
    console.warn("compareDateWithDuration error:", error);
    return false;
  }
};

export const domainToGradientColor = (domain: string) => {
  switch (domain) {
    case "ONDC:RET10":
      return "#164E0D";
    case "ONDC:RET11":
      return "#E59819";
    case "ONDC:RET12":
      return "#19B4E5";
    case "ONDC:RET13":
      return "#F470B0";
    case "ONDC:RET14":
      return "#119DC9";
    case "ONDC:RET15":
      return "#936E30";
    default:
      return "#936E30";
  }
};

export const homeTabs = [
  {
    title: "all",
    href: "/",
    domain: "ONDC:RET11",
    icon: "FastFoodIcon",
  },
  {
    title: "food",
    href: "/category/food",
    domain: "ONDC:RET11",
    icon: "FastFoodIcon",
  },
  {
    title: "grocery",
    href: "/category/grocery",
    domain: "ONDC:RET10",
    icon: "GroceryIcon",
  },
  {
    title: "fashion",
    href: "/category/fashion",
    domain: "ONDC:RET12",
    icon: "ApparelIcon",
  },
  {
    title: "beauty",
    href: "/category/beauty",
    domain: "ONDC:RET13",
    icon: "HealthAndBeautyIcon",
  },
  {
    title: "electronics",
    href: "/category/electronics",
    domain: "ONDC:RET14",
    icon: "DevicesAndWearablesIcon",
  },
  {
    title: "interior",
    href: "/category/interior",
    domain: "ONDC:RET16",
    icon: "ChairIcon",
  },
] as const;

export const domainSearchPlaceholder: Record<
  (typeof homeTabs)[number]["title"],
  string
> = {
  all: "",
  grocery: "Search in Grocery",
  food: "Search in Food",
  fashion: "Search in Fashion",
  beauty: "Search in Personal Care",
  electronics: "Search in Electronics",
  interior: "Search in Home and Decor",
};

export const OfferCardDomainNameMap: Record<string, string> = {
  "ONDC:RET10": "grocery",
  "ONDC:RET11": "food",
  "ONDC:RET12": "fashion",
  "ONDC:RET13": "body and personal care products",
  "ONDC:RET14": "electronics",
  "ONDC:RET16": "home decor items",
};

export const CANCEL_REASON_CODES = [
  { label: "Price of one or more items have changed.", value: "001" },
  { label: "Product available at lower than order price.", value: "003" },
  { label: "Wrong Product delivered.", value: "009" },
  { label: "Wrong delivery address given.", value: "010" },
];

export const ORDER_STATUS_LIST: Record<
  string,
  { index: number; name: string }
> = {
  initiated: {
    index: 0,
    name: "Order initiated",
  },
  paid: {
    index: 1,
    name: "Order paid",
  },
  created: {
    index: 2,
    name: "Order Confirmed",
  },
  accepted: {
    index: 3,
    name: "Order Confirmed",
  },
  "in-progress": {
    index: 4,
    name: "Order in-progress",
  },
  completed: {
    index: 5,
    name: "Order Delivered",
  },
};

export const RETURN_REASON_CODES = [
  { label: "Buyer does not want product anymore.", value: "001" },
  { label: "Product available at lower than order price.", value: "002" },
  { label: "Product damaged or not in usable state.", value: "003" },
  { label: "Product is of incorrect quantity or size", value: "004" },
  {
    label: "Product delivered is different from what was shown and ordered.",
    value: "005",
  },
];

export const subcatsData: Record<string, { folder: string; items: string[] }> =
  {
    grocery: {
      folder: "grocery",
      items: [
        "fruits and vegetables",
        "masala & seasoning",
        "oil & ghee",
        "foodgrains",
        "eggs, meat & fish",
        "beverages",
        "cleaning & household",
        "beauty & hygiene",
        "bakery, cakes & dairy",
        "baby care",
        "snacks & branded foods",
        "pet care",
      ],
    },
    "f&b": {
      folder: "fb",
      items: [
        "biryani",
        "pizza",
        "pasta",
        "chicken",
        "desserts",
        "coffee",
        "noodles",
        "fried rice",
        "rolls",
        "tacos",
        "tea",
        "thali",
      ],
    },
    electronics: {
      folder: "electronics",
      items: [
        "audio",
        "mobile phone",
        "mobile accessories",
        "television",
        "smart watches",
      ],
    },
    fashionMen: {
      folder: "fashionMen",
      items: ["topwear", "bottomwear", "footwear", "accessories"],
    },
  };

export const mandatoryCategoryAttributes: Record<string, string[]> = {
  "ONDC:RET10": [],
  "ONDC:RET11": [],
  "ONDC:RET12": ["gender", "color", "size", "brand"],
  "ONDC:RET13": ["brand"],
  "ONDC:RET14": ["brand"],
  "ONDC:RET16": ["brand"],
};

export const FILTER_LABELS: Record<string, string> = {
  gender: "Gender",
  color: "Color",
  size: "Size",
  brand: "Brand",
  colour: "Color",
  colour_name: "Color",
};

export const SINGLE_SELECT_FILTERS = ["gender"];
