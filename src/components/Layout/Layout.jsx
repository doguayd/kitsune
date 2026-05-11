import Titlebar from './Titlebar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-surface">
          {children}
        </main>
      </div>
    </div>
  )
}
