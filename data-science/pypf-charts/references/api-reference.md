# pypf API Reference

## Module: `pypf.instrument`

### `Security`

Represents a financial instrument with historical price data.

```python
from pypf.instrument import Security

security = Security(
    symbol='AAPL',          # Ticker symbol (required)
    force_download=False,   # Force fresh data download
    force_cache=False,      # Use only cached data (no network)
    interval='1d',          # '1d' (daily), '1wk' (weekly), '1mo' (monthly)
    period=10               # Years of historical data to fetch
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `symbol` | str | required | Stock ticker symbol |
| `force_download` | bool | False | Bypass cache, fetch fresh data |
| `force_cache` | bool | False | Use cache only, no network requests |
| `interval` | str | `'1d'` | Data interval: `'1d'`, `'1wk'`, `'1mo'` |
| `period` | int | 10 | Years of historical data to download |

---

## Module: `pypf.chart`

### `PFChart`

Generates a Point & Figure chart from a Security object.

```python
from pypf.chart import PFChart

chart = PFChart(
    security=security,      # Security object (required)
    duration=1,             # Years of data to chart
    box_size=0.01,          # Percentage box size (0.01 = 1%)
    reversal=3,             # Number of boxes for column reversal
    method='HL',            # 'HL' (High/Low) or 'C' (Close)
    style=False             # Enable ANSI color output
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `security` | Security | required | Security object with price data |
| `duration` | int/float | 1 | Years of data to render on chart |
| `box_size` | float | 0.01 | Box size as decimal percentage |
| `reversal` | int | 3 | Boxes required for column reversal |
| `method` | str | `'HL'` | Charting method: `'HL'` or `'C'` |
| `style` | bool | False | ANSI color/styled output |

### `PFChart.create_chart(dump=True)`

Generate and optionally print the chart.

```python
chart.create_chart(dump=True)   # Print to stdout
chart.create_chart(dump=False)  # Generate without printing
```

---

## Complete Example

```python
from pypf.chart import PFChart
from pypf.instrument import Security

# Multi-ticker analysis
tickers = ['AAPL', 'MSFT', 'GOOGL']

for symbol in tickers:
    security = Security(symbol=symbol, interval='1d', period=5)
    chart = PFChart(
        security=security,
        duration=1,
        box_size=0.01,
        reversal=3,
        method='HL',
        style=True
    )
    print(f"\n{'='*60}")
    print(f"  {symbol} - Point & Figure Chart")
    print(f"{'='*60}")
    chart.create_chart(dump=True)
```

## P&F Chart Concepts

### Box Size
The minimum price movement required to add a new mark. A 1% box size means the price must move at least 1% to register. Smaller boxes = more detail, larger boxes = more filtering.

### Reversal
The number of boxes the price must move in the opposite direction to start a new column. Traditional P&F uses 3-box reversal. Higher values filter out more noise.

### Method
- **HL (High/Low):** Uses the daily high and low prices. More responsive to intraday volatility.
- **C (Close):** Uses only the closing price. Smoother, ignores intraday swings.

### Signals
- **Buy signal:** New column of X's exceeds the previous X column high
- **Sell signal:** New column of O's breaks below the previous O column low
- **Bull confirmed/correction:** Trend context for buy signals
- **Bear confirmed/correction:** Trend context for sell signals
