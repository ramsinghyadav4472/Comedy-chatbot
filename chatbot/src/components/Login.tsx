import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  useColorMode,
} from '@chakra-ui/react'
import { useState } from 'react'

interface LoginProps {
  onLogin: () => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { colorMode } = useColorMode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple validation
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setIsLoading(false)
      return
    }

    // Demo login - accept any non-empty email/password
    setTimeout(() => {
      onLogin()
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
    >
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      >
        <VStack spacing={4} align="flex-start" w="full">
          <Heading color={colorMode === 'dark' ? 'white' : 'gray.900'}>Welcome Back! 👋</Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                  color={colorMode === 'dark' ? 'white' : 'black'}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                  color={colorMode === 'dark' ? 'white' : 'black'}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="purple"
                width="full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Log in
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  )
}

export default Login 