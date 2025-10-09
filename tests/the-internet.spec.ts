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

//Add/Remove Elements - add delete, then check its there
// add 2 delete, then check for 2
// add delete then remove, check delete is removed
test('addElement', async ({page}) => {
    await page.getByRole('link', {name: 'Add/Remove Elements'}).click();

    await page.getByRole('button', {name: 'Add Element'}).click();

    await expect(page.getByRole('button', {name: 'Delete'})).toBeVisible();
});

test('add2Elements', async ({page}) => {
    await page.getByRole('link', {name: 'Add/Remove Elements'}).click();

    await page.getByRole('button', {name: 'Add Element'}).click({clickCount: 2});

    await expect(page.getByRole('button', {name: 'Delete'})).toHaveCount(2);
});

test('deleteElement', async ({page}) => {
    await page.getByRole('link', {name: 'Add/Remove Elements'}).click();

    await page.getByRole('button', {name: 'Add Element'}).click();

    await page.getByRole('button', {name: 'Delete'}).click();

    await expect(page.getByRole('button', {name: 'Delete'})).toHaveCount(0);
});

//Basic Auth - puts username and password into url to sign in, then checks heading that only appears after sign in
test('signIn', async ({page}) => {
    const username = 'admin';

    const password = 'admin';

    await page.goto(`https://${username}:${password}@the-internet.herokuapp.com/basic_auth`);

    await expect(page.getByRole('heading', {name: 'Basic Auth'})).toBeVisible();
});

//Checkboxes - check box 1, then check if checked
// uncheck box 2, then check if not checked
test('checkbox1', async ({page}) => {
    await page.getByRole('link', {name:'Checkboxes'}).click();
    
    await page.getByRole('checkbox').first().check();

    await expect(page.getByRole('checkbox').first()).toBeChecked();
});

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

//Dropdown - select option1 from dropdown list, then checks if the option is now in the box
// then same for option2
test('dropdownOption1', async ({page}) => {
    await page.getByRole('link', {name: 'Dropdown'}).click();

    await page.locator('#dropdown').selectOption({value: '1'});

    await expect(page.locator('#dropdown')).toHaveValue('1');
});

test('dropdownOption2', async ({page}) => {
    await page.getByRole('link', {name: 'Dropdown'}).click();

    await page.locator('#dropdown').selectOption({value: '2'});

    await expect(page.locator('#dropdown')).toHaveValue('2');
});

//Entry Ad - check ad/modal window appears when clicking on link
// close ad/modal window, then check it's no longer there
// close ad/modal window and re-enable, then check that ad/modal window is showing again
test('firstEntry', async ({page}) => {
    await page.getByRole('link', {name: 'Entry Ad'}).click();

    await expect(page.getByRole('heading', {name: 'This is a modal window'})).toBeVisible();
});

test('closeModal', async ({page}) => {
    await page.getByRole('link', {name: 'Entry Ad'}).click();

    await page.getByText('Close', {exact: true}).click();

    await expect(page.getByRole('heading', {name: 'This is modal window'})).not.toBeVisible();
});

test('re-enableAd', async ({page}) => {
    await page.getByRole('link', {name: 'Entry Ad'}).click();

    await page.getByText('Close', {exact: true}).click();

    await page.locator('#restart-ad').click();

    await expect(page.getByRole('heading', {name: 'This is a modal window'})).toBeVisible();
});

//Key Presses - checks if pressing shift button in box results in 'You entered: SHIFT' output
// then same for Q
test('keyPressesSHIFT', async ({page}) => {
    await page.getByRole('link', {name: 'Key Presses'}).click();

    await page.locator('#target').press('Shift');

    await expect(page.locator('#result')).toHaveText('You entered: SHIFT');
});

test('keyPressesQ', async ({page}) => {
    await page.getByRole('link', {name: 'Key Presses'}).click();

    await page.locator('#target').press('Q');

    await expect(page.locator('#result')).toHaveText('You entered: Q');
});

//Redirection - checks that the redirect link takes you to the status codes page
test('redirection', async ({page}) => {
    await page.getByRole('link', {name: 'Redirect Link'}).click();

    await page.locator('#redirect').click();

    await expect(page.getByRole('heading', {name:'Status Codes'})).toBeVisible();
});