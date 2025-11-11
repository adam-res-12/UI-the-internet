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

//Add/Remove Elements
// addElement - add delete, then check its there
// add2Elements - add 2 delete, then check for 2
// deleteElement - add delete then remove, then check delete is removed
test('addElement', async ({page}) => {
    await page.getByRole('link', {name: 'Add/Remove Elements'}).click();

    await page.getByRole('button', {name: 'Add Element'}).click();

    await expect(page.getByRole('button', {name: 'Delete'})).toHaveCount(1);
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

//Basic Auth
// signIn - puts username and password into url to sign in, then checks heading that only appears after sign in
test('signIn', async ({page}) => {
    const username = 'admin';
    const password = 'admin';

    await page.goto(`https://${username}:${password}@the-internet.herokuapp.com/basic_auth`);

    await expect(page.getByRole('heading', {name: 'Basic Auth'})).toBeVisible();
});

//Broken Images
// brokenImage_asdf - checks if image is there/is still loading or has failed to load
// brokenImage_hjkl - then same for hjkl
// brokenImage_img/avatar-blank - then same for img_avatar-blank
test('brokenImage_asdf', async ({page}) => {
    await page.getByRole('link', {name:'Broken Images'}).click();

    await page.waitForSelector('img');

    const checkImage = await page.evaluate(() => {
        const image = document.querySelector('img[src*="asdf.jpg"]') as HTMLImageElement;
        if (!image) return true;
        return !image.complete || image.naturalWidth === 0;
    });

    expect(checkImage).toBe(true);
});

test('brokenImage_hjkl', async ({page}) => {
    await page.getByRole('link', {name:'Broken Images'}).click();

    await page.waitForSelector('img');

    const checkImage = await page.evaluate(() => {
        const image = document.querySelector('img[src*="hjkl.jpg"]') as HTMLImageElement;
        if (!image) return true;
        return !image.complete || image.naturalWidth === 0;
    });

    expect(checkImage).toBe(true);
});

test('brokenImage_img/avatar-blank', async ({page}) => {
    await page.getByRole('link', {name:'Broken Images'}).click();

    await page.waitForSelector('img');

    const checkImage = await page.evaluate(() => {
        const image = document.querySelector('img[src*="img/avatar-blank.jpg"]') as HTMLImageElement;
        if (!image) return true;
        return !image.complete || image.naturalWidth === 0;
    });

    expect(checkImage).toBe(true);
});

//Checkboxes
// checkbox1 - check box 1, then check if checked
//           - uncheck box 1, then check if not checked
// checkbox2 - uncheck box 2, then check if not checked
//           - check box 2, then check if checked
test('checkbox1', async ({page}) => {
    await page.getByRole('link', {name:'Checkboxes'}).click();
    
    await page.getByRole('checkbox').first().check();

    await expect(page.getByRole('checkbox').first()).toBeChecked();

    await page.getByRole('checkbox').first().uncheck();

    await expect(page.getByRole('checkbox').first()).not.toBeChecked();
});

test('checkbox2', async ({page}) => {
    await page.getByRole('link', {name:'Checkboxes'}).click();

    await page.getByRole('checkbox').nth(1).uncheck();

    await expect(page.getByRole('checkbox').nth(1)).not.toBeChecked();

    await page.getByRole('checkbox').nth(1).check();

    await expect(page.getByRole('checkbox').nth(1)).toBeChecked();
});

//Context Menu
// contextMenu - right clicks to make js alert appear, then verify it did appear by checking message content
test('contextMenu', async ({page}) => {
    await page.getByRole('link', {name: 'Context Menu'}).click();

    const dialogPromise = page.waitForEvent('dialog');

    page.locator('#hot-spot').click({button: 'right'}); //removed await as it was getting stuck on the click

    const dialog = await dialogPromise;

    await dialog.accept();

    await expect(dialog.message()).toBe('You selected a context menu');
});

//Disappearing Elements
// gallery - checks if gallery appears on up to 20 page loads, then breaks when both counts are above 0 (means gallery is appearing/disappearing)
test('gallery', async ({page}) => {
    await page.getByRole('link', {name: 'Disappearing Elements'}).click();

    let galleryCount = 0;
    let nogalleryCount = 0;

    for (let i=0; i<20; i++) {

        const gallery = await page.locator('[href="/gallery/"]').isVisible()

        if (gallery) {
            galleryCount ++;
        } else {
            nogalleryCount ++;
        }

        if (galleryCount > 0 && nogalleryCount > 0) {
            break
        }
        await page.reload();
    }

    console.log('Gallery appeared', galleryCount, 'times');
    console.log('No gallery appeared', nogalleryCount, 'times');
    expect(galleryCount > 0 && nogalleryCount > 0).toBeTruthy();
});

//Drag and drop
// dragA - drag box A to box B position, then checks if the first location now has a box with 'B' in it
//       - drag box A back to A position, then checks if the first location now has a box with 'A' in it
// dragB - same as above, but with box B
test('dragA', async ({page}) => {
    await page.getByRole('link', {name: 'Drag and Drop'}).click();

    await page.locator('#column-a.column').dragTo(page.locator('#column-b.column'));

    await expect(page.locator('#column-a.column')).toHaveText('B');

    await page.locator('#column-b.column').dragTo(page.locator('#column-a.column'));

    await expect(page.locator('#column-a.column')).toHaveText('A');
});

test('dragB', async ({page}) => {
    await page.getByRole('link', {name: 'Drag and Drop'}).click();

    await page.locator('#column-b.column').dragTo(page.locator('#column-a.column'));

    await expect(page.locator('#column-b.column')).toHaveText('A');

    await page.locator('#column-a.column').dragTo(page.locator('#column-b.column'));

    await expect(page.locator('#column-b.column')).toHaveText('B');
})

//test('dragSomewhereElse', async ({page}) => {
    //await page.getByRole('link', {name: 'Drag and Drop'}).click();

//})

//Dropdown 
// dropdownOption1 - select option1 from dropdown list, then checks if the option is now in the box
//                 - select option2 from dropdown list, then checks if the option is now in the box
// dropdownOption2 - then same , but with option2 first followed by option1
test('dropdownOption1', async ({page}) => {
    await page.getByRole('link', {name: 'Dropdown'}).click();

    await page.locator('#dropdown').selectOption({value: '1'});

    await expect(page.locator('#dropdown')).toHaveValue('1');

    await page.locator('#dropdown').selectOption({value: '2'});

    await expect(page.locator('#dropdown')).toHaveValue('2');
});

test('dropdownOption2', async ({page}) => {
    await page.getByRole('link', {name: 'Dropdown'}).click();

    await page.locator('#dropdown').selectOption({value: '2'});

    await expect(page.locator('#dropdown')).toHaveValue('2');

    await page.locator('#dropdown').selectOption({value: '1'});

    await expect(page.locator('#dropdown')).toHaveValue('1');
});

//Dynamic Controls
// removeAddCheck - clicks button to remove the checkbox, then checks if there are 0 checkboxes
//                - clicks button to add the checkbox back in, then checks if there is 1 checkbox
// enableDisable - checks if text box is disabled, then clicks enable button and checks if no longer disabled
//               - puts 'qwerty' in textbox, then checks if textbox has 'qwerty' in it
//               - clicks disable button, then checks if textbox is disabled
test('removeCheck', async ({page}) => {
    await page.getByRole('link', {name: 'Dynamic Controls'}).click();

    await page.getByRole('button', {name: 'Remove'}).click();
    await page.getByRole('button', {name: 'Add'}).waitFor({state: 'visible'});
    await expect(page.getByRole('checkbox')).toHaveCount(0);

    await page.getByRole('button', {name: 'Add'}).click();
    await page.getByRole('button', {name: 'Remove'}).waitFor({state: 'visible'});
    await expect(page.getByRole('checkbox')).toHaveCount(1);
});

test('enableDisable', async ({page}) => {
    await page.getByRole('link', {name: 'Dynamic Controls'}).click();

    await expect(page.getByRole('textbox')).toBeDisabled();

    await page.getByRole('button', {name: 'Enable'}).click();
    await page.getByRole('button', {name: 'Disable'}).waitFor({state: 'visible'});
    await expect(page.getByRole('textbox')).not.toBeDisabled();

    await page.getByRole('textbox').fill('qwerty');
    await expect(page.getByRole('textbox')).toHaveValue('qwerty');

    await page.getByRole('button', {name: 'Disable'}).click();
    await page.getByRole('button', {name: 'Enable'}).waitFor({state: 'visible'});
    await expect(page.getByRole('textbox')).toBeDisabled();
});

//Entry Ad 
// firstEntry - check ad/modal window appears when clicking on link
// closeModal - close ad/modal window, then check it's no longer there
// re-enableAd - close ad/modal window and re-enable, then check that ad/modal window is showing again
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

//File Download
// downloadBb - clicks to download file bb.txt, then checks if a path exists + checks file name + prints file path
// downloadWebIO - same as above but with webdriverIO.png file
// downloadFirst - finds the name of the first download in "example" class, then does the same as above but with first download file
// downloadSecond - same as above but with second download in "example" class, then does same as above but with second download file
test('downloadBb', async ({page}) => {
    await page.locator('[href="/download"]').click();
    
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        await page.getByRole('link', {name: 'bb.txt'}).click()
    ]);
    const path = await download.path();

    expect(path).not.toBeNull();
    expect(download.suggestedFilename()).toBe('bb.txt');
    console.log('bb.txt file path:', path);
});

test('downloadWebIO', async ({page}) => {
    await page.locator('[href="/download"]').click();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        await page.getByRole('link', {name: 'webdriverIO.png'}).click()
    ]);
    const path = await download.path();

    expect(path).not.toBeNull();
    expect(download.suggestedFilename()).toBe('webdriverIO.png');
    console.log('webdriverIO.png file path:', path);
});

test('downloadFirst', async ({page}) => {
    await page.locator('[href="/download"]').click();

    const firstDownload = await page.locator('.example').evaluate(el => {
        const text = (el as HTMLElement).innerText.trim();
        return text.split('\n')[1]; //Uses 1 as first text in class is heading
    });

    console.log(firstDownload);
    
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        await page.getByRole('link', {name: firstDownload}).click()
    ]);
    const path = await download.path();

    expect(path).not.toBeNull();
    expect(download.suggestedFilename()).toBe(firstDownload);
    console.log(firstDownload, 'file path:', path);
});

test('downloadSecond', async ({page}) => {
    await page.locator('[href="/download"]').click();

    const secondDownload = await page.locator('.example').evaluate(el => {
        const text = (el as HTMLElement).innerText.trim();
        return text.split('\n')[2];
    });

    console.log(secondDownload);
    
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        await page.getByRole('link', {name: secondDownload}).click()
    ]);
    const path = await download.path();

    expect(path).not.toBeNull();
    expect(download.suggestedFilename()).toBe(secondDownload);
    console.log(secondDownload, 'file path:', path);
});

//Form Authentication/ Login Page
// login - attempt login with correct info, then check if it takes you to the secure area
// wrongUsername - attempt login with wrong username, then check if wrong username alert shows
// wrongPassword - attempt login with wrong password, then check if wrong password alert shows
// wrongBoth - attempt login with wrong username and password, then check if wrong username alert shows
test('login', async ({page}) => {
    await page.getByRole('link', {name: 'Form Authentication'}).click();

    await page.locator('#username').fill('tomsmith');

    await page.locator('#password').fill('SuperSecretPassword!');

    await page.getByRole('button', {name: 'Login'}).click();

    await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});

test('wrongUsername', async ({page}) => {
    await page.getByRole('link', {name: 'Form Authentication'}).click();

    await page.locator('#username').fill('qwerty');

    await page.locator('#password').fill('SuperSecretPassword!');

    await page.getByRole('button', {name: 'Login'}).click();

    await expect(page.locator('#flash')).toContainText('Your username is invalid!');
});

test('wrongPassword', async ({page}) => {
    await page.getByRole('link', {name: 'Form Authentication'}).click();

    await page.locator('#username').fill('tomsmith');

    await page.locator('#password').fill('qwerty');

    await page.getByRole('button', {name: 'Login'}).click();

    await expect(page.locator('#flash')).toContainText('Your password is invalid!');
});

test('wrongBoth', async ({page}) =>{
    await page.getByRole('link', {name: 'Form Authentication'}).click();

    await page.locator('#username').fill('qwerty');

    await page.locator('#password').fill('qwerty');

    await page.getByRole('button', {name: 'Login'}).click();

    await expect(page.locator('#flash')).toContainText('Your username is invalid!');
});

//Hovers
// hover - hovers over each profie image, then checks if the additional info appears
test('hover', async ({page}) => {
    await page.getByRole('link', {name: 'Hovers'}).click();

    await page.locator('.figure').nth(0).hover();
    await expect(page.getByRole('heading', {name: 'name: user1'})).toBeVisible();

    await page.locator('.figure').nth(1).hover();
    await expect(page.getByRole('heading', {name: 'name: user2'})).toBeVisible();

    await page.locator('.figure').nth(2).hover();
    await expect(page.getByRole('heading', {name: 'name: user3'})).toBeVisible();
});

//Inputs
// inputNumChange - inputs '1234', then checks if showing '1234'
//                - presses up to increase by 1, then checks if now showing '1235'
// negNum - presses to decrease by 1, then checks if now showing '-1'
// inputLetters - tries to put letters into inputs box, then checks if it fails to input
test('inputNumChange', async ({page}) => {
    await page.getByRole('link', {name: 'Inputs'}).click();

    await page.getByRole('spinbutton').fill('1234');

    await expect(page.getByRole('spinbutton')).toHaveValue('1234');

    await page.getByRole('spinbutton').focus();

    await page.keyboard.press('ArrowUp');

    await expect(page.getByRole('spinbutton')).toHaveValue('1235');
});

test('negNum', async ({page}) => {
    await page.getByRole('link', {name: 'Inputs'}).click();

    await page.getByRole('spinbutton').focus();

    await page.keyboard.press('ArrowDown');

    await expect(page.getByRole('spinbutton')).toHaveValue('-1');
});

test('inputLetters', async ({page}) => {
    await page.getByRole('link', {name: 'Inputs'}).click();

    let fillFail = false;

    try {
        await page.getByRole('spinbutton').fill('asdf');
    } catch (e) {
        fillFail = true;
    }

    expect(fillFail).toBeTruthy();
});

//Key Presses 
// keyPressesSHIFT - checks if pressing shift button in box results in 'You entered: SHIFT' output
// keyPressesQ - then same for Q
// keyPresses5 - then same for 5
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

test('keyPresses5', async ({page}) => {
    await page.getByRole('link', {name: 'Key Presses'}).click();

    await page.locator('#target').press('5');

    await expect(page.locator('#result')).toHaveText('You entered: 5');
});

//Redirection 
// redirection - checks that the redirect link takes you to the status codes page
test('redirection', async ({page}) => {
    await page.getByRole('link', {name: 'Redirect Link'}).click();

    await page.locator('#redirect').click();

    await expect(page.getByRole('heading', {name: 'Status Codes'})).toBeVisible();
});

//Shifting Content
// shiftingList - checks the text in the list, then reloads and checks if its the same or if the lines have moved around
test('shiftingList', async ({page}) => {
    await page.getByRole('link', {name: 'Shifting Content'}).click();
  
      await page.getByRole('link', {name: 'Example 3: List'}).click();
  
      const One = page.locator('.row').nth(2);
      const textOne = await One.innerText();
      console.log(textOne);

    let match = false;
    
    for (let i=0; i<20; i++) {

        await page.reload();

        const Two = page.locator('.row').nth(2);
        const textTwo = await Two.innerText();
        console.log(textTwo);

        if (textOne!=textTwo) {
            match = true;
            break;
        }
    }

    expect(match).toBeTruthy();
  });

//Sortable Data Tables (not really testing anything here, just extracting info)
// table1 - just outputs table using 'tr' and nth as locator
// tbale2 - same as before but different nth values
// firstName - gets a first name from table2 using '.first-name' class and nth
test('table1', async ({page}) => {
    await page.getByRole('link', {name: 'Sortable Data Tables'}).click();

    for (let i=0; i<5; i++) {
        const stuff = page.locator('tr').nth(i);
        const textStuff = await stuff.innerText();
        console.log(textStuff);
    }
});

test('table2', async ({page}) => {
    await page.getByRole('link', {name: 'Sortable Data Tables'}).click();

    for (let i=6; i<10; i++) {
        const stuff = page.locator('tr').nth(i);
        const textStuff = await stuff.innerText();
        console.log(textStuff);
    }
});

test('firstName', async ({page}) => {
    await page.getByRole('link', {name: 'Sortable Data Tables'}).click();

    const john = page.locator('.first-name').nth(1);
    const textJohn = await john.innerText();
    console.log(textJohn);
    expect(john).toBeVisible;
});

//Status Codes
// statusCode - checks that each link shows the correct number, then checks that the 'here' link goes to the correct page
test('statusCode', async ({page}) => {
    await page.getByRole('link', {name: 'Status Codes'}).click();

    await page.getByRole('link', {name: '200'}).click();
    await expect(page.locator('p')).toHaveText('This page returned a 200 status code. For a definition and common list of HTTP status codes, go here');
    
    await page.goBack();
    await page.getByRole('link', {name: '301'}).click();
    await expect(page.locator('p')).toHaveText('This page returned a 301 status code. For a definition and common list of HTTP status codes, go here');
    
    await page.goBack();
    await page.getByRole('link', {name: '404'}).click();
    await expect(page.locator('p')).toHaveText('This page returned a 404 status code. For a definition and common list of HTTP status codes, go here');
    
    await page.goBack();
    await page.getByRole('link', {name: '500'}).click();
    await expect(page.locator('p')).toHaveText('This page returned a 500 status code. For a definition and common list of HTTP status codes, go here');

    await page.goBack();
    await page.getByRole('link', {name: 'here'}).click();
    await expect(page.locator('h1')).toHaveText('Hypertext Transfer Protocol (HTTP) Status Code Registry');
});

//Typos
// checkTypo - checks text shows what is intended, reloads if it does and checks again, if not match gives typo and its location along with what should be shown
test('checkTypo', async ({page}) => {
    await page.getByRole('link', {name: 'Typos'}).click();

    const Intended = "Typos\n\nThis example demonstrates a typo being introduced. It does it randomly on each page load.\n\nSometimes you'll see a typo, other times you won't.";
    //console.log(Intended);

    const normalize = (str) => str.replace(/\r\n/g, '\n').trim();
    let countTrue = 0;
    let countFalse = 0;

    for (let i=0; i<20; i++) {

        let match = true;

        const Appears = page.locator('.row').nth(1);
        const textAppears = await Appears.innerText();
        const normAppears = normalize(textAppears);
        //console.log(normAppears);

        if (normAppears!=Intended) {
            match = false;
            countFalse++;
            for (let i=0; i < Math.max(normAppears.length, Intended.length); i++) {
                if (normAppears[i] !== Intended[i]){
                    console.log(`There is a typo located at position ${i}: page shows "${normAppears[i] || 'END'}", but should show "${Intended[i] ||'END'}"`);
                }
            }
            break;
        } else {
            countTrue++;
        }

        await page.reload();
    }
    console.log('No. of matches', countTrue);
    console.log('No. of mismatches', countFalse);
});

//Exit Intent
// exitViewport - should move cursor so mouseleave event occurs and modal windows pops up, but that's not working
//test('exitViewport', async ({page}) => {
    //await page.getByRole('link', {name: 'Exit Intent'}).click();

    //await page.mouse.move(100, 100);

    //await page.mouse.move(10000, 10000);

    //await expect(page.getByRole('heading', {name: 'This is a modal window'})).toBeVisible();

//});