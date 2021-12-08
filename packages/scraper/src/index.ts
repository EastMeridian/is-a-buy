import { runAgents } from "./engine";
import puppeteer from "puppeteer";
import fs from "fs-extra";
import { TradingViewAgent } from "./agents/tradingview";
import { StockchaseAgent } from "./agents/stockchase";
import { ZacksAgent } from "./agents/zacks";
import { Agent } from "./types";
import { YahooAgent } from "./agents/yahoo";
import { MotleyFoolAgent } from "./agents/motleyfool";
import { TipRanksAgent } from "./agents/tipranks";

const SYMBOLS = [
  "AAPL",
  "AMC",
  "AMZN",
  "DIS",
  "FB",
  "FDX",
  "GOOGL",
  "LNVGY",
  "MSFT",
  "NFLX",
  "NVDA",
  "OCGN",
  "TSLA",
];

/* console.log(SYMBOLS.sort()); */

const argvs = process.argv.splice(2);

const symbols = argvs.length > 0 ? argvs : SYMBOLS;

console.log("symbol", symbols);

const agents: Agent[] = [
  YahooAgent,
  StockchaseAgent,
  ZacksAgent,
  TradingViewAgent,
  MotleyFoolAgent,
  TipRanksAgent,
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  const store = await runAgents(symbols, agents, browser);

  fs.writeJson("results.json", store, { spaces: 2 });

  await browser.close();
})();
