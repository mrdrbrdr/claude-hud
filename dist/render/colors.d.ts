import type { HudColorOverrides } from '../config.js';
export declare const RESET = "\u001B[0m";
export declare function green(text: string): string;
export declare function yellow(text: string): string;
export declare function red(text: string): string;
export declare function cyan(text: string): string;
export declare function magenta(text: string): string;
export declare function dim(text: string): string;
export declare function claudeOrange(text: string): string;
export declare function model(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function project(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function git(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function gitBranch(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function label(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function custom(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function warning(text: string, colors?: Partial<HudColorOverrides>): string;
export declare function critical(text: string, colors?: Partial<HudColorOverrides>): string;
export interface ContextThresholds {
    warning?: number;
    critical?: number;
}
export declare function getContextColor(percent: number, colors?: Partial<HudColorOverrides>, thresholds?: ContextThresholds): string;
export declare function getQuotaColor(percent: number, colors?: Partial<HudColorOverrides>): string;
export declare function quotaBar(percent: number, width?: number, colors?: Partial<HudColorOverrides>): string;
export declare function coloredBar(percent: number, width?: number, colors?: Partial<HudColorOverrides>, thresholds?: ContextThresholds): string;
/**
 * Personal fork addition (Sep 5 2026): renders a bar with `label` overlaid
 * directly on the fill instead of printed after the bar (config
 * `barLabelStyle: "inline"`). The filled portion of the label is drawn in
 * reverse video against `color` (a resolved ANSI escape from getQuotaColor
 * or getContextColor) — swapping that color from foreground to background
 * — so the text reads on top of it without needing a true RGB background
 * color. The empty portion is plain dim text, matching the original bar's
 * empty-cell dimming.
 *
 * `label` is centered within `width` cells, truncated from the right if it
 * doesn't fit (callers should keep width >= the longest label, e.g. 5 for
 * "100%").
 */
export declare function labeledBar(percent: number, width: number, color: string, label: string): string;
//# sourceMappingURL=colors.d.ts.map