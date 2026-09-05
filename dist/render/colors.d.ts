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
 * `barLabelStyle: "inline"`).
 *
 * A first draft kept the un-labeled bar's own glyphs (█/░) everywhere the
 * label didn't cover, and drew label characters over the empty run as
 * plain text — which had no background of its own, so those characters
 * floated on the terminal's raw background instead of on a visible "track".
 * This version gives both runs a real background color instead of relying
 * on a foreground glyph or dimming: the filled run is `color` in reverse
 * video (swapping it from foreground to background, so text reads on top
 * without needing a true RGB background of its own), the empty run is
 * `TRACK_BG`. Every cell in a run — whether it's a label character or a
 * plain space — gets that run's background, so the label reads on a solid
 * track the same width as the bar itself, exactly the same "how much
 * remains" signal as the un-labeled bar, just as a background instead of a
 * glyph.
 *
 * `label` is centered within `width` cells, truncated from the right if it
 * doesn't fit (callers should keep width >= the longest label, e.g. 5 for
 * "100%" with 1 cell to spare).
 */
export declare function labeledBar(percent: number, width: number, color: string, label: string): string;
//# sourceMappingURL=colors.d.ts.map