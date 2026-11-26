import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { Chat } from './pages/Chat'
import { Home } from './pages/Home'
import { ItemDetail } from './pages/ItemDetail'
import { Messages } from './pages/Messages'
import { Mine } from './pages/Mine'
import { Publish } from './pages/Publish'
import { UserProfile } from './pages/UserProfile'
import { ItemsProvider } from './store/ItemsContext'

export default function App() {
  return (
    <ToastProvider>
      <ItemsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/mine" element={<Mine />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </ItemsProvider>
    </ToastProvider>
  )
}
