export const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const BRIGHT_BLUE = '\x1b[94m';
const BRIGHT_MAGENTA = '\x1b[95m';
const CLAUDE_ORANGE = '\x1b[38;5;208m';
const ANSI_BY_NAME = {
    dim: DIM,
    red: RED,
    green: GREEN,
    yellow: YELLOW,
    magenta: MAGENTA,
    cyan: CYAN,
    brightBlue: BRIGHT_BLUE,
    brightMagenta: BRIGHT_MAGENTA,
};
/** Convert a hex color string (#rrggbb) to a truecolor ANSI escape sequence. */
function hexToAnsi(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
}
/**
 * Resolve a color value to an ANSI escape sequence.
 * Accepts named presets, 256-color indices (0-255), or hex strings (#rrggbb).
 */
function resolveAnsi(value, fallback) {
    if (value === undefined || value === null) {
        return fallback;
    }
    if (typeof value === 'number') {
        return `\x1b[38;5;${value}m`;
    }
    if (typeof value === 'string' && value.startsWith('#') && value.length === 7) {
        return hexToAnsi(value);
    }
    return ANSI_BY_NAME[value] ?? fallback;
}
function colorize(text, color) {
    return `${color}${text}${RESET}`;
}
function withOverride(text, value, fallback) {
    return colorize(text, resolveAnsi(value, fallback));
}
export function green(text) {
    return colorize(text, GREEN);
}
export function yellow(text) {
    return colorize(text, YELLOW);
}
export function red(text) {
    return colorize(text, RED);
}
export function cyan(text) {
    return colorize(text, CYAN);
}
export function magenta(text) {
    return colorize(text, MAGENTA);
}
export function dim(text) {
    return colorize(text, DIM);
}
export function claudeOrange(text) {
    return colorize(text, CLAUDE_ORANGE);
}
export function model(text, colors) {
    return withOverride(text, colors?.model, CYAN);
}
export function project(text, colors) {
    return withOverride(text, colors?.project, YELLOW);
}
export function git(text, colors) {
    return withOverride(text, colors?.git, MAGENTA);
}
export function gitBranch(text, colors) {
    return withOverride(text, colors?.gitBranch, CYAN);
}
export function label(text, colors) {
    return withOverride(text, colors?.label, DIM);
}
export function custom(text, colors) {
    return withOverride(text, colors?.custom, CLAUDE_ORANGE);
}
export function warning(text, colors) {
    return colorize(text, resolveAnsi(colors?.warning, YELLOW));
}
export function critical(text, colors) {
    return colorize(text, resolveAnsi(colors?.critical, RED));
}
export function getContextColor(percent, colors, thresholds) {
    const critical = thresholds?.critical ?? 85;
    const warning = thresholds?.warning ?? 70;
    if (percent >= critical)
        return resolveAnsi(colors?.critical, RED);
    if (percent >= warning)
        return resolveAnsi(colors?.warning, YELLOW);
    return resolveAnsi(colors?.context, GREEN);
}
export function getQuotaColor(percent, colors) {
    if (percent >= 90)
        return resolveAnsi(colors?.critical, RED);
    if (percent >= 75)
        return resolveAnsi(colors?.usageWarning, BRIGHT_MAGENTA);
    return resolveAnsi(colors?.usage, BRIGHT_BLUE);
}
export function quotaBar(percent, width = 10, colors) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const color = getQuotaColor(safePercent, colors);
    const filledChar = colors?.barFilled ?? '█';
    const emptyChar = colors?.barEmpty ?? '░';
    return `${color}${filledChar.repeat(filled)}${DIM}${emptyChar.repeat(empty)}${RESET}`;
}
export function coloredBar(percent, width = 10, colors, thresholds) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const color = getContextColor(safePercent, colors, thresholds);
    const filledChar = colors?.barFilled ?? '█';
    const emptyChar = colors?.barEmpty ?? '░';
    return `${color}${filledChar.repeat(filled)}${DIM}${emptyChar.repeat(empty)}${RESET}`;
}
const REVERSE = '\x1b[7m';
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
export function labeledBar(percent, width, color, label) {
    const safeWidth = Number.isFinite(width) ? Math.max(1, Math.round(width)) : 1;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const padTotal = Math.max(0, safeWidth - label.length);
    const padLeft = Math.floor(padTotal / 2);
    const padRight = padTotal - padLeft;
    const text = label.length > safeWidth
        ? label.slice(0, safeWidth)
        : ' '.repeat(padLeft) + label + ' '.repeat(padRight);
    const filledPart = text.slice(0, filled);
    const emptyPart = text.slice(filled);
    return `${color}${REVERSE}${filledPart}${RESET}${DIM}${emptyPart}${RESET}`;
}
//# sourceMappingURL=colors.js.map