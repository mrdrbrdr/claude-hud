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
export function labeledBar(percent, width, color, label) {
    const safeWidth = Number.isFinite(width) ? Math.max(1, Math.round(width)) : 1;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const padTotal = Math.max(0, safeWidth - label.length);
    const padLeft = Math.floor(padTotal / 2);
    const text = label.length > safeWidth ? label.slice(0, safeWidth) : label;
    const labelStart = label.length > safeWidth ? 0 : padLeft;
    const labelEnd = labelStart + text.length;
    const filledChar = '█';
    const emptyChar = '░';
    const kindAt = (i) => {
        const onLabel = i >= labelStart && i < labelEnd;
        const onFilled = i < filled;
        if (onLabel)
            return onFilled ? 'labelOnFilled' : 'labelOnEmpty';
        return onFilled ? 'barFilled' : 'barEmpty';
    };
    let out = '';
    let i = 0;
    while (i < safeWidth) {
        const kind = kindAt(i);
        let j = i + 1;
        while (j < safeWidth && kindAt(j) === kind)
            j += 1;
        const runLength = j - i;
        switch (kind) {
            case 'barFilled':
                out += `${color}${filledChar.repeat(runLength)}${RESET}`;
                break;
            case 'barEmpty':
                out += `${DIM}${emptyChar.repeat(runLength)}${RESET}`;
                break;
            case 'labelOnFilled':
                out += `${color}${REVERSE}${text.slice(i - labelStart, j - labelStart)}${RESET}`;
                break;
            case 'labelOnEmpty':
                out += text.slice(i - labelStart, j - labelStart);
                break;
        }
        i = j;
    }
    return out;
}
//# sourceMappingURL=colors.js.map