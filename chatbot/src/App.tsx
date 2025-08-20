import { useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import theme from './theme'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <ChakraProvider theme={theme}>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ChakraProvider>
  )
}

export default App 