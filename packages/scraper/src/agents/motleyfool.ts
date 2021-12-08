import { Page } from "puppeteer";
import { mapNumberRating } from "../utils";
import { AgentResult, Map, Signal } from "../types";
import { createAgent } from "../engine";

const AGENT_NAME = "TheMotleyFool";

export const MotleyFoolAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    await Promise.all([
      page.goto(`https://www.fool.com/quote/${symbol}`),
      page.waitForNavigation(),
    ]);

    const agreeButtonSelector = 'input[name="legalese_id_1"]';
    const agreeButtonSelector2 = 'input[name="legalese_id_4"]';
    const submitAgree = 'input[class="gdpr-submit-button"]';

    try {
      await page.waitForSelector(agreeButtonSelector);
      await page.click(agreeButtonSelector);
      await page.click(agreeButtonSelector2);
      await page.click(submitAgree);
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    } catch {}

    const ratingSelector = 'span[class="pct"]';
    await page.waitForSelector(ratingSelector, { timeout: 3000 });

    const rating = await page.$eval(ratingSelector, (el) =>
      el.textContent?.trim()
    );

    if (!rating) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "Some critical data not found on MotleyFool page",
      };
    }

    const source = page.url();

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: mapNumberRating[(parseInt(rating) / 20).toFixed()],
      source,
    };
  }
);
