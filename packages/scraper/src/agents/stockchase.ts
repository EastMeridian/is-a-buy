import { Page } from "puppeteer";
import { bullishToSignal } from "../utils";
import { AgentResult } from "../types";
import { createAgent } from "../engine";

const AGENT_NAME = "Stockchase";

export const StockchaseAgent = createAgent(
  AGENT_NAME,
  async (symbol: string, page: Page): Promise<AgentResult> => {
    await page.goto("https://stockchase.com/company");

    const agreeButtonSelector =
      'button[class="fc-button fc-cta-consent fc-primary-button"]';

    if ((await page.$(agreeButtonSelector)) !== null) {
      await page.click(agreeButtonSelector);
    }

    const searchValue = `${symbol}${symbol.length === 2 ? "-" : ""}`;

    console.log(searchValue);
    await page.$eval(
      "input[type=text]",
      (el: any, value) => (el.value = value),
      searchValue
    );

    await page.click("button[class=btn-search]");

    const cardSelector = ".card-info > a";
    await page.waitForTimeout(500);

    await page.waitForSelector(cardSelector);

    await page.click(cardSelector);

    await page.waitForNavigation();

    const source = page.url();

    await page.click('a[href="#ratings"]');

    await page.waitForSelector(".signals__legend");

    const ratings = await page.evaluate(() => {
      const data = [];
      const elements = document.getElementsByClassName("signals__legend-count");
      for (let element of elements) {
        const content = element.textContent?.trim();
        if (content) data.push(parseInt(content));
      }
      return data;
    });
    /* 
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  
    await page.evaluate((_) => {
      window.scrollBy(0, 100);
    });
  
    await page.waitForSelector('a[href="#financilas"]');
  
    await page.click('a[href="#financilas"]');
  
    const iframeSelector = "div#tradingview-fundamental iframe";
  
    await page.waitForSelector(iframeSelector);
  
    const elementHandle = await page.$(iframeSelector);
  
    const frame = await elementHandle?.contentFrame();
  
    if (!frame) {
      return {
        agentName: AGENT_NAME,
        status: "error",
        message: "Some critical data not found on Stockchase page",
      };
    }
  
    const lowTargetSelector =
      "div.tv-scroll-wrap > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(5) > span.tv-widget-fundamentals__value.apply-overflow-tooltip";
  
    const highTargetSelector =
      "div.tv-scroll-wrap > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(4) > span.tv-widget-fundamentals__value.apply-overflow-tooltip";
    let lowTarget, highTarget;
  
    try {
      await frame.waitForSelector(lowTargetSelector);
  
      lowTarget = await frame.$eval(lowTargetSelector, (el) =>
        el.textContent?.trim()
      );
      await frame.waitForSelector(highTargetSelector);
  
      highTarget = await frame.$eval(highTargetSelector, (el) =>
        el.textContent?.trim()
      );
    } catch (e) {
      console.warn(e);
    }
  
    console.log(lowTarget, highTarget);
    const targets =
      lowTarget && highTarget
        ? {
            high: parseFloat(highTarget),
            low: parseFloat(lowTarget),
          }
        : undefined;
   */
    const timestamp = await page.$eval(
      ".company-quote__date",
      (el) => el.textContent
    );

    return {
      agentName: AGENT_NAME,
      status: "done",
      signal: bullishToSignal(ratings[0], ratings[1]),
      lastUpdateDate: timestamp ? new Date(timestamp) : undefined,
      source,
    };
  }
);
