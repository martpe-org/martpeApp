import { AddressType } from "@/common-types";
import { SelectedCustomizationType } from "@/components/user/fetch-user-type";


export interface SelectCartResponseType {
  error?: {
    message: string;
  };
  data?: SelectData;
}

export interface SelectData {
  context: Context;
  addressId: string;
  address: AddressType;
  sub_total: number;
  items: Item[];
  fulfillments: Fulfillment[];
  breakups: CheckoutBreakups;
}

export interface Context {
  domain: string;
  action: string;
  country: string;
  city: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  bpp_uri: string;
  bpp_id: string;
}

export interface Item {
  id: string;
  catalog_id: string;
  customizable: boolean;
  product: Product;
  parent_item_id?: string;
  dynamicId?: string;
  cart_qty: number;
  instock: boolean;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
  unit_max_price: number;
  total_max_price: number;
  selected_customizations?: SelectedCustomizationType[];
  base?: Base;
  customizations?: Customization[];
}

export interface Base {
  instock: number;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Customization {
  id: string;
  optionId: string;
  groupId: string;
  name: string;
  instock: number;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Product {
  slug: string;
  parent_item_id?: string;
  // attributes?: Attributes;
  name: string;
  symbol: string;
  // price: Price;
  quantity: number;
  instock: boolean;
  unitized?: Unitized;
  customizable: boolean;
  domain: string;
  category_id: string;
  cod?: boolean;
  cancellable: boolean;
  returnable: boolean;
  variant_info?: string;
}


export interface Unitized {
  measure: Measure;
}

export interface Measure {
  unit: string;
  value: string;
}

export interface Fulfillment {
  id: string;
  type: string;
  provider_name: string;
  tracking: boolean;
  category: string;
  tat: string;
  serviceable: boolean;
}

export interface CheckoutBreakups {
  [key: string]: F1;
}

export interface F1 {
  breakups: Breakup[];
  total_savings: number;
  total: number;
}

export interface Breakup {
  title?: string;
  type?: string;
  price: number;
  id?: string;
  custom_title?: string;
  children?: Children[];
  level?: string;
}

export interface Children {
  custom_title: string;
  price: number;
  level: string;
  type: string;
  id?: string;
  title?: string;
}
