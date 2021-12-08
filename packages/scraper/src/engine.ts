import { Browser, Page } from "puppeteer";
import { Agent, AgentAction, AgentResult } from "./types";

type SymbolStore = Record<string, AgentResult[]>;

const addValueToStore = (
  store: SymbolStore,
  symbol: string,
  agentResult: AgentResult
) => {
  if (store[symbol]) {
    return {
      ...store,
      [symbol]: [...store[symbol], agentResult],
    };
  }
  return {
    ...store,
    [symbol]: [agentResult],
  };
};

export const runAgents = async (
  symbols: string[],
  agents: Agent[],
  browser: Browser
) => {
  const page = await browser.newPage();

  let store: SymbolStore = {};

  for (const agent of agents) {
    for (const symbol of symbols) {
      console.time(symbol);
      const result = await agent.investigate(symbol, page);
      console.log(result);
      console.log(result.agentName, "time for");
      console.timeEnd(symbol);

      store = addValueToStore(store, symbol, result);
    }
  }

  return store;
};

export const createAgent = (name: string, investigate: AgentAction): Agent => ({
  name,
  investigate: async (symbol: string, page: Page) => {
    try {
      const result = await investigate(symbol, page);
      return result;
    } catch (e) {
      return {
        agentName: name,
        status: "error",
        message: e,
      };
    }
  },
});
