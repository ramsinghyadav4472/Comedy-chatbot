import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import About from './components/About'
import { theme } from './theme'
import GeminiChat from './components/GeminiChat'

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
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/about" 
            element={
              isAuthenticated ? (
                <About />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? (
                <GeminiChat onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </Router>
    </ChakraProvider>
  )
}

export default App 