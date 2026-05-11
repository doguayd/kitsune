import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Languages from './pages/Languages'
import Assessment from './pages/Assessment'
import Onboarding from './pages/Onboarding'
import { useStore } from './store/useStore'

function FirstLaunchGuard({ children }) {
  const { user, loadProfile, loadAllLanguages } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([loadProfile(), loadAllLanguages()]).then(() => {
      const u = useStore.getState().user
      // New user: name is still default "Tilki" and no languages added
      if (u && u.name === 'Tilki' && (!u.languages || u.languages.length === 0)) {
        navigate('/onboarding', { replace: true })
      }
    })
  }, [])

  return children
}

export default function App() {
  const checkServer = useStore(s => s.checkServer)

  useEffect(() => {
    checkServer()
    const id = setInterval(checkServer, 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex h-screen bg-surface text-cream overflow-hidden">
      <Layout>
        <FirstLaunchGuard>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/chat"        element={<Chat />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/languages"   element={<Languages />} />
            <Route path="/assessment"  element={<Assessment />} />
            <Route path="/onboarding"  element={<Onboarding />} />
            <Route path="*"            element={<Navigate to="/" />} />
          </Routes>
        </FirstLaunchGuard>
      </Layout>
    </div>
  )
}
