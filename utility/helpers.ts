// utils/helpers.ts

import parse from "parse-duration";
import prettyMilliseconds, { type Options } from "pretty-ms";

/**
 * Dummy cn() function for React Native
 * Tailwind class merging isn't used in React Native.
 * You can safely ignore this or adapt for NativeWind.
 */
export function cn(...inputs: any[]): string {
  // In React Native, styles are not merged as class strings
  // so we just return a joined string (for logging/debugging)
  return inputs.filter(Boolean).join(" ");
}

/**
 * Converts an ISO 8601 duration string (like "PT5M" or "P1DT2H") 
 * into a human-readable duration like "5 minutes" or "1 day 2 hours".
 */
export const prettifyTemporalDuration = (t: string, options?: Options) => {
  try {
    const tSplit = t.toUpperCase().split("T");

    const res =
      tSplit[0].length > 1
        ? (parse(tSplit[0]) ?? 0) + (parse(`PT${tSplit[1]}`) ?? 0)
        : (parse(tSplit[1]) ?? 0);

    return prettyMilliseconds(res, options);
  } catch (error) {
    console.warn("prettifyTemporalDuration error:", error);
    return "";
  }
};

/**
 * Parses an ISO 8601 temporal duration string (like "PT30M" or "P1DT2H")
 * and returns milliseconds.
 */
export const parseTemporalDuration = (t: string, format?: string) => {
  try {
    const tSplit = t.toUpperCase().split("T");

    return tSplit[0].length > 1
      ? (parse(tSplit[0], format) ?? 0) + (parse(`PT${tSplit[1]}`, format) ?? 0)
      : (parse(tSplit[1], format) ?? 0);
  } catch (error) {
    console.warn("parseTemporalDuration error:", error);
    return 0;
  }
};
