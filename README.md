# Playwright Agent Demo

This project shows how to drive Google Search with Playwright while mimicking human behaviour (typing speed, scrolling, cursor movement, retries, persistent browser profile, etc.). Running the script saves the top results to `results.json`, which you can inspect or feed into other tools.

## Prerequisites
- Node.js 18+ (Playwright requires fairly recent Node versions)
- Git (optional but recommended)
- A Chrome-compatible browser; Playwright will download its own build on first install

## Installation
```bash
git clone https://github.com/spxeas/playwright-agent.git
cd playwright-agent
npm install
```

If you already have the files locally, simply run `npm install` inside the project directory.

## Usage
### Basic run
```bash
node agent.js "Playwright 自動化"
```
This launches Chromium in headed mode, types the query using human-like delays, scrolls the results page, then writes the captured titles/links to `results.json`.

### Options
Adjust these options inside `agent.js` when calling `searchGoogle`:
- `headless`: set to `true` to run without a visible browser window.
- `usePersistent`: `true` loads/saves a persistent profile under `./user-data`, keeping cookies/history for a more organic footprint.
- `profilePath`: change if you want the persistent profile elsewhere.
- `maxRetries`: number of retry attempts when navigation fails.
- `timeout`: navigation timeout in milliseconds.

## Output
Each run overwrites `results.json` with a structure like:
```json
{
  "query": "Playwright 自動化",
  "results": [
    { "title": "Example result", "href": "https://example.com" }
  ],
  "ts": "2024-01-01T12:00:00.000Z"
}
```

## Notes
- `user-data/` is generated when `usePersistent` is enabled; keep it between runs if you want to reuse cookies.
- The script includes basic consent-handling for Google's cookie banner, but regional variations might require manual tweaks.
- For production use, consider adding error handling, logging, and respecting Google's terms of service.
