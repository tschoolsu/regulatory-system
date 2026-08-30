import type { Route } from './lib/router'
import CategoryPage from './components/CategoryPage'
import DocPage from './components/DocPage'
import Home from './components/Home'
import SearchPage from './components/SearchPage'
import SharePage from './components/SharePage'

function App({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />
    case 'cat':
      return <CategoryPage segments={route.segments} />
    case 'doc':
      return <DocPage id={route.id} />
    case 'share':
      return <SharePage key={route.id} id={route.id} />
    case 'search':
      return <SearchPage key={route.query} query={route.query} />
  }
}

export default App
