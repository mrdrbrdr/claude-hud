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
// Bright-black background: reads as a distinct mid-grey "track" against a
// dark theme's own background without needing a true RGB color (which some
// terminals/multiplexers don't pass through faithfully).
const TRACK_BG = '\x1b[100m';
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
export function labeledBar(percent, width, color, label) {
    // Same zero-width handling as coloredBar/quotaBar above: a 0-cell bar
    // renders as nothing rather than being silently widened to one cell.
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const padTotal = Math.max(0, safeWidth - label.length);
    const padLeft = Math.floor(padTotal / 2);
    const text = label.length > safeWidth ? label.slice(0, safeWidth) : label;
    const labelStart = label.length > safeWidth ? 0 : padLeft;
    const labelEnd = labelStart + text.length;
    const cellAt = (i) => (i >= labelStart && i < labelEnd) ? text[i - labelStart] : ' ';
    let out = '';
    let i = 0;
    while (i < safeWidth) {
        const onFilled = i < filled;
        let j = i + 1;
        while (j < safeWidth && (j < filled) === onFilled)
            j += 1;
        let run = '';
        for (let k = i; k < j; k += 1)
            run += cellAt(k);
        out += onFilled ? `${color}${REVERSE}${run}${RESET}` : `${TRACK_BG}${run}${RESET}`;
        i = j;
    }
    return out;
}
//# sourceMappingURL=colors.js.map