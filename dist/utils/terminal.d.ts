export declare const UNKNOWN_TERMINAL_WIDTH: null;
export declare const MAX_TERMINAL_WIDTH = 1000;
export declare function getTerminalWidth(options?: {
    preferEnv?: boolean;
    fallback?: number | null;
}): number | null;
export declare function getAdaptiveBarWidth(): number;
export declare function resolveBarWidth(configuredBarWidth: number | null | undefined): number;
//# sourceMappingURL=terminal.d.ts.map