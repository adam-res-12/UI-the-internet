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

//Checks the title
test('has title', async ({page}) => {
    await expect(page).toHaveTitle(/The Internet/);
});

//Is heading on main page visible
test('has heading', async ({page}) => {
    await expect(page.getByRole('heading', {name: 'Welcome to the-internet'})).toBeVisible();
});

//Checkbox1 - check the box, then check if checked
test('checkbox1', async ({page}) => {
    await page.getByRole('link', {name:'Checkboxes'}).click();
    
    await page.getByRole('checkbox').first().check();

    await expect(page.getByRole('checkbox').first()).toBeChecked();
});

//Checkbox2 - uncheck the box, then check if not checked
test('checkbox2', async ({page}) => {
    await page.getByRole('link', {name:'Checkboxes'}).click();

    await page.getByRole('checkbox').nth(1).uncheck();

    await expect(page.getByRole('checkbox').nth(1)).not.toBeChecked();
});

//Drag and drop - drag box A to box B position, then checks if the first location now has a box with 'B' in it
test('dragA', async ({page}) => {
    await page.getByRole('link', {name: 'Drag and Drop'}).click();

    await page.locator('#column-a.column').dragTo(page.locator('#column-b.column'));

    await expect(page.locator('#column-a.column')).toHaveText('B');
});