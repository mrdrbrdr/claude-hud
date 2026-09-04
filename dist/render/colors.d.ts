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
 * on top of it instead of printed after the bar (config
 * `barLabelStyle: "inline"`). Unlike a first draft of this, both the filled
 * AND empty cells keep the original bar's own glyphs and coloring (█ in
 * `color`, ░ dimmed) everywhere the label doesn't cover — only the cells the
 * label's characters actually occupy are replaced, so "how much of the bar
 * remains" is still visible at a glance, exactly like the un-labeled bar.
 * The label's characters over the filled run are drawn in reverse video
 * against `color` (swapping it from foreground to background, so the text
 * reads on top without needing a true RGB background); over the empty run
 * they're drawn as plain text (brighter than the dimmed ░ around them, which
 * is deliberate — that's the part of the bar carrying the number).
 *
 * `label` is centered within `width` cells, truncated from the right if it
 * doesn't fit (callers should keep width >= the longest label, e.g. 5 for
 * "100%" with 1 cell to spare).
 */
export declare function labeledBar(percent: number, width: number, color: string, label: string): string;
//# sourceMappingURL=colors.d.ts.map