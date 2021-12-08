import { Page } from "puppeteer";
import { createAgent } from "../engine";
import { AgentResult, Map, Signal } from "../types";

const mapTradingViewRating: Map = {
  "Fort achat": Signal.STRONG_BUY,
  Acheter: Signal.BUY,
  Neutre: Signal.HOLD,
  Vendre: Signal.SELL,
  "Forte vente": Signal.STRONG_SELL,
};

const AGENT_NAME = "TradingView";

export const TradingViewAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    await page.goto(`https://fr.tradingview.com/symbols/${symbol}`);

    await Promise.all([
      page.goto(`${page.url()}technicals/`),
      page.waitForNavigation(),
    ]);

    const ratingSelector =
      'div[class="speedometerWrapper-DPgs-R4s summary-DPgs-R4s"] > .speedometerSignal-DPgs-R4s';

    await page.waitForSelector(ratingSelector);

    await page.waitForTimeout(500);

    const rating = await page.$eval(ratingSelector, (el) => el.textContent);

    if (!rating || rating === "" || !Boolean(rating)) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "Some critical data not found on TradingView page",
      };
    }

    const source = page.url();

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: mapTradingViewRating[rating],
      lastUpdateDate: new Date(),
      source,
    };
  }
);
