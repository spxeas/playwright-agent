// agent_humanized.js
const { chromium } = require('playwright');
const fs = require('fs').promises;

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function humanType(page, selector, text) {
  for (const ch of text) {
    await page.type(selector, ch, { delay: rand(80, 180) }); // 每字 80-180ms
  }
}

async function humanScrollAndMove(page) {
  // 隨機滾動、滑鼠移動以模擬人類行為
  const h = await page.evaluate(() => document.body.scrollHeight);
  const steps = rand(2, 5);
  for (let i = 0; i < steps; i++) {
    const y = Math.floor((h / steps) * i + Math.random() * 200);
    await page.mouse.wheel(0, y);
    await page.mouse.move(rand(100, 600), rand(100, 600));
    await sleep(rand(300, 1200));
  }
}

async function searchGoogle(query, opts = {}) {
  const {
    headless = false,
    usePersistent = false,
    profilePath = './user-data',
    maxRetries = 2,
    timeout = 30000
  } = opts;

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const launchArgs = { headless };
      // 建議在開發測試時用 headful 模式 (headless:false)
      let context;
      if (usePersistent) {
        // 使用瀏覽器使用者資料，會帶 cookie / history，看起來更像真人
        context = await chromium.launchPersistentContext(profilePath, {
          headless,
          viewport: { width: 1280, height: 800 },
        });
      } else {
        const browser = await chromium.launch(launchArgs);
        context = await browser.newContext({
          viewport: { width: 1280, height: 800 },
        });
      }

      // 設 user agent（可自訂）
      await context.addInitScript(() => {
        // 沒有改 userAgent 的情況下 Playwright 會自動注入一些偵測用 hook
      });
      const page = await context.newPage();

      // 避免太乾淨的環境：可嘗試載入一些常見網站（可選）
      // await page.goto('https://example.com');

      // 前往 Google
      await page.goto('https://www.google.com', { timeout });

      // 若有 Cookie 提示或同意按鈕，嘗試點選（簡單處理）
      try {
        const agreeBtn = await page.$('button:has-text("我同意"), button:has-text("I agree"), button:has-text("接受")');
        if (agreeBtn) {
          await agreeBtn.click();
          await sleep(rand(500, 1500));
        }
      } catch (e) { /* ignore */ }

      // 聚焦搜尋欄並人類化輸入
      const searchSelector = 'input[name="q"], textarea[name="q"]';
      await page.waitForSelector(searchSelector, { timeout: 10000 });
      await page.click(searchSelector);
      await sleep(rand(300, 800));
      await humanType(page, searchSelector, query);
      await sleep(rand(300, 700));

      // 模擬滑鼠移動再按 Enter
      await page.mouse.move(rand(200, 600), rand(200, 600), { steps: rand(8, 20) });
      await sleep(rand(200, 700));
      await page.keyboard.press('Enter');

      // 等搜尋結果出來
      await page.waitForSelector('#search, #rso', { timeout: 15000 });

      // 小幅滾動與模擬互動
      await humanScrollAndMove(page);

      // 抓取前 N 個搜尋標題與連結
      const results = await page.$$eval('#search a h3', nodes => {
        return nodes.slice(0, 10).map(h3 => {
          const a = h3.closest('a');
          return { title: h3.innerText, href: a ? a.href : null };
        });
      });

      // 儲存與關閉
      await fs.writeFile('results.json', JSON.stringify({ query, results, ts: new Date().toISOString() }, null, 2));
      console.log('✅ done — results.json saved');
      // 如果是 persistent context，context.close() 也會關閉瀏覽器
      await context.close();
      return results;
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed: ${err.message}`);
      attempt++;
      if (attempt > maxRetries) {
        throw new Error('All retries failed: ' + err.message);
      }
      // backoff 等待後重試
      await sleep(1000 * attempt + rand(500, 1500));
    }
  }
}

// 若直接執行此檔
if (require.main === module) {
  const query = process.argv.slice(2).join(' ') || 'Playwright 自動化';
  searchGoogle(query, {
    headless: false,
    usePersistent: true,   // true 表示會使用 ./user-data 作為 chrome profile（可改路徑）
    profilePath: './user-data',
    maxRetries: 2
  }).catch(e => {
    console.error('Fatal error:', e);
  });
}

module.exports = { searchGoogle };
