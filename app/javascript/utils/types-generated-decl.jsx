/* @flow */

export type Bot = {
  id: number;
  name: string;
  published: boolean;
  channel_setup: boolean;
};

export type FacebookChannelConfig = {
  page_id: string;
  verify_token: string;
  access_token: string;
};

export type FrontDeskConfig = {
  greeting: Message;
  introduction: Message;
  not_understood: Message;
  clarification: Message;
  threshold: number;
};

export type LanguageDetectorConfig = {
  explanation: string;
  languages: Array<{
    code: Language;
    keywords: KeywordList;
  }>;
};

export type KeywordResponderConfig = {
  explanation: Message;
  clarification: Message;
  keywords: KeywordList;
  response: Message;
};

export type SurveyConfig = {
  schedule?: string;
  questions?: Array<SurveyQuestion>;
  choice_lists?: Array<SurveyChoiceList>;
};

export type ScheduledMessagesConfig = {
  schedule_type: "since_last_incoming_message";
  messages: Array<{
    id: string;
    delay: number;
    message: Message;
  }>;
};

export type Message = string;

export type KeywordList = string;

export type Language = string;

export type SurveyQuestion = {
  type: "select_one" | "select_many";
  name: string;
  choices: string;
  message: Message;
} | {
  type: "integer" | "decimal" | "text";
  name: string;
  message: Message;
};

export type SurveyChoiceList = {
  name: string;
  choices: Array<{
    name: string;
    labels: KeywordList;
  }>;
};

export type Channel = {
  id: number;
  name: string;
  kind: "facebook";
  config: FacebookChannelConfig;
};

export type FrontDesk = {
  id: number;
  config: FrontDeskConfig;
};

export type Skill = {
  id: number;
  kind: "language_detector";
  name: string;
  enabled: boolean;
  order: number;
  config: LanguageDetectorConfig;
} | {
  id: number;
  kind: "keyword_responder";
  name: string;
  enabled: boolean;
  order: number;
  config: KeywordResponderConfig;
} | {
  id: number;
  kind: "survey";
  name: string;
  enabled: boolean;
  order: number;
  config: SurveyConfig;
} | {
  id: number;
  kind: "scheduled_messages";
  name: string;
  enabled: boolean;
  order: number;
  config: ScheduledMessagesConfig;
};

export type BotStats = {
  active_users: number;
  messages_received: number;
  messages_sent: number;
  behaviours: Array<{
    id: "front_desk" | "language_detector" | number;
    label: string;
    kind: "keyword_responder" | "survey" | "scheduled_messages" | "front_desk" | "language_detector";
    users: number;
  }>;
};

export type StatsPeriod = "today" | "this_week" | "this_month";

export type TranslationBehaviours = Array<{
  id?: number;
  label?: string;
  keys?: Array<{
    _key: string;
    _lang: Language;
  }>;
}>;

export type StringByLanguage = { [key: string]: string;
};

export type VariableAssignments = Array<{
  id: string;
  name: string;
  default_value: StringByLanguage;
  conditional_values: Array<{
    id: string;
    condition: string;
    value: StringByLanguage;
    order: number;
  }>;
}>;

export type TranslationsIndex = {
  languages: Array<Language>;
  default_language: Language;
  behaviours: TranslationBehaviours;
  variables: VariableAssignments;
};

export type Translation = {
  behaviour_id: number;
  key: string;
  lang: Language;
  value: string;
};

