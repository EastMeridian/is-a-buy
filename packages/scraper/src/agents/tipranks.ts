import { Page } from "puppeteer";
import { createAgent } from "../engine";
import { AgentResult, Map, Signal } from "../types";

const mapTipRanksRating: Map = {
  "Strong Buy": Signal.STRONG_BUY,
  Buy: Signal.BUY,
  Hold: Signal.HOLD,
  Sell: Signal.SELL,
  "Strong Sell": Signal.STRONG_SELL,
};

const AGENT_NAME = "TipRanks";

export const TipRanksAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    const destinationURL = `https://www.tipranks.com/stocks/${symbol}/forecast`;

    await Promise.all([page.goto(destinationURL), page.waitForNavigation()]);

    const ratingSelector = 'div[class="flexccc     displayflex grow1"] > span';

    await page.waitForSelector(ratingSelector);

    const rating = await page.$eval(ratingSelector, (el) => el.textContent);

    const highTarget = await page.$eval(
      'span[class="colorpale  ml3 mobile_fontSize7 laptop_ml0"]',
      (el) => el.textContent
    );
    const averageTarget = await page.$eval(
      'span[class="colorgray-1  ml3 mobile_fontSize7 laptop_ml0"]',
      (el) => el.textContent
    );
    const lowTarget = await page.$eval(
      'span[class="colorpurple-dark  ml3 mobile_fontSize7 laptop_ml0"]',
      (el) => el.textContent
    );

    if (!rating || !highTarget || !averageTarget || !lowTarget) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "Some critical data not found on TipRanks page",
      };
    }

    const source = page.url();

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: mapTipRanksRating[rating],
      lastUpdateInfo: "Under 3 month",
      targets: {
        high: parseFloat(highTarget.replace("$", "")),
        average: parseFloat(averageTarget.replace("$", "")),
        low: parseFloat(lowTarget.replace("$", "")),
      },
      source,
    };
  }
);
