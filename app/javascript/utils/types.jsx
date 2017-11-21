/* @flow */

export * from './types-generated-decl'
import * as T from './types-generated-decl'

export type ById<T> = { [string]: T };

export type BotAction = {
  type: "BOT_UPDATE",
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

export type Action = BotAction | BotsAction;

export type Dispatch = (action : Action) => void;

export type BotsState = {
  fetching: boolean,
  items: ?ById<T.Bot>
};

export type State = {
  bots: BotsState
};

export type GetState = () => State;

