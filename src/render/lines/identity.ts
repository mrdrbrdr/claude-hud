import type { RenderContext } from "../../types.js";
import {
  getContextPercent,
  getBufferedPercent,
} from "../../stdin.js";
import { coloredBar, labeledBar, label, getContextColor, RESET } from "../colors.js";
import { resolveBarWidth } from "../../utils/terminal.js";
import { t } from "../../i18n/index.js";
import {
  progressLabel,
  type ProgressLabelInput,
} from "./label-align.js";
import { formatTokens, formatContextValue } from "../../utils/format.js";
import { createDebug } from "../../debug.js";

const debug = createDebug("context");

export function renderIdentityLine(
  ctx: RenderContext,
  labelOptions: ProgressLabelInput = {},
): string {
  const autoCompactWindow = ctx.config?.display?.autoCompactWindow ?? null;
  const rawPercent = getContextPercent(ctx.stdin, autoCompactWindow);
  const bufferedPercent = getBufferedPercent(ctx.stdin, autoCompactWindow);
  const autocompactMode = ctx.config?.display?.autocompactBuffer ?? "enabled";
  const percent = autocompactMode === "disabled" ? rawPercent : bufferedPercent;
  const colors = ctx.config?.colors;

  if (autocompactMode === "disabled") {
    debug(
      `autocompactBuffer=disabled, showing raw ${rawPercent}% (buffered would be ${bufferedPercent}%)`,
    );
  }

  const display = ctx.config?.display;
  const contextThresholds = {
    warning: display?.contextWarningThreshold,
    critical: display?.contextCriticalThreshold,
  };
  const contextValueMode = display?.contextValue ?? "percent";
  const contextValue = formatContextValue(ctx, percent, contextValueMode);
  const contextValueDisplay = `${getContextColor(percent, colors, contextThresholds)}${contextValue}${RESET}`;

  // Personal fork addition (Sep 5 2026): barLabelStyle "inline" overlays the
  // context value on the bar itself (labeledBar) instead of printing it after
  // the bar.
  //
  // Only the percent-shaped contextValue modes fit inside a bar this narrow,
  // and they become the label verbatim — writing `${percent}%` here instead
  // would silently show the USED percent to someone who configured
  // contextValue "remaining", i.e. a different number under the same setting.
  // "tokens"/"both" don't fit, so they keep their readout after the bar
  // rather than being dropped on the floor.
  const inlineLabel = display?.barLabelStyle === "inline";
  const barWidth = resolveBarWidth(ctx.config?.barWidth);
  const contextValueFitsInBar =
    contextValueMode === "percent" || contextValueMode === "remaining";

  let line: string;
  if (display?.showContextBar === false) {
    line = `${progressLabel("label.context", colors, labelOptions)} ${contextValueDisplay}`;
  } else if (inlineLabel) {
    const barColor = getContextColor(percent, colors, contextThresholds);
    const inlineText = contextValueFitsInBar ? contextValue : `${Math.round(percent)}%`;
    const bar = labeledBar(percent, barWidth, barColor, inlineText);
    line = contextValueFitsInBar
      ? `${progressLabel("label.context", colors, labelOptions)} ${bar}`
      : `${progressLabel("label.context", colors, labelOptions)} ${bar} ${contextValueDisplay}`;
  } else {
    const bar = coloredBar(percent, barWidth, colors, contextThresholds);
    line = `${progressLabel("label.context", colors, labelOptions)} ${bar} ${contextValueDisplay}`;
  }

  if (display?.showTokenBreakdown !== false && percent >= (display?.contextCriticalThreshold ?? 85)) {
    const usage = ctx.stdin.context_window?.current_usage;
    if (usage) {
      const input = formatTokens(usage.input_tokens ?? 0);
      const cache = formatTokens(
        (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0),
      );
      line += label(
        ` (${t("format.in")}: ${input}, ${t("format.cache")}: ${cache})`,
        colors,
      );
    }
  }

  return line;
}
