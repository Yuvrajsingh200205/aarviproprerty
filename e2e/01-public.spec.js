const { test, expect } = require('@playwright/test');

// navigate and wait for streamed content / hydration to settle
const go = async (page, url) => {
  const res = await page.goto(url);
  await page.waitForLoadState('networkidle');
  return res;
};

test.describe('public website', () => {
  test('home page renders hero, sections, footer', async ({ page }) => {
    await go(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/biggest move/i);
    await expect(page.getByRole('heading', { name: 'New Launched Properties' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Residential Properties' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Developers' })).toBeVisible();
    await expect(page.locator('footer')).toContainText('Quick Links');
    // project cards link to detail pages
    await expect(page.locator('a[href^="/projects/"]').first()).toBeVisible();
  });

  test('home page does not repeat the same project in consecutive sections', async ({ page }) => {
    await go(page, '/');
    const hrefs = await page.locator('main a[href^="/projects/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    const firstRow = new Set(hrefs.slice(0, 9));
    const rest = hrefs.slice(9, 17);
    expect(rest.length).toBeGreaterThan(0);
    expect(rest.some((h) => firstRow.has(h))).toBe(false);
    // "New Launch" is not stamped on every card
    const badges = await page.getByText('New Launch', { exact: true }).count();
    const cards = hrefs.length;
    expect(badges).toBeLessThan(cards);
  });

  test('hero is animated: headline words, rotating keyword, skyline', async ({ page }) => {
    await go(page, '/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('biggest move');
    // headline is split into per-word spans but still reads as one sentence
    expect(await h1.locator('span.animate-word-in').count()).toBeGreaterThan(3);
    await expect(page.locator('svg[viewBox="0 0 1200 200"]')).toBeVisible();
    const word = page.locator('p:has-text("Discover") span.text-shimmer');
    const first = await word.innerText();
    await expect.poll(async () => word.innerText(), { timeout: 8000 }).not.toBe(first);
  });

  test('stats counters animate up to their final value', async ({ page }) => {
    await go(page, '/');
    const counter = page.locator('span[aria-label="1000+"]');
    await counter.scrollIntoViewIfNeeded();
    await expect(counter).toHaveText('1000+', { timeout: 6000 });
  });

  test('save projects with the heart, see them on /saved, remove them', async ({ page }) => {
    await go(page, '/projects');
    const hearts = page.getByRole('button', { name: /^Save / });
    await hearts.nth(0).click();
    await hearts.nth(1).click();
    await expect(page.getByRole('link', { name: 'Saved projects (2)' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Remove .* from saved/ })).toHaveCount(2);

    // persists across navigation + reload
    await page.reload();
    await expect(page.getByRole('link', { name: 'Saved projects (2)' })).toBeVisible();

    await page.getByRole('link', { name: 'Saved projects (2)' }).click();
    await expect(page).toHaveURL(/\/saved$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Saved Projects');
    await expect(page.locator('main a[href^="/projects/"]')).toHaveCount(2);

    await page.getByRole('button', { name: /^Remove .* from saved/ }).first().click();
    await expect(page.locator('main a[href^="/projects/"]')).toHaveCount(1);
    await page.getByRole('button', { name: /^Remove .* from saved/ }).first().click();
    await expect(page.getByText('You have not saved any projects yet.')).toBeVisible();
  });

  test('EMI calculator responds to the sliders', async ({ page }) => {
    await go(page, '/projects/godrej-verano');
    const emi = page.getByTestId('emi-value');
    await emi.scrollIntoViewIfNeeded();
    const before = await emi.innerText();
    expect(before).toMatch(/^₹ [\d,]+$/);
    // default: 1 Cr @ 8.5% for 20 yrs  ->  about 86,782
    expect(Number(before.replace(/[^\d]/g, ''))).toBeGreaterThan(86000);
    expect(Number(before.replace(/[^\d]/g, ''))).toBeLessThan(87500);
    const amount = page.getByLabel('Loan amount');
    await amount.fill('20000000');
    await expect.poll(async () => Number((await emi.innerText()).replace(/[^\d]/g, ''))).toBeGreaterThan(170000);
    await page.getByLabel('Tenure').fill('10');
    await expect.poll(async () => Number((await emi.innerText()).replace(/[^\d]/g, ''))).toBeGreaterThan(240000);
  });

  test('back-to-top button and scroll progress bar', async ({ page }) => {
    await go(page, '/');
    const top = page.getByRole('button', { name: 'Back to top' });
    await expect(top).toHaveCSS('opacity', '0');
    await page.evaluate(() => window.scrollTo(0, 2500));
    await expect(top).toHaveCSS('opacity', '1');
    await top.click();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });

  test('hero search filters projects by location + property type', async ({ page }) => {
    await go(page, '/');
    const form = page.getByRole('search', { name: 'Search properties' });
    await form.getByLabel('Location').selectOption({ label: 'Dwarka Expressway' });
    await form.getByLabel('Property type').selectOption({ label: 'Commercial' });
    await form.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/location=dwarka-expressway/);
    await expect(page).toHaveURL(/property=commercial/);
    await expect(page.getByText(/\d+ projects? found/)).toBeVisible();
    const cards = page.locator('a[href^="/projects/"]');
    expect(await cards.count()).toBeGreaterThan(0);
    for (const c of await page.locator('a[href^="/projects/"] >> text=Commercial').all()) {
      await expect(c).toBeVisible();
    }
  });

  test('reference-style URL, keyword search and empty state', async ({ page }) => {
    await go(page, '/projects?location=&property=Residential-Plots&projecttype=&search=');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Residential Plots');
    await expect(page.getByText(/\d+ projects? found/)).toBeVisible();

    await go(page, '/projects?search=verano');
    await expect(page.getByRole('link', { name: /Godrej Verano/ }).first()).toBeVisible();

    await go(page, '/projects?search=zzzzqqqq');
    await expect(page.getByText('No projects match your search.')).toBeVisible();
    await page.getByRole('link', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('pagination works', async ({ page }) => {
    await go(page, '/projects');
    await expect(page.getByText(/\d+ projects found/)).toBeVisible();
    await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: '2', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('a[href^="/projects/"]').first()).toBeVisible();
  });

  test('project detail page content + enquiry form validation and submit', async ({ page }) => {
    await go(page, '/projects/godrej-verano');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Godrej Verano');
    await expect(page.getByText('Golf Course Ext Road').first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Project sections' })).toContainText('Overview');

    const form = page.getByRole('complementary').getByRole('form', { name: 'Quick Enquiry' });
    await form.getByRole('button', { name: 'Submit' }).click();
    await expect(form.getByText('Please enter your name')).toBeVisible();
    await expect(form.getByText('Enter a valid phone number')).toBeVisible();

    await form.getByLabel('Name*').fill('E2E Buyer');
    await form.getByLabel('Phone*').fill('+91 98765 43210');
    await form.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Your enquiry has been received')).toBeVisible();
  });

  test('header Enquire Now modal submits and closes with Escape', async ({ page }) => {
    await go(page, '/about');
    await page.getByRole('banner').getByRole('button', { name: 'Enquire Now' }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();

    await page.getByRole('banner').getByRole('button', { name: 'Enquire Now' }).click();
    await dlg.getByLabel('Name*').fill('E2E Modal User');
    await dlg.getByLabel('Phone*').fill('9876500001');
    await dlg.getByLabel('Email').fill('modal@example.com');
    await dlg.getByLabel('Message').fill('Please share brochure');
    await dlg.getByRole('button', { name: 'Submit' }).click();
    await expect(dlg.getByText('Thank you!')).toBeVisible();
  });

  test('footer instant callback and contact form', async ({ page }) => {
    await go(page, '/contact');
    const cb = page.locator('footer').getByRole('form', { name: 'Instant Callback' });
    await cb.getByLabel('Name*').fill('E2E Callback');
    await cb.getByLabel('Phone*').fill('9876500002');
    await cb.getByRole('button', { name: 'Request Callback' }).click();
    await expect(page.locator('footer').getByText('Thank you!')).toBeVisible();

    const form = page.getByRole('main').getByRole('form', { name: 'Contact Form' });
    await form.getByLabel('Name*').fill('E2E Contact');
    await form.getByLabel('Phone*').fill('9876500003');
    await form.getByLabel('Interested in').selectOption('Commercial');
    await form.getByLabel('Message').fill('Need office space');
    await form.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('main').getByText('Thank you!')).toBeVisible();
  });

  test('static pages, developers, blogs and 404', async ({ page }) => {
    await go(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await go(page, '/privacy-policy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' }).first()).toBeVisible();
    await go(page, '/terms-and-conditions');
    await expect(page.getByRole('heading', { name: /Terms/ }).first()).toBeVisible();

    await go(page, '/developers');
    await page.locator('a[href="/developers/dlf"]').click();
    await expect(page).toHaveURL(/\/developers\/dlf$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('DLF');

    await go(page, '/blogs');
    await page.locator('a[href^="/blogs/"]').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const res = await go(page, '/projects/this-does-not-exist');
    expect(res.status()).toBe(404);
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('mobile menu works at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await go(page, '/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Developers' }).click();
    await expect(page).toHaveURL(/\/developers$/);
    // no horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });
});
