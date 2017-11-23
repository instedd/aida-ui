/* @flow */

export type Bot = {
  id: number;
  name: string;
};

export type FacebookChannelConfig = {
  page_id: string;
  verify_token: string;
  access_token: string;
};

export type Channel = {
  id: number;
  name: string;
  kind: "facebook";
  config: FacebookChannelConfig;
};

