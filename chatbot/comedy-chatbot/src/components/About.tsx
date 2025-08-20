import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  Center,
  Avatar,
  useColorMode,
  Button,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const { colorMode } = useColorMode()
  const navigate = useNavigate()

  return (
    <Container maxW="container.xl" p={0}>
      <Box minH="100vh" bg={colorMode === 'dark' ? 'purple.900' : 'purple.50'} p={8}>
        <VStack spacing={8}>
          <Button
            onClick={() => navigate('/dashboard')}
            alignSelf="flex-start"
            variant="ghost"
            color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
            _hover={{ bg: colorMode === 'dark' ? 'purple.700' : 'purple.100' }}
          >
            ← Back to Chat
          </Button>

          <Heading size="xl" color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
            About Comedy Chatbot
          </Heading>

          <Text textAlign="center" maxW="800px" fontSize="lg" color={colorMode === 'dark' ? 'purple.300' : 'purple.600'}>
            Comedy Chatbot is an interactive platform that generates jokes in both English and Hindi.
            With multiple categories and a user-friendly interface, it aims to bring smiles to users' faces. 😊
          </Text>

          <Box w="full" pt={12}>
            <Heading size="lg" textAlign="center" mb={12} color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
              Meet Me
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} maxW="800px" mx="auto">
              {/* Ram Singh Yadav */}
              <Box
                p={6}
                borderRadius="xl"
                bg={colorMode === 'dark' ? 'purple.800' : 'white'}
                boxShadow="xl"
                _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s ease' }}
              >
                <Center>
                  <VStack spacing={4}>
                    <Avatar 
                      size="2xl" 
                      name="Ram Singh Yadav"
                      bg="purple.500"
                    />
                    <Text fontSize="2xl" fontWeight="bold" color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
                      Ram Singh Yadav
                    </Text>
                    <Text fontSize="lg" color={colorMode === 'dark' ? 'purple.300' : 'purple.500'}>
                      Full Stack Developer 
                    </Text>
                    
                    <Text textAlign="center" color={colorMode === 'dark' ? 'purple.300' : 'purple.600'}>
                      This project is developed by a skilled Full Stack Developer proficient in both front-end and back-end technologies. With expertise in JavaScript, TypeScript, React, Node.js, and database management, the developer ensures a seamless and efficient web application experience.
                      
                    </Text>
                  </VStack>
                </Center>
              </Box>
        
             
            </SimpleGrid>
          </Box> 
              

          <Text mt={12} textAlign="center" fontSize="sm" color={colorMode === 'dark' ? 'purple.300' : 'purple.600'}>
            © 2025 Comedy Chatbot. Created with ❤️ by our amazing team!
          </Text>
        </VStack>
      </Box>
    </Container>
  )
} 