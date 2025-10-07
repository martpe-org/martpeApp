export interface FetchTicketDetailType {
  _id: string;
  issue_id: string;
  order_id: string;
  context: Context;
  status: string;
  level: string;
  expected_response_time: ExpectedResponseTime;
  expected_resolution_time: ExpectedResolutionTime;
  source_id: string;
  complainant_id: string;
  store_id: string;
  provider_id: string;
  actors: Actor[];
  refs: Ref[];
  descriptor: Descriptor3;
  actions: Action[];
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  creation_response: CreationResponse;
  user_id: string;
  store: Store;
  order: Order;
  order_items: any[];
  fulfillment_history: any[];
  respondent_ids?: string[];

  // after resolutions sent by seller
  resolutions?: Resolution[];
  parsed_resolutions?: ParsedResolution[];
}

export interface Context {
  domain: string;
  action: string;
  country: string;
  city: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  bpp_id: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  ttl: string;
}

export interface ExpectedResponseTime {
  duration: string;
}

export interface ExpectedResolutionTime {
  duration: string;
}

export interface Actor {
  id: string;
  type: string;
  info: Info;
}

export interface Info {
  person: Person;
  contact: Contact;
  org: Org;
}

export interface Person {
  name: string;
}

export interface Contact {
  phone: string;
  email: string;
}

export interface Org {
  name: string;
}

export interface Ref {
  ref_id: string;
  ref_type: string;
  tags?: Tag[];
}

export interface Tag {
  descriptor: Descriptor;
  list: List[];
}

export interface Descriptor {
  code: string;
}

export interface List {
  descriptor: Descriptor2;
  value: number;
}

export interface Descriptor2 {
  code: string;
}

export interface Descriptor3 {
  code: string;
  short_desc: string;
  long_desc: string;
  images: Image[];
}

export interface Image {
  url: string;
  size_type: string;
}

export interface Action {
  id: string;
  descriptor: Descriptor4;
  updated_at: string;
  action_by: string;
  actor_details: ActorDetails;
}

export interface Descriptor4 {
  code: string;
  name?: string;
  short_desc: string;
  images?: Image[];
}

export interface ActorDetails {
  name: string;
}

export interface CreationResponse {
  statusCode: number;
  body: Body;
}

export interface Body {
  message: Message;
  error: Error;
  context: Context2;
}

export interface Message {
  ack: Ack;
}

export interface Ack {
  status: string;
}

export interface Error {
  type: string;
  code: string;
  message: string;
}

export interface Context2 {
  domain: string;
  country: string;
  city: string;
  action: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  bpp_id: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
}

export interface Store {
  _id: string;
  address: Address;
  gps: Gps;
  name: string;
  orderTimings: OrderTiming[];
  rating: number;
  slug: string;
  status: string;
  symbol: string;
}

export interface Address {
  name: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  area_code: string;
}

export interface Gps {
  lat: number;
  lon: number;
}

export interface OrderTiming {
  day: number;
  time_range: TimeRange;
  type: string;
}

export interface TimeRange {
  gte: string;
  lte: string;
}

export interface Order {
  _id: string;
  transaction_id: string;
  user_id: string;
  store_id: string;
  orderno: string;
  cancellable: boolean;
  status: string;
  state: string;
  delivery_address: DeliveryAddress;
  billing_address: BillingAddress;
  context: Context3;
  pg: Pg;
  fulfillment: Fulfillment;
  total: number;
  sub_total: number;
  breakup: Breakup[];
  max_return_period: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddress {
  city: string;
  houseNo: string;
  building: string;
  street: string;
  gps: Gps2;
  lastUsed: boolean;
  name: string;
  pincode: string;
  state: string;
  type: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Gps2 {
  lat: number;
  lon: number;
  point: Point;
}

export interface Point {
  type: string;
  coordinates: number[];
}

export interface BillingAddress {
  name: string;
  address: Address2;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Address2 {
  name: string;
  building: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  area_code: string;
}

export interface Context3 {
  bpp_id: string;
  bpp_uri: string;
  city: string;
  core_version: string;
  country: string;
  domain: string;
  transaction_id: string;
}

export interface Pg {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  id: string;
  notes: Notes;
  offer_id: any;
  receipt: string;
  status: string;
}

export interface Notes {
  oninitId: string;
  orderId: string;
  orderno: string;
  storeId: string;
  userId: string;
}

export interface Fulfillment {
  id: string;
  type: string;
  status: string;
  provider_name: string;
  category: string;
  tat: string;
  tracking: boolean;
  timestamp: string;
  agent: Agent;
  routing: string;
  authorization: Authorization;
}

export interface Agent {
  name: string;
  phone: string;
}

export interface Authorization {
  type: string;
  token: string;
}

export interface Breakup {
  title?: string;
  type?: string;
  price: number;
  id?: string;
  custom_title?: string;
  children?: Children[];
}

export interface Children {
  custom_title: string;
  price: number;
  level: string;
  type: string;
  id?: string;
  title?: string;
}

export interface Resolution {
  id: string;
  descriptor: Descriptor5;
  updated_at: string;
  proposed_by: string;
  ref_id?: string;
  ref_type?: string;
  tags?: Tag2[];
}

export interface Descriptor5 {
  code: string;
  short_desc: string;
}

export interface Tag2 {
  descriptor: Descriptor6;
  list: List2[];
}

export interface Descriptor6 {
  code: string;
}

export interface List2 {
  descriptor: Descriptor7;
  value: string;
}

export interface Descriptor7 {
  code: string;
}

/////////////////////

export interface ParsedResolution {
  descriptor: Descriptor5;
  id: string;
  proposed_by: string;
  updated_at: string;
  options: Option[];
  accepted?: boolean;
}

export interface Descriptor5 {
  code: string;
  short_desc: string;
}

export interface Option {
  descriptor: Descriptor6;
  id: string;
  proposed_by: string;
  ref_id: string;
  ref_type: string;
  accepted?: boolean;
  tags: {
    resolution_details?: {
      item?: string;
      refund_amount?: string;
    };
  };
  updated_at: string;
}

export interface Descriptor6 {
  code: string;
  short_desc: string;
}

export interface Tag0 {
  descriptor: Descriptor10;
  list: List2[];
}

export interface Descriptor10 {
  code: string;
}

export interface List2 {
  descriptor: Descriptor8;
  value: string;
}

export interface Descriptor8 {
  code: string;
}