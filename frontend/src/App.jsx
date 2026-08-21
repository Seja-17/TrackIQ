import Logo from './components/Logo'
import KanbanBoard from './components/KanbanBoard'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Logo />
      <p className="text-gray-500 mt-2 ml-1">Smart Job Application Tracker</p>
      <KanbanBoard />
    </div>
  )
}

export default App