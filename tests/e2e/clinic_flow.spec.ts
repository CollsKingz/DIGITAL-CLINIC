import { test, expect } from '@playwright/test';

test.describe('Digital Clinic End-to-End Workflows', () => {
  test('Patient books an appointment and verifies live queue ticket', async ({ page }) => {
    await page.goto('/');

    // Verify App Header
    await expect(page.locator('text=Digital Clinic')).toBeVisible();

    // Navigate to Book Visit
    await page.click('text=Book Visit');

    // Fill appointment reason
    await page.fill('textarea[placeholder*="Describe symptoms"]', 'E2E Automated test visit for seasonal flu');

    // Submit booking
    await page.click('button:has-text("Confirm & Issue Queue Ticket")');

    // Verify confirmation
    await expect(page.locator('text=Appointment booked successfully!')).toBeVisible();

    // Verify active ticket banner appears
    await expect(page.locator('text=Active Digital Ticket')).toBeVisible();
  });

  test('Persona switcher changes view to Doctor Workspace', async ({ page }) => {
    await page.goto('/');

    // Click Persona Switcher in Navbar
    await page.click('button:has-text("PATIENT")');

    // Switch to Doctor
    await page.click('text=Doctor / Clinical Nurse');

    // Verify Doctor workspace header is visible
    await expect(page.locator('text=Doctor & Clinical Nurse Workspace')).toBeVisible();
  });
});
