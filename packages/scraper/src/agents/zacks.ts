import { Page } from "puppeteer";
import { createAgent } from "../engine";
import { AgentResult, Map, Signal } from "../types";

const mapZacksRating: Map = {
  "Strong Buy": Signal.STRONG_BUY,
  Buy: Signal.BUY,
  Hold: Signal.HOLD,
  Sell: Signal.SELL,
  "Strong Sell": Signal.STRONG_SELL,
};

const AGENT_NAME = "Zacks";

export const ZacksAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    const destinationURL = `https://www.zacks.com/stock/quote/${symbol}`;

    await Promise.all([page.goto(destinationURL), page.waitForNavigation()]);

    if (page.url() !== destinationURL) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "destinationURL has been redirected",
      };
    }

    const ratingSelector = "dl > dd > strong";

    await page.waitForSelector(ratingSelector);

    const rating = await page.$eval(ratingSelector, (el) => el.textContent);

    const timestamp = await page.$eval("#timestamp", (el) => el.textContent);

    const [lowTargetXPath] = await page.$x(
      "//dt[contains(., '52 Wk Low')]/following-sibling::dd"
    );
    const lowTarget = await page.evaluate(
      (element) => element.textContent,
      lowTargetXPath
    );

    const [highTargetXPath] = await page.$x(
      "//dt[contains(., '52 Wk High')]/following-sibling::dd"
    );
    const highTarget = await page.evaluate(
      (element) => element.textContent,
      highTargetXPath
    );

    if (!rating || !timestamp || !highTarget || !lowTarget) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "Some critical data not found on Zacks page",
      };
    }

    const source = page.url();

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: mapZacksRating[rating],
      lastUpdateDate: new Date(timestamp),
      targets: {
        high: parseFloat(highTarget),
        low: parseFloat(lowTarget),
      },
      source,
    };
  }
);
