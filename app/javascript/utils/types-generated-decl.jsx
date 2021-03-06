/* @flow */

export type Bot = {
  id: number;
  name: string;
  wit_ai_auth_token?: string | null;
  published: boolean;
  channel_setup: boolean;
  channels?: Array<string>;
  uuid?: string | null;
  updated_at?: string;
  active_users?: number;
  permissions: Permissions;
  collaborator_id?: number | null;
};

export type Permissions = {
  can_admin?: boolean;
  can_publish?: boolean;
  manages_behaviour?: boolean;
  manages_content?: boolean;
  manages_variables?: boolean;
  manages_results?: boolean;
};

export type FacebookChannelConfig = {
  page_id: string;
  verify_token: string;
  access_token: string;
};

export type WebsocketChannelConfig = {
  access_token: string;
  url_key?: string;
};

export type FrontDeskConfig = {
  greeting: Message;
  introduction: Message;
  not_understood: Message;
  clarification: Message;
  unsubscribe_introduction_message: Message;
  unsubscribe_keywords: KeywordList;
  unsubscribe_acknowledge_message: Message;
  threshold: number;
};

export type LanguageDetectorConfig = {
  explanation: string;
  languages: Array<{
    code: Language;
    keywords: KeywordList;
  }>;
  reply_to_unsupported_language?: boolean;
};

export type KeywordResponderConfig = {
  relevant?: string;
  explanation: Message;
  clarification: Message;
  keywords?: KeywordList;
  use_wit_ai?: boolean;
  training_sentences?: Array<string>;
  response: Message;
};

export type HumanOverrideConfig = {
  relevant?: string;
  explanation: Message;
  clarification: Message;
  keywords?: KeywordList;
  use_wit_ai?: boolean;
  training_sentences?: Array<string>;
  hours: Array<Array<boolean>>;
  timezone: string;
  in_hours_response: Message;
  off_hours_response: Message;
};

export type SurveyConfig = {
  relevant?: string;
  schedule?: string;
  keywords?: KeywordList;
  use_wit_ai?: boolean;
  training_sentences?: Array<string>;
  questions?: Array<SurveyQuestion>;
  choice_lists?: Array<SurveyChoiceList>;
};

export type ScheduledMessagesConfig = {
  relevant?: string;
  schedule_type: "since_last_incoming_message";
  messages: Array<{
    id: string;
    delay: number;
    delay_unit: "minute" | "hour" | "day" | "week" | "month";
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
} | {
  relevant?: string;
  schedule_type: "recurrent";
  start_date: string;
  messages: Array<{
    id: string;
    recurrence: {
      type: "daily";
      every: number;
      at: string;
    } | {
      type: "weekly";
      every: number;
      on: Array<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday">;
      at: string;
    } | {
      type: "monthly";
      every: number;
      each: number;
      at: string;
    };
    message: Message;
  }>;
};

export type TreeNode = {
  id: string;
  message: Message;
  options: Array<{
    label: KeywordList;
    next: string;
  }>;
};

export type TreeNodesDict = { [key: string]: TreeNode;
};

export type DecisionTreeConfig = {
  relevant?: string;
  explanation: Message;
  clarification: Message;
  keywords?: KeywordList;
  use_wit_ai?: boolean;
  training_sentences?: Array<string>;
  tree: {
    initial: string;
    nodes: TreeNodesDict;
  };
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
  constraint_message?: Message;
  encrypt?: boolean;
} | {
  type: "integer" | "decimal" | "text" | "image" | "note";
  name: string;
  message: Message;
  relevant?: string;
  constraint?: string;
  constraint_message?: Message;
  encrypt?: boolean;
};

export type AttributesDict = { [key: string]: string | number;
};

export type SurveyChoiceList = {
  name: string;
  choices: Array<{
    name: string;
    labels: KeywordList;
    attributes?: AttributesDict;
  }>;
};

export type Channel = {
  id: number;
  name: string;
  kind: "facebook";
  config: FacebookChannelConfig;
} | {
  id: number;
  name: string;
  kind: "websocket";
  config: WebsocketChannelConfig;
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
  kind: "human_override";
  name: string;
  enabled: boolean;
  order: number;
  config: HumanOverrideConfig;
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
} | {
  id: number;
  kind: "decision_tree";
  name: string;
  enabled: boolean;
  order: number;
  config: DecisionTreeConfig;
};

export type BotStats = {
  active_users: number;
  messages_received: number;
  messages_sent: number;
  behaviours: Array<{
    id: "front_desk" | "language_detector" | number;
    label: string;
    kind: "keyword_responder" | "human_override" | "survey" | "scheduled_messages" | "front_desk" | "language_detector";
    users: number;
  }>;
};

export type StatsPeriod = "today" | "this_week" | "this_month";

export type BotErrorLogs = Array<BotErrorLog>;

export type BotErrorLog = {
  timestamp: string;
  bot_id: string;
  session_id: string;
  skill_id: string;
  message: string;
};

export type PolicyEnforcementData = {
  action: string;
  reason?: string;
};

export type HumanOverrideData = {
  session_id: string;
  message: string;
  name?: string;
  bot_id?: string;
  messages?: Array<DirectionalMessage>;
};

export type NotificationData = PolicyEnforcementData | HumanOverrideData;

export type HumanOverrideNotification = {
  id: number;
  created_at?: any;
  data: HumanOverrideData;
};

export type DirectionalMessage = {
  content: string;
  direction: string;
  type: string;
  timestamp?: string;
};

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
  conditional_values?: Array<{
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

export type UpdateVariable = {
  id: string;
  variable_name?: string;
  lang: Language;
  value: string;
  condition_id?: string;
  condition?: string;
  condition_order?: number;
};

export type Collaborator = {
  id: number;
  roles: RoleList;
  user_email: string;
  display_name: string;
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
  roles?: RoleList;
  link_url: string | null;
  sent_at: string;
};

export type Role = "publish" | "behaviour" | "content" | "variables" | "results" | "operator";

export type RoleList = Array<Role>;

export type InvitationData = {
  bot_name: string;
  inviter: string;
  roles: RoleList;
};

export type DataTableData = Array<Array<any>>;

export type DataTable = {
  id: number;
  name: string;
  columns: Array<string>;
  updated_at: string;
  data: null | DataTableData;
};

export type EncryptedKeyPair = {
  public_key: string;
  encrypted_secret_key: string;
};

