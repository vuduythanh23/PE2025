import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <Home />
      </main>
      <Footer />
    </div>
  )
}
