import { test, expect } from '@playwright/test';

test.describe('Dark Mode Scheme & Smooth Transition', () => {
  test('Toggle switches between light and dark mode with transition and persistence', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    
    // Toggle button should be visible
    const toggle = page.locator('[data-testid="dark-mode-toggle"]').first();
    await expect(toggle).toBeVisible();

    // Initial state is light (or default)
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    expect(['light', 'dark']).toContain(initialTheme);

    // 2. Click toggle to change mode
    await toggle.click();

    // Verify data-theme attribute on <html> updated
    const expectedNewTheme = initialTheme === 'dark' ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedNewTheme);

    // Verify localStorage has the chosen theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('rivet-theme-mode'));
    expect(storedTheme).toBe(expectedNewTheme);

    // 3. Navigate to a workspace page (e.g. /control) and verify theme is preserved
    await page.goto('/control');
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedNewTheme);

    // 4. Toggle back in workspace topbar
    const controlToggle = page.locator('[data-testid="dark-mode-toggle"]');
    await expect(controlToggle).toBeVisible();
    await controlToggle.click();

    const expectedRevertedTheme = expectedNewTheme === 'dark' ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedRevertedTheme);

    // 5. Reload page and ensure no flash / theme is retained
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedRevertedTheme);
  });
});
