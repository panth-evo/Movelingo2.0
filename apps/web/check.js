const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating...');
  await page.goto('http://localhost:3000/onboarding?country=DE', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('CONTENT ERROR SEARCH:');
  if (content.toLowerCase().includes('error')) {
    console.log('Found "error" in text. Dumping body text...');
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text.substring(0, 1000));
  } else {
    console.log('No "error" found in content.');
  }

  await browser.close();
})();
