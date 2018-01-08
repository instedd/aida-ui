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
  relevant?: string;
  explanation: Message;
  clarification: Message;
  keywords: KeywordList;
  response: Message;
};

export type SurveyConfig = {
  relevant?: string;
  schedule?: string;
  questions?: Array<SurveyQuestion>;
  choice_lists?: Array<SurveyChoiceList>;
};

export type ScheduledMessagesConfig = {
  relevant?: string;
  schedule_type: "since_last_incoming_message";
  messages: Array<{
    id: string;
    delay: number;
    message: Message;
  }>;
} | {
  relevant?: string;
  schedule_type: "fixed_time";
  messages: Array<{
    id: string;
    schedule: string;
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
  relevant?: string;
} | {
  type: "integer" | "decimal" | "text";
  name: string;
  message: Message;
  relevant?: string;
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
  id: number;
  label: string;
  keys: Array<{
    _key: string;
    _label: string;
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

export type Collaborator = {
  id: number;
  role: string;
  user_email: string;
  last_activity: string | null;
};

export type CollaboratorsIndex = {
  collaborators: Array<Collaborator>;
  invitations: Array<Invitation>;
  anonymous_invitation: Invitation;
};

export type Invitation = {
  id: number;
  creator?: string;
  email: string | null;
  role?: string;
  link_url: string | null;
  created_at: string;
};

export type InvitationData = {
  bot_name: string;
  inviter: string;
  role: string;
};

