export const movingAverageDefinitions: Record<string, string> = {
  'SMA 20':
    'Simple Moving Average over the last 20 trading days (in price units, e.g., $150.00). Short-term trend indicator. Above 20 SMA = short-term bullish.',
  'SMA 50':
    'Simple Moving Average over the last 50 trading days (in price units). Medium-term trend indicator. Widely used by institutions.',
  'SMA 100':
    'Simple Moving Average over the last 100 trading days (in price units). Medium-long term trend indicator.',
  'SMA 200':
    'Simple Moving Average over the last 200 trading days (in price units). Long-term trend indicator. Price above 200 SMA = long-term bullish.',
};

export const momentumDefinitions: Record<string, string> = {
  'RSI 14':
    'Relative Strength Index over 14 periods (scale 0-100). >70 = overbought (possible pullback), <30 = oversold (possible bounce). Below 50 = bearish, above 50 = bullish.',
  MACD: 'Moving Average Convergence Divergence (in price units, e.g., +2.50 means short-term MA is $2.50 above long-term MA). Positive MACD = bullish momentum.',
};

export const volatilityDefinitions: Record<string, string> = {
  'ATR 14':
    'Average True Range over 14 periods (in price units, e.g., $3.59 means the stock moves ~$3.59 per day on average). Higher ATR = more volatile stock.',
  'Volatility 30D':
    '30-day annualized volatility (shown as percentage, e.g., 17% means the stock has historically fluctuated 17% annually). Higher = more volatile.',
  'Volatility 90D': '90-day annualized volatility (shown as percentage). Higher = more volatile.',
};

export const profitabilityDefinitions: Record<string, string> = {
  ROE: 'Return on Equity (shown as %). Net income / Shareholder Equity. Measures efficiency at generating profits from shareholder money. >15% = good, >20% = excellent.',
  'Profit Margin':
    'Net profit / Revenue (shown as %). Percentage of revenue that becomes profit. Higher is better, but banking ~15-20% is solid, tech can be 20%+.',
};

export const valuationDefinitions: Record<string, string> = {
  'P/E Ratio (TTM)':
    'Price / Earnings per share (ratio, e.g., 20x means you pay $20 for $1 of earnings). Lower may = undervalued, higher may = overvalued. Varies by industry.',
  'Forward P/E':
    'Price / Expected future EPS (ratio). Uses analyst estimates for next 12 months. Lower = potentially cheaper vs future earnings.',
  'PEG Ratio':
    'P/E / Growth Rate (ratio). <1 may indicate undervalued, 1-2 = fairly valued, >2 may indicate overvalued. Growth is annual %.',
};

export const financialStrengthDefinitions: Record<string, string> = {
  'Debt-to-Equity':
    'Total Debt / Total Equity (ratio, e.g., 0.5 means 50 cents debt per $1 equity). <1 is generally conservative, >2 may indicate high leverage.',
  'Dividend Yield':
    "Annual Dividends / Stock Price (shown as %). Income return from dividends. 2-5% is typical. Higher isn't always better - check sustainability.",
};

export const growthDefinitions: Record<string, string> = {
  'Revenue Growth':
    "Year-over-year % change in total revenue. >10% = strong growth. Varies by company stage (startups may grow faster but aren't profitable).",
};

export const liquidityValuationDefinitions: Record<string, string> = {
  'Enterprise Value':
    'Market Cap + Debt - Cash (in billions, e.g., $50B). What it would cost to buy the whole company.',
  'Price/Book':
    'Stock price / Book value per share (ratio, e.g., 3x). <1 may = undervalued, >3 may = overvalued. Common for banks.',
  'Price/Sales':
    'Stock price / Revenue per share (ratio). Varies by industry; lower generally better. SaaS companies often trade at 10-20x.',
  'EV/EBITDA':
    'Enterprise Value / EBITDA (ratio). <10 generally considered good/cheap, >15 may be expensive.',
  'Trailing PEG': 'P/E ratio / Expected earnings growth (ratio). <1 may indicate undervalued.',
};

export const earningsDefinitions: Record<string, string> = {
  'EPS (TTM)':
    'Earnings Per Share Trailing Twelve Months (in dollars, e.g., $2.50). Actual reported earnings over the last 12 months.',
  'Forward EPS':
    'Expected EPS over next 12 months (in dollars, e.g., $5.00). Analyst consensus estimates.',
  'Book Value':
    'Total assets - Total liabilities per share (in dollars). Represents intrinsic value.',
  'Book/Share': 'Book value per share (in dollars, same as above).',
  'Earnings Growth': 'Year-over-year % change in earnings. Positive = growing profits.',
  'Quarterly Growth': 'Quarter-over-quarter % change in earnings. Shows momentum.',
};

export const marginsDefinitions: Record<string, string> = {
  'Return on Assets':
    'Net income / Total assets (shown as %). Efficiency at using assets. >5% = good.',
  'Return on Investment':
    'Net income / Total investments (shown as %). Similar to ROE but for all capital.',
  'Gross Margins':
    '(Revenue - COGS) / Revenue (shown as %). Profitability before operating costs. >40% = strong, <20% = low margin industry.',
  'Operating Margins':
    'Operating income / Revenue (shown as %). Profitability from core ops. 15-20% = healthy.',
};

export const financialHealthDefinitions: Record<string, string> = {
  EBITDA:
    'Earnings Before Interest, Taxes, Depreciation & Amortization (in billions). Shows operating cash flow. Higher = more profitable core business.',
  'Total Cash': 'Total cash on hand (in billions). Buffer for emergencies or acquisitions.',
  'Total Debt': 'Total debt outstanding (in billions). Higher debt = more financial risk.',
  'Current Ratio':
    'Current Assets / Current Liabilities. >1.5 = healthy liquidity, <1 = may struggle to pay bills.',
  'Quick Ratio':
    '(Current Assets - Inventory) / Current Liabilities. Strict liquidity measure without relying on inventory.',
  'Payout Ratio':
    'Dividends paid / Earnings (shown as %). High (>80%) may be unsustainable. Low (<30%) suggests room to increase dividends.',
  'Cash/Share':
    'Total cash divided by shares outstanding (in dollars). Cash per share indicates financial flexibility.',
  'Operating Cash Flow':
    'Cash generated from core business operations (in billions). Includes all operating expenses but NOT capital expenditures.',
  'Free Cash Flow':
    'Operating Cash Flow minus Capital Expenditures (in billions). What remains after investing in assets. Higher = more value generated for shareholders.',
};

export const marketDataDefinitions: Record<string, string> = {
  'Previous Close':
    "Most recent closing price before today (in dollars). Yesterday's final market price.",
  'Day High': 'Highest price traded during the current trading session (in dollars).',
  'Day Low': 'Lowest price traded during the current trading session (in dollars).',
  Bid: 'Highest price a buyer is willing to pay for shares right now (in dollars).',
  Ask: 'Lowest price a seller is willing to accept for shares right now (in dollars).',
  Volume:
    'Total shares traded today (e.g., 5.2M = 5.2 million shares). Higher volume = more liquid.',
  'Avg Volume': 'Average daily volume over recent sessions. Shows typical trading activity.',
  '52W High': 'Highest price in the past 52 weeks (in dollars).',
  '52W Low': 'Lowest price in the past 52 weeks (in dollars).',
};

export const analystDefinitions: Record<string, string> = {
  'Analyst Opinions':
    'Number of Wall Street analysts covering this stock. More opinions = more coverage.',
  Recommendation: 'Wall Street consensus: Strong Buy, Buy, Hold, Underperform, Sell.',
  'Rec. Mean':
    'Average analyst rating (1=Strong Buy, 2=Buy, 3=Hold, 4=Underperform, 5=Sell). Lower = more bullish.',
  'Avg Analyst Rating': 'Human-readable analyst consensus (e.g., "1.9 - Buy").',
  'Target High':
    'Highest price target from analysts (in dollars). Upside potential if targets are met.',
  'Target Low':
    'Lowest price target from analysts (in dollars). Downside risk if targets are missed.',
  '50D Avg':
    '50-day moving average price. Short-term trend line. Price above = short-term bullish.',
  '200D Avg':
    '200-day moving average price. Long-term trend line. Price above = long-term bullish.',
};

export const shortInterestDefinitions: Record<string, string> = {
  'Shares Short':
    'Number of shares currently sold short (e.g., 229M = 229 million shares). High short interest = bearish bets against stock.',
  'Short Ratio':
    'Days to cover short positions (shares short / avg daily volume). Higher = harder to close shorts, potential squeeze.',
  'Short % of Float':
    'Percentage of float shares that are shorted. High % = significant bearish sentiment, risk of short squeeze.',
  'Float Shares':
    'Shares available for public trading (in millions). Excludes insider/restricted shares.',
  'Trailing Ann. Div. Rate':
    'Sum of dividends paid over the past 12 months (in $/share). Actual dividends received.',
  'Trailing Ann. Div. Yield':
    'Trailing 12-month dividends / current price (in %). Actual dividend return received (NVDA: 0.04/177.39 = 0.023%).',
  '5Y Avg Div. Yield':
    '5-year average dividend yield (in %). Useful for comparing current yield to historical yield.',
};

export const performanceDefinitions: Record<string, string> = {
  '52W Change': 'Percentage price change over the past 52 weeks. Positive = price appreciation.',
  'S&P 52W Change':
    'S&P 500 index percentage change over the same 52-week period. Compare stock performance vs market.',
  'All-Time High':
    'Highest price this stock has ever traded at (historical). Current price is X% below ATH.',
  'All-Time Low':
    'Lowest price this stock has ever traded at (historical). Current price is X% above ATL.',
};

export const ownershipDefinitions: Record<string, string> = {
  'Shares Outstanding':
    'Total shares currently in existence (in millions). Used to calculate market cap.',
  'Revenue/Share':
    'Total revenue / shares outstanding (in dollars). Higher = more efficient at generating revenue.',
  'Insider Ownership':
    'Percentage of shares held by company insiders (executives, directors). High = insiders confident.',
  'Institutional Ownership':
    'Percentage of shares held by funds/pension plans. High = professional confidence.',
};
