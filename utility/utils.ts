// utils.ts or utils/index.ts
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// React Native alternative to cn function for styling
export function combineStyles(...styles: (ViewStyle | TextStyle | undefined | false | null)[]): ViewStyle | TextStyle {
  return StyleSheet.flatten(
    styles.filter(Boolean) as (ViewStyle | TextStyle)[]
  );
}

// Alternative conditional styling helper
export function conditionalStyle<T extends ViewStyle | TextStyle>(
  condition: boolean,
  trueStyle: T,
  falseStyle?: T
): T | undefined {
  return condition ? trueStyle : falseStyle;
}

// Duration parsing utilities for React Native
export const prettifyTemporalDuration = (t: string, options?: {
  compact?: boolean;
  verbose?: boolean;
  unitCount?: number;
}) => {
  const tSplit = t.toUpperCase().split("T");
  
  const res =
    tSplit[0].length > 1
      ? (parseTemporalDuration(tSplit[0]) + parseTemporalDuration(`PT${tSplit[1]}`))
      : parseTemporalDuration(tSplit[1]);
  
  console.log(res);
  
  return formatMilliseconds(res, options);
};

export const parseTemporalDuration = (t: string, format?: string) => {
  const tSplit = t.toUpperCase().split("T");
  
  return tSplit[0].length > 1
    ? (parseDuration(tSplit[0], format) + parseDuration(`PT${tSplit[1]}`, format))
    : parseDuration(tSplit[1], format);
};

// Native implementation of duration parsing (replacing parse-duration)
const parseDuration = (duration: string, format?: string): number => {
  if (!duration) return 0;
  
  // Remove 'PT' prefix if present
  const cleaned = duration.replace(/^PT?/, '');
  
  let totalMs = 0;
  
  // Parse years (Y)
  const years = cleaned.match(/(\d+(?:\.\d+)?)Y/);
  if (years) totalMs += parseFloat(years[1]) * 365.25 * 24 * 60 * 60 * 1000;
  
  // Parse months (M) - before time part
  const months = cleaned.match(/(\d+(?:\.\d+)?)M(?!S)/);
  if (months) totalMs += parseFloat(months[1]) * 30.44 * 24 * 60 * 60 * 1000;
  
  // Parse weeks (W)
  const weeks = cleaned.match(/(\d+(?:\.\d+)?)W/);
  if (weeks) totalMs += parseFloat(weeks[1]) * 7 * 24 * 60 * 60 * 1000;
  
  // Parse days (D)
  const days = cleaned.match(/(\d+(?:\.\d+)?)D/);
  if (days) totalMs += parseFloat(days[1]) * 24 * 60 * 60 * 1000;
  
  // Parse hours (H)
  const hours = cleaned.match(/(\d+(?:\.\d+)?)H/);
  if (hours) totalMs += parseFloat(hours[1]) * 60 * 60 * 1000;
  
  // Parse minutes (M) - after time part
  const minutes = cleaned.match(/(\d+(?:\.\d+)?)M(?=.*S|$)/);
  if (minutes) totalMs += parseFloat(minutes[1]) * 60 * 1000;
  
  // Parse seconds (S)
  const seconds = cleaned.match(/(\d+(?:\.\d+)?)S/);
  if (seconds) totalMs += parseFloat(seconds[1]) * 1000;
  
  return totalMs;
};

// Native implementation of pretty milliseconds (replacing pretty-ms)
const formatMilliseconds = (ms: number, options?: {
  compact?: boolean;
  verbose?: boolean;
  unitCount?: number;
}): string => {
  const { compact = false, verbose = false, unitCount = Infinity } = options || {};
  
  if (ms === 0) return '0ms';
  
  const units = [
    { name: verbose ? 'year' : 'y', value: 365.25 * 24 * 60 * 60 * 1000 },
    { name: verbose ? 'day' : 'd', value: 24 * 60 * 60 * 1000 },
    { name: verbose ? 'hour' : 'h', value: 60 * 60 * 1000 },
    { name: verbose ? 'minute' : 'm', value: 60 * 1000 },
    { name: verbose ? 'second' : 's', value: 1000 },
    { name: verbose ? 'millisecond' : 'ms', value: 1 },
  ];
  
  const parts: string[] = [];
  let remaining = Math.abs(ms);
  
  for (const unit of units) {
    if (parts.length >= unitCount) break;
    
    const count = Math.floor(remaining / unit.value);
    if (count > 0) {
      remaining %= unit.value;
      
      if (verbose) {
        parts.push(`${count} ${unit.name}${count !== 1 ? 's' : ''}`);
      } else {
        const separator = compact ? '' : ' ';
        parts.push(`${count}${separator}${unit.name}`);
      }
    }
  }
  
  if (parts.length === 0) return '0ms';
  
  const separator = verbose ? ', ' : ' ';
  return (ms < 0 ? '-' : '') + parts.join(separator);
};

// Additional React Native specific utility functions
export const createStyleVariants = <T extends Record<string, ViewStyle | TextStyle>>(variants: T) => {
  return StyleSheet.create(variants);
};

// Helper for merging multiple style arrays
export const mergeStyleArrays = (...styleArrays: (ViewStyle | TextStyle | (ViewStyle | TextStyle)[] | undefined)[]): (ViewStyle | TextStyle)[] => {
  return styleArrays
    .flat()
    .filter(Boolean) as (ViewStyle | TextStyle)[];
};
