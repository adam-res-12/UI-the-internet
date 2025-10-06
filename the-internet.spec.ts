import {test, expect} from '@playwright/test';

test.beforeEach(async({page}) => {
    await page.goto("https://the-internet.herokuapp.com/");
});

// Screenshot for failed tests:
test.afterEach(async({page}, testInfo) => {
    if (testInfo.status == "failed") {
        const screenshot = await page.screenshot({
            path: `screenshots/${testInfo.title}.png`,
            fullPage: true,
        });
        await testInfo.attach("screenshot", {
            body: screenshot,
            contentType: "image/png",
        });
    }
});

test('has title', async ({page}) => {
    await page.goto('https://the-internet.herokuapp.com/');

    await expect(page).toHaveTitle(/The Internet/);
});

test('has heading', async ({page}) => {
    await page.goto('https://the-internet.herokuapp.com/');

    await expect(page.getByRole('heading', {name: 'Welcome to the-internet'})).toBeVisible();
});