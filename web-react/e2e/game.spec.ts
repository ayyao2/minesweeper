import { expect, test, type Page } from '@playwright/test'

// With Math.random() === 0, sequential sampling makes the first N cells (row-major) mines and the
// hint is the first zero-count cell. For the default 10 mines on 9x9: row 1 plus (2,1) are mines,
// the hint is (3,3), and every safe cell is connected, so clicking the hint wins.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto('/')
})

const cell = (page: Page, row: number, col: number) =>
  page.locator(`#board [aria-label^="Row ${row}, column ${col},"]`)

async function start(page: Page, mines: string, rows: string, cols: string) {
  await page.fill('#mines-input', mines)
  await page.fill('#rows-input', rows)
  await page.fill('#cols-input', cols)
  await page.getByRole('button', { name: 'Click To Start' }).click()
}

test('start screen shows validation errors', async ({ page }) => {
  const error = page.locator('#form-error')
  await expect(error).toBeHidden()

  await start(page, '', '9', '9')
  await expect(error).toHaveText('Number of mines must be a whole number.')
  await start(page, '10', '2.5', '9')
  await expect(error).toHaveText('Number of rows must be a whole number.')
  await start(page, '10', '9', '101')
  await expect(error).toHaveText('Rows and columns must be between 1 and 100.')
  await start(page, '81', '9', '9')
  await expect(error).toHaveText('Number of mines must be between 0 and 80.')
  await expect(page.locator('#start-form')).toBeVisible()
})

test('game screen shows board, flag count and hint square', async ({ page }) => {
  await page.getByRole('button', { name: 'Click To Start' }).click()
  await expect(page.getByRole('gridcell')).toHaveCount(81)
  await expect(page.locator('#flag-label')).toHaveText('Flags: 10')
  await expect(page.locator('.cell.hint')).toHaveCount(1)
  await expect(cell(page, 3, 3)).toHaveClass(/\bhint\b/)
  await expect(page.locator('#hint-start')).toBeVisible()
})

test('right-click toggles a flag and flagged cells ignore left-click', async ({ page }) => {
  await page.getByRole('button', { name: 'Click To Start' }).click()
  const target = cell(page, 1, 1)

  await target.click({ button: 'right' })
  await expect(target).toHaveClass(/\bflagged\b/)
  await expect(target).toHaveAttribute('aria-label', 'Row 1, column 1, flagged')
  await expect(page.locator('#flag-label')).toHaveText('Flags: 9')

  await target.click()
  await expect(page.locator('#game-screen')).toBeVisible()
  await expect(target).not.toHaveClass(/\brevealed\b/)

  await target.click({ button: 'right' })
  await expect(target).toHaveAttribute('aria-label', 'Row 1, column 1, covered')
  await expect(page.locator('#flag-label')).toHaveText('Flags: 10')
})

test('hitting a mine returns to start with a message', async ({ page }) => {
  await page.getByRole('button', { name: 'Click To Start' }).click()
  await cell(page, 1, 1).click()
  await expect(page.locator('#start-message')).toHaveText('Boom! You hit a mine.')
  await expect(page.locator('#mines-input')).toHaveValue('10')
})

test('flood-fill from the hint reveals the board and wins', async ({ page }) => {
  await page.getByRole('button', { name: 'Click To Start' }).click()
  await cell(page, 9, 9).click({ button: 'right' })
  await cell(page, 3, 3).click()
  await expect(page.getByRole('heading', { name: 'You Win!' })).toBeVisible()

  await page.getByRole('button', { name: 'Play Again' }).click()
  await expect(page.locator('#start-form')).toBeVisible()
  await expect(page.locator('#start-message')).toBeHidden()
})

test('New Game returns to start without a message', async ({ page }) => {
  await page.getByRole('button', { name: 'Click To Start' }).click()
  await page.getByRole('button', { name: 'New Game' }).click()
  await expect(page.locator('#start-form')).toBeVisible()
  await expect(page.locator('#start-message')).toBeHidden()
})

test('large board clears without overflowing the stack', async ({ page }) => {
  await start(page, '0', '100', '100')
  await cell(page, 50, 50).click()
  await expect(page.getByRole('heading', { name: 'You Win!' })).toBeVisible()
})
