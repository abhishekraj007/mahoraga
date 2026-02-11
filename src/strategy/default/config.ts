/**
 * Default Strategy Configuration
 *
 * SOURCE_CONFIG: How much to trust each data source
 * DEFAULT_CONFIG: Base trading parameters
 * DEFAULT_STATE: Initial state for a fresh agent
 */

import type { AgentConfig, AgentState } from "../../core/types";

// ── Source weights & tuning ──────────────────────────────────────────────────

export const SOURCE_CONFIG = {
  weights: {
    stocktwits: 0.85,
    reddit_wallstreetbets: 0.6,
    reddit_stocks: 0.9,
    reddit_investing: 0.8,
    reddit_options: 0.85,
    twitter_fintwit: 0.95,
    twitter_news: 0.9,
    sec_8k: 0.95,
    sec_4: 0.9,
    sec_13f: 0.7,
  },
  flairMultipliers: {
    DD: 1.5,
    "Technical Analysis": 1.3,
    Fundamentals: 1.3,
    News: 1.2,
    Discussion: 1.0,
    Chart: 1.1,
    "Daily Discussion": 0.7,
    "Weekend Discussion": 0.6,
    YOLO: 0.6,
    Gain: 0.5,
    Loss: 0.5,
    Meme: 0.4,
    Shitpost: 0.3,
  } as Record<string, number>,
  engagement: {
    upvotes: { 1000: 1.5, 500: 1.3, 200: 1.2, 100: 1.1, 50: 1.0, 0: 0.8 } as Record<number, number>,
    comments: { 200: 1.4, 100: 1.25, 50: 1.15, 20: 1.05, 0: 0.9 } as Record<number, number>,
  },
  decayHalfLifeMinutes: 120,
};

// ── Default agent configuration ──────────────────────────────────────────────

export const DEFAULT_CONFIG: AgentConfig = {
  data_poll_interval_ms: 30_000,
  analyst_interval_ms: 120_000,
  premarket_plan_window_minutes: 5,
  market_open_execute_window_minutes: 2,
  max_position_value: 2, // [TUNE] $2 max per trade — trading as if we have $100
  max_positions: 5, // [TUNE] 5 positions x $2 = $10 max exposure
  min_sentiment_score: 0.25, // [TUNE] Lowered from 0.3 — catch more signals early
  min_analyst_confidence: 0.55, // [TUNE] Lowered from 0.6 — let the smarter analyst model make the call
  take_profit_pct: 12, // [TUNE] Increased from 10 — let winners run a bit longer
  stop_loss_pct: 4, // [TUNE] Tightened from 5 — cut losers faster
  position_size_pct_of_cash: 2, // [TUNE] 2% of cash per position — micro sizing for $100 budget
  stale_position_enabled: true,
  stale_min_hold_hours: 18, // [TUNE] Reduced from 24 — exit stale positions sooner
  stale_max_hold_days: 3,
  stale_min_gain_pct: 5,
  stale_mid_hold_days: 2,
  stale_mid_min_gain_pct: 3,
  stale_social_volume_decay: 0.3,

  // LLM Configuration — ai-sdk mode enables multi-provider routing
  // Research model: cheap + fast for bulk signal analysis
  // Analyst model: smartest available for final BUY/SELL/HOLD decisions
  llm_provider: "ai-sdk",
  llm_model: "openai/gpt-4o-mini", // Research: cheap, handles bulk sentiment analysis
  llm_analyst_model: "openai/gpt-4o", // Analyst: best available with OpenAI key
  // UPGRADE: When you add ANTHROPIC_API_KEY, change analyst to:
  //   "anthropic/claude-sonnet-4-0"  (great value, strong trading reasoning)
  //   "anthropic/claude-opus-4-1"    (THE BEST for trading — 72% perfect score in benchmarks)
  llm_min_hold_minutes: 30,

  options_enabled: false,
  options_min_confidence: 0.8,
  options_max_pct_per_trade: 0.02,
  options_min_dte: 30,
  options_max_dte: 60,
  options_target_delta: 0.45,
  options_min_delta: 0.3,
  options_max_delta: 0.7,
  options_stop_loss_pct: 50,
  options_take_profit_pct: 100,

  // Crypto — enabled for 24/7 trading (markets never sleep)
  crypto_enabled: true, // [TOGGLE] Enabled — trade crypto around the clock
  crypto_symbols: ["BTC/USD", "ETH/USD", "SOL/USD"],
  crypto_momentum_threshold: 2.0,
  crypto_max_position_value: 2, // [TUNE] $2 max per crypto trade
  crypto_take_profit_pct: 10,
  crypto_stop_loss_pct: 5,

  ticker_blacklist: [],
  allowed_exchanges: ["NYSE", "NASDAQ", "ARCA", "AMEX", "BATS"],
};

// ── Default agent state ──────────────────────────────────────────────────────

export const DEFAULT_STATE: AgentState = {
  config: DEFAULT_CONFIG,
  signalCache: [],
  positionEntries: {},
  socialHistory: {},
  socialSnapshotCache: {},
  socialSnapshotCacheUpdatedAt: 0,
  logs: [],
  costTracker: { total_usd: 0, calls: 0, tokens_in: 0, tokens_out: 0 },
  lastDataGatherRun: 0,
  lastAnalystRun: 0,
  lastResearchRun: 0,
  lastPositionResearchRun: 0,
  signalResearch: {},
  positionResearch: {},
  stalenessAnalysis: {},
  twitterConfirmations: {},
  twitterDailyReads: 0,
  twitterDailyReadReset: 0,
  lastKnownNextOpenMs: null,
  premarketPlan: null,
  lastPremarketPlanDayEt: null,
  lastClockIsOpen: null,
  enabled: false,
};
