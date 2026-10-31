import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

export async function verifyEditorSeoUi({origin,token,cookieName,pageSeoId}) {
  await mkdir('output/editor-seo',{recursive:true});
  const browser=await chromium.launch();let checks=0;
  try {
    for(const width of [1440,390]) {
      const context=await browser.newContext({viewport:{width,height:1000}});
      await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
      await context.addCookies([{name:cookieName,value:token,url:origin,httpOnly:true,sameSite:'Lax',secure:false}]);
      const page=await context.newPage();await page.goto(`${origin}/admin/collections/page-seo/${pageSeoId}`);
      await expect(page.getByRole('heading',{name:'Review this page',exact:true})).toBeVisible();
      await expect(page.locator('input[name=seoTitle]')).toHaveValue('Synthetic editable search title');
      await page.locator('input[name=seoTitle]').fill('Synthetic live form preview');
      await expect(page.locator('.s24-search-preview strong')).toHaveText('Synthetic live form preview');
      await expect(page.getByRole('link',{name:'Review the public page',exact:true})).toHaveAttribute('href','https://stor24.co.za/personal-storage');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`output/editor-seo/page-seo-${width}.png`,fullPage:true});checks++;
      await page.goto(origin+'/admin/collections/redirects/create');
      await expect(page.getByRole('heading',{name:'Check the replacement',exact:true})).toBeVisible();
      await page.locator('input[name=source]').fill('/retired-ui-preview');await page.locator('input[name=destination]').fill('/storage/midpoint');
      await page.getByLabel('Redirect type',{exact:true}).selectOption('307');
      await expect(page.getByText('Temporary move.',{exact:true})).toBeVisible();
      await expect(page.getByRole('link',{name:'Review https://stor24.co.za/storage/midpoint',exact:true})).toHaveAttribute('href','https://stor24.co.za/storage/midpoint');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`output/editor-seo/redirect-${width}.png`,fullPage:true});checks++;
      await context.close();
    }
    console.log(JSON.stringify({editorSeoUiChecks:checks,widths:[1440,390],scope:'isolated CMS fixtures, no public-site navigation'}));
    return checks;
  } finally {await browser.close();}
}
