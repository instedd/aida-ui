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
    code: string;
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

export type Message = string;

export type KeywordList = string;

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
};
