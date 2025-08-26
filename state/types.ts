export interface AllCartsType {
  getAllCarts: Cart[];
}

export interface Cart {
  id: string;
  items: Item[];
  store: Store;
  customizations: any;
}

export interface Item {
  itemId: string;
  quantity: number;
  details: Details;
}

export interface Details {
  descriptor: Descriptor;
  price: Price;
}

export interface Descriptor {
  // components expect descriptor.images (array) and also long/short descriptions
  images?: string[];        // <-- added (some components use descriptor.images)
  name: string;
  symbol: string;
  long_desc?: string;
  short_desc?: string;
}

export interface Price {
  maximum_value: number;
  offer_percent: number | null;
  offer_value: number | null;
  value: number;
}

export interface Store {
  id: string;
  descriptor: StoreDescriptor;
  domain?: string;
  geoLocation?: GeoLocation;
}

export interface StoreDescriptor {
  name: string;
  symbol: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * CatalogItem - unified shape used across PLPFnB, DropdownHeader, Dropdown, PLPCard, etc.
 * - descriptor.images is optional (some sources may provide itemImg at top level instead)
 * - image (singular) included as optional in case some datasets use that key
 * - quantity kept as number (if used)
 */
export interface CatalogItem {
  bpp_id: string;
  bpp_uri: string;
  catalog_id: string;
  category_id: string;
  slug:string;
  customizable:boolean;
  // use the shared Descriptor above which now may include images/long/short desc
  descriptor: Descriptor;
  id: string;
  location_id?: string;
  non_veg: boolean | null;
  price: Price;
  provider_id: string;
  veg: boolean;
  provider?: { id: string };
  quantity?: number;

  // some UI data sources add an 'image' field (single url). Keep optional to be safe.
  image?: string;
}
