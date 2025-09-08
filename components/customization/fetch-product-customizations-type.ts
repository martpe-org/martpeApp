// export interface FetchProductCustomizationsResponseType {
//   _id: string;
//   product_id: string;
//   __v: number;
//   all_cg_ids: string[];
//   all_ci_ids: string[];
//   // cg_CG1: CgCg1;
//   // cg_CG2: CgCg2;
//   // cg_CG4: CgCg4;
//   createdAt: string;
//   product_slug: string;
//   updatedAt: string;
//   vendor_id: string;
//   id: string;
// }

export interface CustomGroupType {
  name: string;
  type: string;
  config: Config;
  custom_group_id: string;
  options: string[];
  ci_C1: CiC1;
}

export interface Config {
  min: string;
  max: string;
  input: string;
  seq: string;
}

export interface CiC1 {
  custom_item_id: string;
  related: boolean;
  category_id: string;
  images: string[];
  long_desc: string;
  name: string;
  short_desc: string;
  symbol: string;
  unitized: Unitized;
  quantity: number;
  instock: boolean;
  price: Price;
  parent_group_id: string;
  isDefaultOption: boolean;
  child_group_ids: string[];
  diet_type: string;
}

export interface Unitized {
  measure: Measure;
}

export interface Measure {
  unit: string;
  value: string;
}

export interface Price {
  currency: string;
  value: number;
}

export interface CgCg2 {
  name: string;
  type: string;
  config: Config2;
  custom_group_id: string;
  options: string[];
  ci_C3: CiC3;
}

export interface Config2 {
  min: string;
  max: string;
  input: string;
  seq: string;
}

export interface CiC3 {
  custom_item_id: string;
  related: boolean;
  category_id: string;
  images: string[];
  long_desc: string;
  name: string;
  short_desc: string;
  symbol: string;
  quantity: number;
  instock: boolean;
  price: Price2;
  parent_group_id: string;
  isDefaultOption: boolean;
  child_group_ids: string[];
  diet_type: string;
}

export interface Price2 {
  currency: string;
  value: number;
}

export interface CgCg4 {
  name: string;
  type: string;
  config: Config3;
  custom_group_id: string;
  options: string[];
  ci_C8: CiC8;
}

export interface Config3 {
  min: string;
  max: string;
  input: string;
  seq: string;
}

export interface CiC8 {
  custom_item_id: string;
  related: boolean;
  category_id: string;
  images: string[];
  long_desc: string;
  name: string;
  short_desc: string;
  symbol: string;
  quantity: number;
  instock: boolean;
  price: Price3;
  parent_group_id: string;
  isDefaultOption: boolean;
  diet_type: string;
}

export interface Price3 {
  currency: string;
  value: number;
}
