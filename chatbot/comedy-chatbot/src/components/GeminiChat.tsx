import { useState, useEffect } from 'react';
import { generateContent, verifyApiAccess } from '../services/gemini';
import { Navigation } from './Navigation';
import {
  Box,
  Container,
  VStack,
  Textarea,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Link,
} from '@chakra-ui/react';

interface GeminiChatProps {
  onLogout: () => void;
}

export default function GeminiChat({ onLogout }: GeminiChatProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  // Check API access on component mount
  useEffect(() => {
    const checkApiAccess = async () => {
      try {
        const apiStatus = await verifyApiAccess();
        if (!apiStatus.isValid) {
          setError(apiStatus.message);
          toast({
            title: 'API Configuration Error',
            description: apiStatus.message,
            status: 'error',
            duration: null,
            isClosable: true,
          });
        } else {
          setIsInitialized(true);
          toast({
            title: 'API Connected',
            description: 'Successfully connected to Gemini API',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify API access';
        setError(errorMessage);
        toast({
          title: 'API Error',
          description: errorMessage,
          status: 'error',
          duration: null,
          isClosable: true,
        });
      }
    };

    checkApiAccess();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await generateContent(prompt);
      setResponse(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Navigation onLogout={onLogout} />
        <Center h="calc(100vh - 80px)">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Initializing AI chat...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation onLogout={onLogout} />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription display="block">
                  {error}
                  {error.includes('API key') && (
                    <Text mt={2}>
                      Please visit{' '}
                      <Link
                        href="https://makersuite.google.com/app/apikey"
                        color="blue.500"
                        isExternal
                      >
                        Google AI Studio
                      </Link>
                      {' '}to configure your API key.
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your message here..."
                size="lg"
                rows={4}
                bg="white"
                isDisabled={!!error}
              />
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Generating..."
                isDisabled={!prompt.trim() || !!error}
                width="full"
              >
                Generate Response
              </Button>
            </VStack>
          </form>

          {response && (
            <Box bg="white" p={6} borderRadius="md" shadow="sm">
              <Text fontWeight="bold" mb={2}>Response:</Text>
              <Text whiteSpace="pre-wrap">{response}</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 