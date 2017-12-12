/* @flow */

export * from './types-generated-decl'
import * as T from './types-generated-decl'

export type ById<T> = { [string]: T };

export type Scope = {
  botId: number
};

export type Translation = {
  behaviourId: number,
  key: string,
  lang: string,
  value: ?string
};

export type TranslationKey = {
  _key: string,
  _lang: string,
};

export type BehaviourTranslations = {
  id: number,
  label: string,
  keys: Array<TranslationKey>,
};

export type TranslationBehaviours = Array<BehaviourTranslations>;

export type TranslationsIndex = {
  languages: Array<string>,
  default_language: string,
  behaviours: TranslationBehaviours
};

export type BehaviourStats = {
  id: number,
  label: string,
  kind: string,
  users: number
};

export type BotStats = {
  active_users: number,
  messages_received: number,
  messages_sent: number,
  behaviours: Array<BehaviourStats>;
};

export type StatsPeriod = "today" | "this_week" | "this_month";

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
} | {
  type: "BOT_UNPUBLISH",
  bot: T.Bot,
} | {
  type: "BOT_DELETE",
  botId: number,
};

export type BotsAction = {
  type: 'BOTS_RECEIVE',
  items: ById<T.Bot>,
} | {
  type: 'BOTS_RECEIVE_ERROR',
} | {
  type: 'BOTS_FETCH',
} | {
  type: 'BOTS_CREATE_SUCCESS',
  bot: T.Bot,
}

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
} | {
  type: "SKILL_DELETE",
  skillId: number
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
  type: 'SKILLS_CREATE_SUCCESS',
  scope: Scope,
  skill: T.Skill
};

export type StatsAction = {
  type: 'STATS_FETCH',
  botId: number,
  period: StatsPeriod
} | {
  type: 'STATS_FETCH_SUCCESS',
  botId: number,
  period: StatsPeriod,
  data: BotStats
} | {
  type: 'STATS_FETCH_ERROR',
  botId: number,
  period: StatsPeriod,
  error: string
};

export type TranslationsAction = {
  type: 'TRANSLATIONS_FETCH',
  scope: Scope,
} | {
  type: 'TRANSLATIONS_RECEIVE',
  scope: Scope,
  data: TranslationsIndex
} | {
  type: 'TRANSLATION_UPDATE',
  botId: number,
  translation: Translation,
};

export type XlsFormsAction = {
  type: 'XLSFORMS_UPLOAD',
  surveyId: number,
} | {
  type: 'XLSFORMS_UPLOAD_SUCCESS',
  surveyId: number,
} | {
  type: 'XLSFORMS_UPLOAD_ERROR',
  surveyId: number,
  error: string
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
                   | StatsAction
                   | TranslationsAction
                   | XlsFormsAction
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
  items: ?ById<T.Skill>
};

export type StatsState = {
  fetching: boolean,
  botId: ?number,
  period: ?StatsPeriod,
  data: ?BotStats
};

export type TranslationsState = {
  fetching: boolean,
  scope: ?Scope,
  languages: ?Array<string>,
  defaultLanguage: ?string,
  behaviours: ?TranslationBehaviours
};

export type XlsFormsState = {
  uploadStatus: {
    [number]: { uploading: boolean, error: ?string }
  }
};

export type State = {
  auth: AuthState,
  bots: BotsState,
  channels: ChannelsState,
  frontDesk: FrontDeskState,
  notifications: NotifState,
  skills: SkillsState,
  stats: StatsState,
  translations: TranslationsState,
  xlsForms: XlsFormsState,
};

export type GetState = () => State;
