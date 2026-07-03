import { expect, test } from '@playwright/test'

test('login → campaign → encounter → initiative → combat turns', async ({
  page,
}) => {
  const stamp = Date.now()
  const dm = `dm-${stamp}`
  const campaignName = `Crimson Vault ${stamp}`

  // login
  await page.goto('/login')
  await page.getByLabel(/dungeon master name/i).fill(dm)
  await page.getByRole('button', { name: /take your seat/i }).click()
  await expect(page).toHaveURL(/\/campaigns$/)

  // create campaign and open it
  await page.getByPlaceholder(/name your world/i).fill(campaignName)
  await page.getByRole('button', { name: /forge it/i }).click()
  await page.getByRole('link', { name: new RegExp(campaignName) }).click()
  await expect(page).toHaveURL(/\/campaigns\/[\w-]+$/)

  // add two PCs
  await page.getByPlaceholder(/character name/i).fill('Lyra')
  await page.getByPlaceholder(/player name/i).fill('Elara')
  await page.getByRole('button', { name: /add pc/i }).click()
  await expect(page.getByText('Lyra')).toBeVisible()
  await page.getByPlaceholder(/character name/i).fill('Thorne')
  await page.getByPlaceholder(/player name/i).fill('Marcus')
  await page.getByRole('button', { name: /add pc/i }).click()
  await expect(page.getByText('Thorne')).toBeVisible()

  // create encounter — navigates straight to setup
  await page.getByPlaceholder(/ambush at the bridge/i).fill('Sunken Crypt')
  await page.getByRole('button', { name: /create encounter/i }).click()
  await expect(page).toHaveURL(/\/encounters\/[\w-]+\/setup$/)

  // stage two goblins
  await page.getByPlaceholder(/e\.g\. goblin/i).fill('Goblin')
  await page.getByLabel(/^qty$/i).fill('2')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByText('Goblin 1')).toBeVisible()
  await expect(page.getByText('Goblin 2')).toBeVisible()

  // add both PCs to the party
  await page.getByRole('button', { name: /add lyra to party/i }).click()
  await expect(
    page.getByRole('button', { name: /remove lyra from party/i }),
  ).toBeVisible()
  await page.getByRole('button', { name: /add thorne to party/i }).click()
  await expect(
    page.getByRole('button', { name: /remove thorne from party/i }),
  ).toBeVisible()

  // start → initiative
  await page.getByRole('button', { name: /start encounter/i }).click()
  await expect(page).toHaveURL(/\/initiative$/)

  // PC initiatives (monsters are pre-rolled)
  await page.getByLabel(/^lyra initiative$/i).fill('18')
  await page.getByLabel(/^thorne initiative$/i).fill('12')
  await expect(page.getByText(/4 of 4.*initiatives set/i)).toBeVisible()
  await page.getByRole('button', { name: /begin combat/i }).click()

  // combat
  await expect(page).toHaveURL(/\/combat$/)
  await expect(page.getByText(/now acting/i)).toBeVisible()
  await expect(page.getByLabel('Round 1')).toBeVisible()

  // advance a full round: 4 combatants → after 4 clicks the round increments
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /next turn/i }).click()
  }
  await expect(page.getByLabel('Round 2')).toBeVisible()

  // combat state survives a reload (sessionStorage)
  await page.reload()
  await expect(page.getByLabel('Round 2')).toBeVisible()
  await expect(page.getByText(/now acting/i)).toBeVisible()
})
