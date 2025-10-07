export type FetchTicketsListRespType = FetchTicketsListItemType[];

export interface FetchTicketsListItemType {
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
  __v: number;
  creation_response: CreationResponse;
  user_id: string;
  store: Store;
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
  short_desc: string;
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
