import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { getUsername } from './session'

export function RequireAuth() {
  const navigate = useNavigate()
  useEffect(() => {
    const onUnauthorized = () => navigate('/login', { replace: true })
    window.addEventListener('dicefight:unauthorized', onUnauthorized)
    return () => window.removeEventListener('dicefight:unauthorized', onUnauthorized)
  }, [navigate])
  if (!getUsername()) return <Navigate to="/login" replace />
  return <Outlet />
}
