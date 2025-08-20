import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorMode,
  useToast,
  Link,
  VStack,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const { colorMode } = useColorMode()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onLogin()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bg={colorMode === 'dark' ? 'purple.900' : 'purple.50'}
      bgGradient={
        colorMode === 'dark'
          ? 'linear(to-b, purple.900, purple.800)'
          : 'linear(to-b, purple.50, white)'
      }
    >
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing="8">
            <Stack spacing="6" textAlign="center">
              <Heading
                size={{ base: 'xl', md: '2xl' }}
                bgGradient={
                  colorMode === 'dark'
                    ? 'linear(to-r, purple.200, pink.200)'
                    : 'linear(to-r, purple.600, pink.600)'
                }
                bgClip="text"
              >
                Welcome to Laugh Together 🎭
              </Heading>
              <Text
                color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
                fontSize={{ base: 'lg', md: 'xl' }}
              >
                Sign in to start your comedy journey!
              </Text>
            </Stack>

            <Box
              py={{ base: '8', sm: '8' }}
              px={{ base: '4', sm: '10' }}
              bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'white'}
              boxShadow={{ base: 'none', sm: 'xl' }}
              borderRadius={{ base: 'xl', sm: 'xl' }}
              backdropFilter="blur(10px)"
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing="6">
                  <FormControl isRequired>
                    <FormLabel color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'white'}
                      borderColor={colorMode === 'dark' ? 'purple.400' : 'purple.200'}
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px purple.400' }}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'white'}
                      borderColor={colorMode === 'dark' ? 'purple.400' : 'purple.200'}
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px purple.400' }}
                      placeholder="Enter your password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    colorScheme="purple"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    bgGradient="linear(to-r, purple.500, pink.500)"
                    _hover={{
                      bgGradient: 'linear(to-r, purple.600, pink.600)',
                    }}
                  >
                    Sign in
                  </Button>
                </VStack>
              </form>

              <HStack justify="space-between" mt="6">
                <Link
                  color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
                  fontSize="sm"
                  _hover={{ textDecoration: 'none', color: 'purple.400' }}
                >
                  Forgot password?
                </Link>
                <Link
                  color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
                  fontSize="sm"
                  _hover={{ textDecoration: 'none', color: 'purple.400' }}
                >
                  Sign up
                </Link>
              </HStack>
            </Box>
          </Stack>
        </MotionBox>

        <Text
          mt={8}
          textAlign="center"
          fontSize="sm"
          color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
        >
          © 2025 Laugh Together. Created by Ram Singh Yadav
        </Text>
      </Container>
    </Box>
  )
} 