import { test, expect } from '@playwright/test';

test('Frontend should load successfully', async ({ page }) => {
  await page.goto('/');
  // Basic check to see if the page loaded
  await expect(page).toHaveTitle(/Kredl/i); 
});
