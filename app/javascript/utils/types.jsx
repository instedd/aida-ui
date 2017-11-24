/* @flow */

export * from './types-generated-decl'
import * as T from './types-generated-decl'

export type ById<T> = { [string]: T };

export type AuthAction = {
  type: 'AUTH_INIT',
  userEmail: string,
  userName: string
};

export type BotAction = {
  type: "BOT_UPDATE",
  bot: T.Bot,
} | {
  type: "BOT_PUBLISH",
  bot: T.Bot,
};

export type BotsAction = {
  type: 'BOTS_RECEIVE',
  items: ById<T.Bot>,
} | {
  type: 'BOTS_RECEIVE_ERROR',
} | {
  type: 'BOTS_FETCH',
};

export type ChannelAction = {
  type: "CHANNEL_UPDATE",
  channel: T.Channel,
};

export type ChannelsAction = {
  type: 'CHANNELS_RECEIVE',
  scope: ?any,
  items: ById<T.Channel>,
} | {
  type: 'CHANNELS_RECEIVE_ERROR',
} | {
  type: 'CHANNELS_FETCH',
  scope: ?any,
};

export type Action = AuthAction | BotAction | BotsAction | ChannelAction | ChannelsAction;

export type Dispatch = (action : Action) => void;

export type AuthState = {
  userEmail: ?string,
  userName: ?string
};

export type BotsState = {
  fetching: boolean,
  items: ?ById<T.Bot>
};

export type ChannelsState = {
  fetching: boolean,
  scope: ?any,
  items: ?ById<T.Channel>
};

export type State = {
  bots: BotsState,
  channels: ChannelsState,
};

export type GetState = () => State;

