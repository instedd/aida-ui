/* @flow */

export * from './types-generated-decl'
import * as T from './types-generated-decl'

export type ById<T> = { [string]: T };

export type Scope = {
  botId: number
};

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

export type FrontDeskAction = {
  type: 'FRONT_DESK_FETCH',
  botId: number
} | {
  type: 'FRONT_DESK_FETCH_SUCCESS',
  data: T.FrontDesk
} | {
  type: 'FRONT_DESK_FETCH_ERROR'
} | {
  type: 'FRONT_DESK_UPDATE_CONFIG',
  config: T.FrontDeskConfig
};

export type NotificationsAction = {
  type: 'NOTIF_PUSH',
  message: string
} | {
  type: 'NOTIF_DISMISS'
};

export type SkillAction = {
  type: "SKILL_UPDATE",
  skill: T.Skill,
};

export type SkillsAction = {
  type: 'SKILLS_RECEIVE',
  scope: ?any,
  items: ById<T.Skill>,
} | {
  type: 'SKILLS_RECEIVE_ERROR',
} | {
  type: 'SKILLS_FETCH',
  scope: ?any,
} | {
  type: 'SKILLS_CREATE',
  scope: Scope,
  skillKind: string
} | {
  type: 'SKILLS_CREATE_SUCCESS',
  scope: Scope,
  skill: T.Skill
} | {
  type: 'SKILLS_CREATE_ERROR',
  scope: Scope,
};

export type Thunk = (dispatch : Dispatch, getState : ?GetState) => void;

export type Action = AuthAction
                   | BotAction
                   | BotsAction
                   | ChannelAction
                   | ChannelsAction
                   | FrontDeskAction
                   | NotificationsAction
                   | SkillAction
                   | SkillsAction
                   | Thunk;

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

export type FrontDeskState = {
  fetching: boolean,
  botId: ?number,
  data: ?T.FrontDesk
};

export type NotifState = {
  toasts: Array<{text: string, action: any}>
};

export type SkillsState = {
  fetching: boolean,
  scope: ?Scope,
  items: ?ById<T.Skill>,
  creating: ?string
};

export type State = {
  auth: AuthState,
  bots: BotsState,
  channels: ChannelsState,
  frontDesk: FrontDeskState,
  notifications: NotifState,
  skills: SkillsState,
};

export type GetState = () => State;
