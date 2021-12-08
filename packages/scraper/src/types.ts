import { Page } from "puppeteer";

export enum Signal {
  STRONG_BUY = "STRONG_BUY",
  BUY = "BUY",
  HOLD = "HOLD",
  SELL = "SELL",
  STRONG_SELL = "STRONG_SELL",
}

type AgentResultDone = {
  agentName: string;
  status: "done";
  signal: Signal | undefined;
  source: string;
  lastUpdateDate?: Date;
  lastUpdateInfo?: string;
  targets?: {
    high: number;
    average?: number;
    low: number;
  };
  meta?: any;
};

type AgentResultError = {
  agentName: string;
  status: "error";
  message: any;
};

export interface Map {
  [key: string]: Signal;
}

export type AgentResult = AgentResultDone | AgentResultError;

export type AgentAction = (symbol: string, page: Page) => Promise<AgentResult>;

export type Agent = { name: string; investigate: AgentAction };
