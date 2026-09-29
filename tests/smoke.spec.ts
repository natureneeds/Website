import { test, expect, Page } from '@playwright/test'

// Helper to authenticate user cleanly via Phone + OTP with a dedicated phone per test
async function loginAsUser(page: Page, phone: string) {
  await page.goto('/login')
  const phoneInput = page.locator('input[type="tel"]')
  await phoneInput.fill(phone)
  await page.locator('button[type="submit"]').click()

  const otpInput = page.locator('input[maxlength="6"]')
  await expect(otpInput).toBeVisible({ timeout: 10000 })
  await otpInput.fill('123456')

  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
}

test.describe('Kisan OS Smoke Tests', () => {
  // 1. Smoke Test: Login with Phone & OTP
  test('1. User can login with phone number and OTP', async ({ page }) => {
    await page.goto('/login')

    // Expect login page title
    await expect(page.locator('h2')).toBeVisible()

    // Fill phone number
    const phoneInput = page.locator('input[type="tel"]')
    await phoneInput.fill('9876543210')

    // Submit phone number to receive OTP
    const sendOtpButton = page.locator('button[type="submit"]')
    await sendOtpButton.click()

    // Wait for OTP input to be visible
    const otpInput = page.locator('input[maxlength="6"]')
    await expect(otpInput).toBeVisible({ timeout: 10000 })

    // Fill dev mode test OTP code
    await otpInput.fill('123456')

    // Submit OTP verification
    const verifyButton = page.locator('button[type="submit"]')
    await verifyButton.click()

    // Verify redirected away from login to profile or authenticated route
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
    expect(page.url()).not.toContain('/login')
  })

  // 2. Smoke Test: Find Product in Marketplace
  test('2. User can search and find a product in marketplace', async ({ page }) => {
    await page.goto('/market')

    // Search input on marketplace main page
    const searchInput = page.locator('main input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Wheat')

    // Wait for filtered product cards
    const productCard = page.locator('h4', { hasText: /Wheat/i }).first()
    await expect(productCard).toBeVisible({ timeout: 10000 })

    // Click on product card to open Product Detail Page
    await productCard.click()

    // Verify product detail page URL and heading
    await page.waitForURL((url) => url.pathname.includes('/product/'), { timeout: 10000 })
    await expect(page.locator('h1')).toBeVisible()
  })

  // 3. Smoke Test: Checkout (Test Mode - Cash on Delivery)
  test('3. User can add product to cart and complete checkout', async ({ page }) => {
    // 1. Authenticate with dedicated phone
    await loginAsUser(page, '9876543213')

    // 2. Go to product detail page (p1 certified seeds)
    await page.goto('/product/p1')
    await expect(page.locator('h1')).toBeVisible()

    // 3. Add to cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i })
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // Wait for cart confirmation button
    await expect(page.getByRole('button', { name: /View Cart/i })).toBeVisible({ timeout: 5000 })

    // 4. Navigate to checkout
    await page.goto('/checkout')

    // Verify checkout page loaded
    await expect(page.getByText('Select Payment Mode')).toBeVisible({ timeout: 10000 })

    // 5. Select Cash on Delivery option
    const codCard = page.getByText('Cash on Delivery (COD)')
    await expect(codCard).toBeVisible()
    await codCard.click()

    // 6. Click Place Cash on Delivery Order
    const placeOrderBtn = page.getByRole('button', { name: /Place Cash on Delivery Order/i })
    await expect(placeOrderBtn).toBeEnabled({ timeout: 5000 })
    await placeOrderBtn.click()

    // 7. Confirm redirected to order detail timeline
    await page.waitForURL((url) => url.pathname.includes('/orders/'), { timeout: 15000 })
    expect(page.url()).toContain('/orders/')
    await expect(page.getByText(/Order #/i)).toBeVisible({ timeout: 10000 })
  })

  // 4. Smoke Test: Start a Crop Plan
  test('4. User can browse crop recommendations and start a crop', async ({ page }) => {
    // 1. Authenticate with dedicated phone
    await loginAsUser(page, '9876543214')

    // 2. Navigate to /plan
    await page.goto('/plan')

    // Verify planner header is visible
    await expect(page.locator('h1', { hasText: /Autonomous Crop Planner/i })).toBeVisible({ timeout: 10000 })

    // 3. Click "Start This Crop" for the first recommended crop card
    const startCropBtn = page.getByRole('button', { name: /Start This Crop/i }).first()
    await expect(startCropBtn).toBeVisible({ timeout: 10000 })
    await startCropBtn.click()

    // 4. Verify calendar view switches and shows dated task timeline
    await expect(page.getByText(/Agronomic Calendar/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Chronological Field Tasks/i)).toBeVisible({ timeout: 10000 })
  })

  // 5. Smoke Test: Add a Ledger Entry
  test('5. User can log a manual expense in the farm ledger', async ({ page }) => {
    // 1. Authenticate with dedicated phone
    await loginAsUser(page, '9876543215')

    // 2. Navigate to /ledger
    await page.goto('/ledger')

    // Verify ledger header is visible
    await expect(page.locator('h1', { hasText: /Crop Ledger/i })).toBeVisible({ timeout: 10000 })

    // 3. Click "Log Cost / Income" button
    const logCostBtn = page.getByRole('button', { name: /Log Cost \/ Income/i })
    await expect(logCostBtn).toBeVisible()
    await logCostBtn.click()

    // 4. Verify modal is open
    await expect(page.getByText(/Farmer Cost & Voucher Entry/i)).toBeVisible({ timeout: 5000 })

    // 5. Fill notes textarea
    const notesTextarea = page.locator('textarea')
    await expect(notesTextarea).toBeVisible()
    await notesTextarea.fill('Smoke Test Irrigation Diesel Cost')

    // 6. Submit entry
    const submitBtn = page.getByRole('button', { name: /Save Ledger Voucher/i })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // 7. Verify confirmation message
    await expect(page.getByText(/Ledger Entry Recorded!/i)).toBeVisible({ timeout: 10000 })

    // 8. Close modal
    await page.getByRole('button', { name: /Close & View Ledger/i }).click()
  })
})
