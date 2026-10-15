const path = require('path');
const { test, expect } = require('@playwright/test');

// navigate and wait for streamed content / hydration to settle
const go = async (page, url) => {
  const res = await page.goto(url);
  await page.waitForLoadState('networkidle');
  return res;
};

const EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@aarviproperty.com';
const PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@12345';
const PNG = path.join(__dirname, 'fixtures', 'photo.png');
const PDF = path.join(__dirname, 'fixtures', 'brochure.pdf');
const RUN = Date.now().toString().slice(-6);
const CAT = `E2E Category ${RUN}`;
const LOC = `E2E Location ${RUN}`;
const DEV = `E2E Developer ${RUN}`;
const PROJ = `E2E Tower ${RUN}`;
const BLOG = `E2E Blog Post ${RUN}`;
const REVIEW = `E2E happy customer ${RUN}`;
const LEAD = `E2E Brochure Lead ${RUN}`;

async function login(page, email = EMAIL, password = PASSWORD, { expectSuccess = true } = {}) {
  await go(page, '/admin/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  if (expectSuccess) await page.waitForURL(/\/admin$/);
}

const row = (page, text) => page.getByRole('row').filter({ hasText: text });

test.describe.configure({ mode: 'serial' });

test.describe('admin panel', () => {
  test('protected routes redirect to login', async ({ page }) => {
    await go(page, '/admin/projects');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('wrong password shows error, right password opens dashboard', async ({ page }) => {
    await login(page, EMAIL, 'wrong-password', { expectSuccess: false });
    await expect(page.locator('p[role=alert]')).toContainText(/invalid email or password/i);
    await login(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Latest enquiries')).toBeVisible();
    await expect(page.getByRole('link', { name: /Projects/ }).first()).toBeVisible();
  });

  test('dashboard shows the enquiries created by public tests', async ({ page }) => {
    await login(page);
    await go(page, '/admin/enquiries');
    await page.getByLabel('Search enquiries', { exact: true }).fill('E2E');
    await expect(page.getByRole('row').filter({ hasText: 'E2E Buyer' }).first()).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'E2E Callback' }).first()).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Brochure' }).or(page.getByRole('row').filter({ hasText: 'Contact Form' })).first()).toBeVisible();
  });

  test('new project form: category starts empty and is validated; oversize upload is rejected clearly', async ({ page }) => {
    await login(page);
    await go(page, '/admin/projects/new');
    await expect(page.getByLabel(/Property category/)).toHaveValue('');
    await page.locator('#f-name').fill(`E2E Validation ${RUN}`);
    await page.getByRole('button', { name: 'Save project' }).first().click();
    // browser-native validation blocks the submit: still on the "new" page and the select is invalid
    await expect(page).toHaveURL(/\/admin\/projects\/new$/);
    expect(await page.getByLabel(/Property category/).evaluate((el) => el.checkValidity())).toBe(false);

    // 16 MB file is over the 15 MB limit -> readable error, not a crash
    await page.locator('section', { hasText: 'Main image' }).locator('input[type=file]').first()
      .setInputFiles({ name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(16 * 1024 * 1024, 1) });
    await expect(page.getByText('File is too large').first()).toBeVisible();
    // non-image file is rejected too
    await page.locator('section', { hasText: 'Main image' }).locator('input[type=file]').first()
      .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
    await expect(page.getByText(/Only JPG, PNG/).first()).toBeVisible();
  });

  test('create category, location, developer', async ({ page }) => {
    await login(page);

    await go(page, '/admin/categories');
    await page.getByRole('button', { name: 'Add category' }).click();
    const dlg = page.getByRole('dialog');
    await dlg.locator('#f-name').fill(CAT);
    await dlg.locator('#f-description').fill('Created by e2e');
    await dlg.getByRole('button', { name: 'Save' }).click();
    await expect(row(page, CAT)).toBeVisible();

    await go(page, '/admin/locations');
    await page.getByRole('button', { name: 'Add location' }).click();
    await page.getByRole('dialog').locator('#f-name').fill(LOC);
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
    await expect(row(page, LOC)).toBeVisible();

    await go(page, '/admin/developers');
    await page.getByRole('button', { name: 'Add developer' }).click();
    const d = page.getByRole('dialog');
    await d.locator('#f-name').fill(DEV);
    await d.locator('input[type=file]').first().setInputFiles(PNG); // logo upload
    await expect(d.getByText(/\/uploads\/.*\.png/)).toBeVisible();
    await d.getByRole('button', { name: 'Save' }).click();
    await expect(row(page, DEV)).toBeVisible();
  });

  test('create project with image, brochure, tags; it appears on the public site', async ({ page }) => {
    await login(page);
    await go(page, '/admin/projects/new');
    await page.locator('#f-name').fill(PROJ);
    await page.getByLabel(/Property category/).selectOption({ label: CAT });
    await page.getByLabel('Location', { exact: true }).selectOption({ label: LOC });
    await page.getByLabel('Developer', { exact: true }).selectOption({ label: DEV });
    await page.getByLabel('Sector / locality', { exact: true }).fill('Sector 99');
    await page.getByLabel('RERA number', { exact: true }).fill('RERA-E2E-123');
    await page.getByLabel('Configuration', { exact: true }).fill('3/4 BHK');
    await page.getByLabel('Project size', { exact: true }).fill('1800-2400 Sqft');
    await page.getByLabel('Price', { exact: true }).fill('3.5 Cr onwards');
    await page.getByLabel('Short description', { exact: true }).fill('A test tower created by the e2e suite.');
    await page.getByLabel('Overview (Markdown)', { exact: true }).fill('## Welcome\n\nThis is **bold** overview text.');

    const amenities = page.getByPlaceholder('Add amenity and press Enter');
    await amenities.fill('Rooftop Pool');
    await amenities.press('Enter');
    await amenities.fill('Sky Lounge, Co-working');
    await amenities.press('Enter');

    await page.getByRole('button', { name: 'Add landmark' }).click();
    await page.getByPlaceholder('Metro station').fill('Metro Station');
    await page.getByPlaceholder('2 km').fill('1.5 km');

    await page.getByRole('button', { name: 'Add FAQ' }).click();
    await page.getByLabel('Question', { exact: true }).fill('Is it RERA registered?');
    await page.getByLabel('Answer', { exact: true }).fill('Yes, registered.');

    const mainImage = page.locator('section', { hasText: 'Main image' }).locator('input[type=file]').first();
    await mainImage.setInputFiles(PNG);
    await expect(page.getByText(/\/uploads\/photo-.*\.png/).first()).toBeVisible();
    await page.locator('section', { hasText: 'Brochure (PDF)' }).locator('input[accept="application/pdf"]').setInputFiles(PDF);
    await expect(page.getByText(/\/uploads\/brochure-.*\.pdf/)).toBeVisible();
    await page.locator('section', { hasText: 'Gallery images' }).locator('input[multiple]').setInputFiles([PNG, PNG]);
    // Media section previews: 1 main image + 2 gallery images
    await expect(page.locator('section', { hasText: 'Gallery images' }).locator('img')).toHaveCount(3);

    await page.getByLabel(/Show in “New Launched Properties”/).check();
    await page.getByRole('button', { name: 'Save project' }).first().click();
    await expect(page).toHaveURL(/\/admin\/projects\/[a-f0-9]{24}$/);

    // public page
    const slug = `e2e-tower-${RUN}`;
    await go(page, `/projects/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PROJ);
    await expect(page.getByText('RERA-E2E-123')).toBeVisible();
    await expect(page.getByText('3.5 Cr onwards').first()).toBeVisible();
    await expect(page.getByText('Rooftop Pool')).toBeVisible();
    await expect(page.getByText('Co-working')).toBeVisible();
    await expect(page.getByText('Metro Station')).toBeVisible();
    await expect(page.getByText('Is it RERA registered?')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Welcome' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About the Developer' })).toBeVisible();
    await expect(page.locator('main img[src^="/uploads/"]').first()).toBeVisible();
    // image is actually served
    const src = await page.locator('main img[src^="/uploads/"]').first().getAttribute('src');
    const img = await page.request.get(src);
    expect(img.status()).toBe(200);

    // appears in filters, home new launches, developer page
    await go(page, `/projects?property=${CAT.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(page.getByRole('link', { name: new RegExp(PROJ) }).first()).toBeVisible();
    await go(page, '/');
    await expect(page.getByRole('link', { name: new RegExp(PROJ) }).first()).toBeAttached();
    await go(page, '/developers');
    await expect(page.getByRole('link', { name: new RegExp(DEV) })).toBeVisible();

    // brochure is gated by lead form, then opens the pdf
    await go(page, `/projects/${slug}`);
    await page.getByRole('main').getByRole('button', { name: 'Brochure' }).first().click();
    const dlg = page.getByRole('dialog');
    await expect(dlg.getByRole('heading', { name: 'Download Brochure' })).toBeVisible();
    await dlg.getByLabel('Name*', { exact: true }).fill(LEAD);
    await dlg.getByLabel('Phone*', { exact: true }).fill('9876500004');
    // headless Chromium handles PDFs as downloads, so capture window.open instead
    await page.evaluate(() => {
      window.__opened = [];
      window.open = (url) => {
        window.__opened.push(url);
        return null;
      };
    });
    await dlg.getByRole('button', { name: 'Submit & Download' }).click();
    await expect(dlg.getByText('Thank you!')).toBeVisible();
    const opened = await page.evaluate(() => window.__opened);
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatch(/^\/uploads\/brochure-[a-f0-9]+\.pdf$/);
    expect((await page.request.get(opened[0])).status()).toBe(200);
  });

  test('brochure lead is recorded in enquiries, status + notes update, CSV export', async ({ page }) => {
    await login(page);
    await go(page, '/admin/enquiries');
    await page.getByLabel('Search enquiries', { exact: true }).fill(LEAD);
    const r = row(page, LEAD);
    await expect(r).toBeVisible();
    await expect(r).toContainText(PROJ);
    await expect(r).toContainText('Brochure Download');

    await r.getByLabel(/Status for/).selectOption('contacted');
    await page.reload();
    await page.getByLabel('Search enquiries', { exact: true }).fill(LEAD);
    await expect(row(page, LEAD).getByLabel(/Status for/)).toHaveValue('contacted');

    await row(page, LEAD).getByRole('button', { name: new RegExp(`^${LEAD}`) }).click();
    const dlg = page.getByRole('dialog');
    await dlg.getByLabel('Internal notes', { exact: true }).fill('Called, wants site visit');
    await dlg.getByRole('button', { name: 'Save notes' }).click();
    await expect(page.getByText('Notes saved')).toBeVisible();
    await page.keyboard.press('Escape');

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export CSV' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^enquiries-.*\.csv$/);
    const text = await (await download.createReadStream()).toArray();
    expect(Buffer.concat(text).toString()).toContain(LEAD);
  });

  test('edit project, unpublish hides it publicly, republish shows it', async ({ page }) => {
    await login(page);
    await go(page, '/admin/projects');
    await page.getByLabel('Search projects', { exact: true }).fill(PROJ);
    await expect(row(page, PROJ)).toBeVisible();
    await row(page, PROJ).getByRole('link', { name: /Edit/ }).click();
    await page.getByLabel('Price', { exact: true }).fill('4 Cr onwards');
    await page.getByRole('button', { name: 'Save project' }).first().click();
    await expect(page.getByText('Project saved')).toBeVisible();

    const slug = `e2e-tower-${RUN}`;
    await go(page, `/projects/${slug}`);
    await expect(page.getByText('4 Cr onwards').first()).toBeVisible();

    await go(page, '/admin/projects');
    await page.getByLabel('Search projects', { exact: true }).fill(PROJ);
    await row(page, PROJ).getByRole('button', { name: 'Unpublish' }).click();
    await expect(row(page, PROJ).getByText('Hidden')).toBeVisible();
    expect((await page.request.get(`/projects/${slug}`)).status()).toBe(404);

    await row(page, PROJ).getByRole('button', { name: 'Publish' }).click();
    await expect(row(page, PROJ).getByText('Published')).toBeVisible();
    expect((await page.request.get(`/projects/${slug}`)).status()).toBe(200);
  });

  test('site settings changes reflect on the website', async ({ page }) => {
    await login(page);
    await go(page, '/admin/settings');
    const original = await page.locator('#f-siteName').inputValue();

    await page.locator('#f-siteName').fill(`Aarvi Property E2E ${RUN}`);
    await page.getByRole('tab', { name: 'Home page' }).click();
    await page.locator('#f-hero\\.title').fill(`Hero edited ${RUN}`);
    await page.getByRole('button', { name: 'Save settings' }).first().click();
    await expect(page.getByText(/Settings saved/)).toBeVisible();

    await go(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Hero edited ${RUN}`);
    await expect(page.locator('footer')).toContainText(`Aarvi Property E2E ${RUN}`);

    // restore
    await go(page, '/admin/settings');
    await page.locator('#f-siteName').fill(original);
    await page.getByRole('tab', { name: 'Home page' }).click();
    await page.locator('#f-hero\\.title').fill('Empowering you to make life’s biggest move');
    await page.getByRole('button', { name: 'Save settings' }).first().click();
    await expect(page.getByText(/Settings saved/)).toBeVisible();
  });

  test('blog and testimonial appear on the website', async ({ page }) => {
    await login(page);
    await go(page, '/admin/blogs');
    await page.getByRole('button', { name: 'Add post' }).click();
    const dlg = page.getByRole('dialog');
    await dlg.locator('#f-title').fill(BLOG);
    await dlg.getByLabel('Excerpt', { exact: true }).fill('E2E excerpt');
    await dlg.getByLabel('Content (Markdown)', { exact: true }).fill('# Heading from e2e\n\nSome body text.');
    await dlg.getByRole('button', { name: 'Preview' }).click();
    await expect(dlg.getByRole('heading', { name: 'Heading from e2e' })).toBeVisible();
    await dlg.getByRole('button', { name: 'Save' }).click();
    await expect(row(page, BLOG)).toBeVisible();

    await go(page, '/blogs');
    await expect(page.getByRole('heading', { name: BLOG })).toBeVisible();
    await page.getByRole('heading', { name: BLOG }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(BLOG);
    // markdown "# Heading" is demoted so there is only a single <h1>
    await expect(page.getByRole('heading', { level: 2, name: 'Heading from e2e' })).toBeVisible();

    await go(page, '/admin/testimonials');
    await page.getByRole('button', { name: 'Add testimonial' }).click();
    const t = page.getByRole('dialog');
    await t.locator('#f-name').fill('E2E Customer');
    await t.locator('#f-text').fill(REVIEW);
    await t.getByRole('button', { name: 'Save' }).click();
    await expect(row(page, REVIEW)).toBeVisible();
    await go(page, '/');
    await expect(page.getByText(REVIEW)).toBeVisible();
  });

  test('delete protection, then cleanup of everything created', async ({ page }) => {
    await login(page);

    // category in use cannot be deleted
    await go(page, '/admin/categories');
    await row(page, CAT).getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/Cannot delete: 1 project/)).toBeVisible();

    // delete project
    await go(page, '/admin/projects');
    await page.getByLabel('Search projects', { exact: true }).fill(PROJ);
    await row(page, PROJ).getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Project deleted')).toBeVisible();
    expect((await page.request.get(`/projects/e2e-tower-${RUN}`)).status()).toBe(404);

    for (const [url, name] of [
      ['/admin/categories', CAT],
      ['/admin/locations', LOC],
      ['/admin/developers', DEV],
      ['/admin/blogs', BLOG],
      ['/admin/testimonials', REVIEW],
    ]) {
      await go(page, url);
      await page.getByLabel('Search', { exact: false }).first().fill(name);
      await row(page, name).getByRole('button', { name: /Delete/ }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
    }

    // remove e2e enquiries
    await go(page, '/admin/enquiries');
    await page.getByLabel('Search enquiries', { exact: true }).fill('E2E');
    const rows = page.getByRole('row').filter({ hasText: 'E2E' });
    await expect(rows.first().or(page.getByText('No enquiries found.'))).toBeVisible();
    let n = await rows.count();
    while (n > 0) {
      await rows.first().getByRole('button', { name: /Delete enquiry/ }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await expect(rows).toHaveCount(n - 1);
      n -= 1;
    }
  });

  test('account: change password and log back in', async ({ page }) => {
    await login(page);
    await go(page, '/admin/account');
    const change = async (cur, next) => {
      await page.getByLabel('Current password', { exact: true }).fill(cur);
      await page.getByLabel('New password', { exact: true }).fill(next);
      await page.getByLabel('Confirm new password', { exact: true }).fill(next);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Password changed')).toBeVisible();
    };
    // mismatch is caught client-side
    await page.getByLabel('Current password', { exact: true }).fill(PASSWORD);
    await page.getByLabel('New password', { exact: true }).fill('SomethingNew@1');
    await page.getByLabel('Confirm new password', { exact: true }).fill('different');
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.locator('p[role=alert]')).toContainText('do not match');

    await change(PASSWORD, 'Temp@Pass12345');
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await login(page, EMAIL, 'Temp@Pass12345');
    await expect(page).toHaveURL(/\/admin$/);
    await go(page, '/admin/account');
    await change('Temp@Pass12345', PASSWORD);
  });
});
