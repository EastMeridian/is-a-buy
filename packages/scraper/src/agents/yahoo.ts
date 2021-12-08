import { Page } from "puppeteer";
import { autoScroll } from "../utils";
import { AgentResult, Map, Signal } from "../types";
import { createAgent } from "../engine";

const AGENT_NAME = "Yahoo";

const formatRange = (string: string) =>
  string
    .split("-")
    .map((str) => parseFloat(str.trim().replace(",", ".").replace(/\s/g, "")));

export const mapYahooRating: Map = {
  "5": Signal.STRONG_SELL,
  "4": Signal.SELL,
  "3": Signal.HOLD,
  "2": Signal.BUY,
  "1": Signal.STRONG_BUY,
};

export const YahooAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    await Promise.all([
      page.goto(`https://fr.finance.yahoo.com/quote/${symbol}`),
      page.waitForNavigation(),
    ]);

    const agreeButtonSelector = 'button[name="agree"]';

    if ((await page.$(agreeButtonSelector)) !== null) {
      await page.click(agreeButtonSelector);
      await page.waitForNavigation();
    }

    const ratingSelector = 'div[data-test="rec-rating-txt"]';

    await autoScroll(page);
    let rating, lastUpdateInfo, range;
    try {
      rating = await page.$eval(ratingSelector, (el) => el.textContent);

      lastUpdateInfo = await page.$eval(
        'td[class="Ta(end) C($tertiaryColor) Fz(xs)"]',
        (el) => el.textContent
      );

      range = await page.$eval(
        'td[data-test="FIFTY_TWO_WK_RANGE-value"]',
        (el) => el.textContent?.trim()
      );
    } catch (e) {
      console.warn(e);
    }

    const source = page.url();

    const formated = range ? formatRange(range) : undefined;

    const targets = formated && {
      low: formated[0],
      high: formated[1],
    };

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: rating ? mapYahooRating[parseFloat(rating).toFixed()] : undefined,
      lastUpdateInfo: lastUpdateInfo ?? undefined,
      targets,
      source,
    };
  }
);
