import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useRoute, useScrollTopOnNavigate } from './lib/router'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import './index.css'
import App from './App.tsx'
import Header from './components/Header.tsx'
import Footer from './components/Footer.tsx'

function Root() {
  const route = useRoute()
  useScrollTopOnNavigate(route)
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <App route={route} />
      </main>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
