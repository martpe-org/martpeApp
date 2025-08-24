export interface SelectCartResponseType {
  context: Context;
  message?: Message;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface Context {
  action: string;
  message_id: string;
  transaction_id: string;
  city: string;
  domain: string;
  bpp_uri: string;
  bpp_id: string;
  bap_id: string;
  bap_uri: string;
  core_version: string;
  country: string;
  timestamp: string;
  ttl: string;
}

export interface Message {
  ack: Ack;
}

export interface Ack {
  status: string;
}
