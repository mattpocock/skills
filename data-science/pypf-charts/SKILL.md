---
name: pypf-charts
description: Generate Point & Figure stock charts in the terminal using pypf. Use this skill when the user asks to chart a stock, draw P&F charts, analyze price trends, identify buy/sell signals, or visualize support/resistance with point-and-figure methodology.
version: 1.0.0
author: community
license: MIT
prerequisites:
  commands: [pip]
metadata:
  hermes:
    tags: [Stocks, Technical-Analysis, Point-and-Figure, Charts, Terminal, Finance]
    related_skills: []
---

# Point & Figure Charts with pypf

Generate classic Point & Figure (P&F) stock charts directly in the terminal. P&F charts filter out noise by only plotting significant price movements as columns of X's (rising) and O's (falling), making trend identification and signal detection straightforward.

## When to Use

- User asks to chart a stock ticker (e.g., "chart AAPL", "show me TSLA point and figure")
- Analyzing price trends, support/resistance levels
- Identifying buy/sell signals on a stock
- Comparing chart patterns across multiple tickers
- Quick terminal-based technical analysis without a GUI

## Prerequisites

Install pypf:

```bash
pip install pypf
```

No API keys required — data is fetched from Yahoo Finance automatically.

## Quick Reference

### Basic chart (defaults: 1% box, 3-box reversal, 1 year, High/Low method)

```bash
pf.py pf AAPL
```

### Styled chart with trend lines

```bash
pf.py pf --style --trend-lines MSFT
```

### Custom box size and duration

```bash
pf.py pf --box-size 0.02 --duration 2 GOOGL
```

### Weekly interval with Close method

```bash
pf.py --interval 1wk pf --method C --duration 3 AMZN
```

### Force fresh data download

```bash
pf.py --force-download pf NVDA
```

## CLI Syntax

```
pf.py [global-options] pf [chart-options] SYMBOL
```

### Global options (before `pf`)

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --debug` | Print debug messages | off |
| `--interval INTERVAL` | `1d` daily, `1wk` weekly, `1mo` monthly | `1d` |
| `--force-cache` | Use cached data only (no network) | false |
| `--force-download` | Refresh data even if cached | false |
| `--period PERIOD` | Years of history to download | 10 |
| `--provider PROVIDER` | `yahoo` or `google` | `yahoo` |

### Chart options (after `pf`)

| Flag | Description | Default |
|------|-------------|---------|
| `--box-size SIZE` | Percentage box size (0.01 = 1%) | 0.01 |
| `--duration YEARS` | Years of data to render | 1 |
| `--method METHOD` | `HL` (High/Low) or `C` (Close) | `HL` |
| `--reversal N` | Boxes required for column reversal | 3 |
| `--style` | Enable colored terminal output | false |
| `--trend-lines` | Draw support/resistance lines | false |

## Python API

When the user needs programmatic access or you need to integrate P&F charting into a script:

```python
from pypf.chart import PFChart
from pypf.instrument import Security

# Fetch data
security = Security(
    symbol='AAPL',
    interval='1d',
    period=10
)

# Create chart
chart = PFChart(
    security=security,
    duration=1,
    box_size=0.01,
    reversal=3,
    method='HL',
    style=False
)

# Render to terminal
chart.create_chart(dump=True)
```

## Reading the Output

A typical chart header looks like:

```
BAC  (2017-08-25 o: 23.89 h: 24.07 l: 23.75 c: 23.77)
1.00% box, 3 box reversal, HL method
signal: sell status: bear correction
```

- **Line 1:** Ticker, last data date, OHLC prices
- **Line 2:** Chart parameters
- **Line 3:** Current signal (`buy`/`sell`) and status (`bull confirmed`, `bear correction`, etc.)
- **Chart body:** `x` = rising column, `o`/`d` = falling column, `.` = trend lines, `<<` = current price, digits = months (1-9, a-c for Oct-Dec)

## Common Workflows

### Quick scan of multiple tickers

```bash
for ticker in AAPL MSFT GOOGL AMZN NVDA; do
  echo "=== $ticker ==="
  pf.py pf --style "$ticker"
  echo ""
done
```

### Compare timeframes

```bash
# Short-term (6 months, 0.5% box — more sensitive)
pf.py pf --box-size 0.005 --duration 0.5 AAPL

# Long-term (3 years, 2% box — filters more noise)
pf.py pf --box-size 0.02 --duration 3 AAPL
```

### Weekly chart for swing trading

```bash
pf.py --interval 1wk pf --duration 2 --style --trend-lines SPY
```

## Tips

- Smaller `--box-size` = more detail, more columns. Larger = smoother, fewer reversals.
- `--reversal 3` is traditional. Use `1` for line charts, `5` for very long-term filtering.
- `HL` method uses daily high/low (more responsive). `C` method uses close only (smoother).
- Data is cached locally after first download. Use `--force-download` if charts look stale.
- The `--style` flag adds ANSI colors — useful for quick visual scanning but won't work in non-terminal contexts.
- pypf was last updated in 2017. The Yahoo Finance data fetcher may need patching for current API changes. If downloads fail, try `--force-download` or supply data manually via the Python API.
