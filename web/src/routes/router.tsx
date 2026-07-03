import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { CampaignDetailPage } from '../features/campaigns/CampaignDetailPage'
import { CampaignsPage } from '../features/campaigns/CampaignsPage'
import { CombatPage } from '../features/combat/CombatPage'
import { EncounterSetupPage } from '../features/encounters/EncounterSetupPage'
import { InitiativePage } from '../features/encounters/InitiativePage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:id/encounters/:eid/setup" element={<EncounterSetupPage />} />
          <Route path="/encounters/:eid/initiative" element={<InitiativePage />} />
          <Route path="/encounters/:eid/combat" element={<CombatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/campaigns" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
