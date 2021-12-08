import { Page } from "puppeteer";
import { Map, Signal } from "./types";

export const mapNumberRating: Map = {
  "1": Signal.STRONG_SELL,
  "2": Signal.SELL,
  "3": Signal.HOLD,
  "4": Signal.BUY,
  "5": Signal.STRONG_BUY,
};

export const bullishToSignal = (bullish: number, bearish: number): Signal => {
  const total = bullish + bearish;
  const rating = Math.ceil((bullish / total) * 5);
  return mapNumberRating[rating];
};

export const autoScroll = async (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        var totalHeight = 0;
        var distance = 30;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      })
  );
