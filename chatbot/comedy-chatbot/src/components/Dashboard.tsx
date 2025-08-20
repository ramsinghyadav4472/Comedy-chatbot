import {
  Box,
  Flex,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  useToast,
  Avatar,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  Select,
  useColorMode,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure,
  Heading,
  Container,
  FormControl,
  FlexProps,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { 
  FiSend, 
  FiUpload, 
  FiRefreshCw, 
  FiPlus, 
  FiUser, 
  FiLogOut,
  FiMoon,
  FiSun,
  FiMic,
  FiSmile,
  FiTrash2,
  FiCode,
  FiHeart,
  FiCoffee,
  FiMessageSquare,
} from 'react-icons/fi'
import { jokeCategories, hindiJokeCategories } from '../data/jokes'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { generateContent } from '../services/gemini'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  reactions: string[]
  category?: string
  jokeIndex?: number
}

interface ChatHistory {
  id: number
  title: string
  messages: Message[]
  timestamp: Date
}

const emojiReactions = ["😂", "🤣", "👏", "❤️", "🎯", "🤔"]

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

// Define proper types for motion components
type MotionFlexProps = Omit<FlexProps, keyof MotionProps> & MotionProps
const StyledMotionFlex = motion<FlexProps>(Flex)

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Hey there! I'm your comedy companion! Ask me something funny! 😄",
    sender: 'bot',
    timestamp: new Date(),
    reactions: []
  }])
  const [inputValue, setInputValue] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi'>('english')
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [shownJokes, setShownJokes] = useState<{[key: string]: number[]}>({
    'english': [],
    'hindi': []
  })
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose
  } = useAlertDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    const isJokeRequest = userMessage.toLowerCase().includes('joke') || 
                         userMessage.toLowerCase().includes('another') ||
                         userMessage.toLowerCase().includes('चुटकुला') ||
                         userMessage.toLowerCase().includes('जोक')

    if (!isJokeRequest) {
      return {
        id: Date.now(),
        text: "I'm your comedy chatbot! Ask me to tell you a joke in English or Hindi 😊",
        sender: 'bot',
        timestamp: new Date(),
        reactions: []
      }
    }

    // First try to get response from Gemini API with timeout
    try {
      const timeoutPromise = new Promise<Message>((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 5000); // 5 second timeout
      });

      const apiPromise = generateContent(userMessage).then(response => ({
        id: Date.now(),
        text: response,
        sender: 'bot' as const,
        timestamp: new Date(),
        reactions: [] as string[]
      } satisfies Message));

      // Race between API call and timeout
      return await Promise.race([apiPromise, timeoutPromise]);
    } catch (error) {
      console.error("API Error:", error);
      // If timeout or other error, quickly fall back to local messages
      return getLocalJokeResponse(userMessage);
    }
  }

  // Helper function to get local joke response
  const getLocalJokeResponse = (userMessage: string): Message => {
    // Check if the message contains Hindi characters or specifically asks for Hindi
    const isHindi = /[\u0900-\u097F]/.test(userMessage) || 
                   userMessage.toLowerCase().includes('hindi') ||
                   userMessage.toLowerCase().includes('हिंदी') ||
                   userMessage.toLowerCase().includes('hindi joke') ||
                   userMessage.toLowerCase().includes('हिंदी में चुटकुला') ||
                   userMessage.toLowerCase().includes('हिंदी में जोक')

    // Check if specifically asking for English
    const isEnglish = userMessage.toLowerCase().includes('english') ||
                     userMessage.toLowerCase().includes('in english') ||
                     userMessage.includes('english joke')

    // Update language based on request
    if (isHindi) {
      setSelectedLanguage('hindi')
    } else if (isEnglish) {
      setSelectedLanguage('english')
    }

    // Use the updated language for this response
    const currentLanguage = isHindi ? 'hindi' : (isEnglish ? 'english' : selectedLanguage)
    const jokes = currentLanguage === 'hindi' ? hindiJokeCategories : jokeCategories

    // Only update category if explicitly requested
    let currentCategory = selectedCategory
    if (userMessage.toLowerCase().includes('programming') || userMessage.toLowerCase().includes('प्रोग्रामिंग')) {
      currentCategory = 'programming'
      setSelectedCategory('programming')
    } else if (userMessage.toLowerCase().includes('animal') || userMessage.toLowerCase().includes('जानवर')) {
      currentCategory = 'animals'
      setSelectedCategory('animals')
    } else if (userMessage.toLowerCase().includes('food') || userMessage.toLowerCase().includes('खाना')) {
      currentCategory = 'food'
      setSelectedCategory('food')
    } else if (userMessage.toLowerCase().includes('general') || userMessage.toLowerCase().includes('सामान्य')) {
      currentCategory = 'general'
      setSelectedCategory('general')
    }

    const categoryJokes = jokes[currentCategory as keyof typeof jokes]
    if (!categoryJokes || categoryJokes.length === 0) {
      return {
        id: Date.now(),
        text: currentLanguage === 'hindi' 
          ? `क्षमा करें, मेरे पास इस श्रेणी में कोई चुटकुले नहीं हैं।`
          : `Sorry, I don't have any jokes in that category right now.`,
        sender: 'bot',
        timestamp: new Date(),
        reactions: []
      }
    }

    // Get shown jokes for current language
    const shownJokesForLanguage = shownJokes[currentLanguage] || []
    
    // Filter out jokes that have already been shown
    const availableJokes = Array.from({ length: categoryJokes.length }, (_, i) => i)
      .filter(index => !shownJokesForLanguage.includes(index))

    // If all jokes have been shown, reset the shown jokes for this language
    if (availableJokes.length === 0) {
      setShownJokes(prev => ({
        ...prev,
        [currentLanguage]: []
      }))
      // Use all jokes after reset
      availableJokes.push(...Array.from({ length: categoryJokes.length }, (_, i) => i))
    }

    // Select a random joke from available jokes
    const randomIndex = Math.floor(Math.random() * availableJokes.length)
    const jokeIndex = availableJokes[randomIndex]

    // Add the joke to shown jokes
    setShownJokes(prev => ({
      ...prev,
      [currentLanguage]: [...(prev[currentLanguage] || []), jokeIndex]
    }))

    return {
      id: Date.now(),
      text: categoryJokes[jokeIndex],
      sender: 'bot',
      timestamp: new Date(),
      reactions: [],
      category: currentCategory,
      jokeIndex: jokeIndex
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim()) return

    setIsLoading(true)
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      reactions: []
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])

    try {
      const botResponse = await generateBotResponse(inputValue)
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error generating response:", error)
      // Show error message to user
      const errorMessage = {
        id: Date.now(),
        text: "Sorry, I'm having trouble connecting. Let me tell you a local joke instead! 😊",
        sender: 'bot' as const,
        timestamp: new Date(),
        reactions: [] as string[]
      } satisfies Message;
      setMessages(prev => [...prev, errorMessage]);
      // Get local joke as fallback
      const localResponse = getLocalJokeResponse(inputValue)
      setMessages(prev => [...prev, localResponse])
    } finally {
      setInputValue('')
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.sender === 'user')
      const title = firstUserMessage 
        ? firstUserMessage.text.slice(0, 30) + (firstUserMessage.text.length > 30 ? "..." : "")
        : "New Chat"

      const newHistory: ChatHistory = {
        id: Date.now(),
        title,
        messages: [...messages],
        timestamp: new Date()
      }
      const updatedHistory = [newHistory, ...chatHistory]
      setChatHistory(updatedHistory)
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    }

    setMessages([{
      id: 1,
      text: "Hey there! I'm your comedy companion! Ask me something funny! 😄",
      sender: 'bot',
      timestamp: new Date(),
      reactions: []
    }])

    toast({
      title: "New chat started",
      description: "Previous chat has been saved to history",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Error',
        description: 'Voice input is not supported in your browser. Please use Chrome.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US'

    recognition.onstart = () => {
      toast({
        title: 'Listening...',
        description: 'Speak now',
        status: 'info',
        duration: null,
        isClosable: true,
      })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(transcript)
      toast.closeAll()
    }

    recognition.onerror = (event: any) => {
      toast({
        title: 'Error',
        description: `Voice recognition error: ${event.error}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    recognition.onend = () => {
      toast.closeAll()
    }

    recognition.start()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) { // 1MB limit
      toast({
        title: 'Error',
        description: 'File size should be less than 1MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInputValue(text.slice(0, 1000)) // Limit to 1000 characters
    }
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    reader.readAsText(file)
  }

  const addReaction = (messageId: number, emoji: string) => {
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        const reactions = message.reactions.includes(emoji)
          ? message.reactions.filter(r => r !== emoji)
          : [...message.reactions, emoji]
        return { ...message, reactions }
      }
      return message
    }))
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages)
    toast({
      title: "Chat loaded",
      description: "Previous conversation restored",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleClearHistory = () => {
    setChatHistory([])
    localStorage.removeItem('chatHistory')
    onAlertClose()
    toast({
      title: "History cleared",
      description: "All chat history has been cleared",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleDeleteChat = (chatId: number) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
    setChatHistory(updatedHistory)
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    toast({
      title: "Chat deleted",
      description: "The chat has been removed from history",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  // Add transition styles
  const transitionStyles = {
    transition: 'all 0.3s ease-in-out'
  }

  // Add background animation styles
  const backgroundStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }

  return (
    <Box 
      minH="100vh" 
      bg={colorMode === 'dark' ? 'gray.900' : 'purple.50'}
      position="relative"
      overflow="hidden"
    >
      {/* Background Gradient */}
      <Box
        sx={{
          ...backgroundStyles,
          bg: 'transparent',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: colorMode === 'dark' ? 0.15 : 0.2,
            bgGradient: colorMode === 'dark' 
              ? 'radial(circle at 30% 20%, purple.500 0%, transparent 70%)'
              : 'radial(circle at 30% 20%, purple.200 0%, transparent 70%)',
          },
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: colorMode === 'dark' ? 0.15 : 0.2,
            bgGradient: colorMode === 'dark'
              ? 'radial(circle at 70% 80%, pink.500 0%, transparent 70%)'
              : 'radial(circle at 70% 80%, pink.200 0%, transparent 70%)',
          }
        }}
      />

      {/* Individual Emojis */}
      {/* Row 1 */}
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎭"', position: 'absolute', top: '5%', left: '10%', animation: 'float1 15s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😂"', position: 'absolute', top: '5%', left: '30%', animation: 'float2 18s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤣"', position: 'absolute', top: '5%', left: '50%', animation: 'float3 20s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😊"', position: 'absolute', top: '5%', left: '70%', animation: 'float4 17s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎪"', position: 'absolute', top: '5%', left: '90%', animation: 'float5 19s infinite ease-in-out' } }} />

      {/* Row 2 */}
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤡"', position: 'absolute', top: '25%', left: '5%', animation: 'float6 16s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎨"', position: 'absolute', top: '25%', left: '25%', animation: 'float7 22s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤪"', position: 'absolute', top: '25%', left: '45%', animation: 'float8 21s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😎"', position: 'absolute', top: '25%', left: '65%', animation: 'float9 18s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎯"', position: 'absolute', top: '25%', left: '85%', animation: 'float10 20s infinite ease-in-out' } }} />

      {/* Row 3 */}
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤹‍♂️"', position: 'absolute', top: '45%', left: '15%', animation: 'float11 19s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😆"', position: 'absolute', top: '45%', left: '35%', animation: 'float12 17s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎭"', position: 'absolute', top: '45%', left: '55%', animation: 'float13 21s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😂"', position: 'absolute', top: '45%', left: '75%', animation: 'float14 16s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤣"', position: 'absolute', top: '45%', left: '95%', animation: 'float15 20s infinite ease-in-out' } }} />

      {/* Row 4 */}
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😊"', position: 'absolute', top: '65%', left: '10%', animation: 'float16 18s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎪"', position: 'absolute', top: '65%', left: '30%', animation: 'float17 22s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤡"', position: 'absolute', top: '65%', left: '50%', animation: 'float18 19s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎨"', position: 'absolute', top: '65%', left: '70%', animation: 'float19 17s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤪"', position: 'absolute', top: '65%', left: '90%', animation: 'float20 21s infinite ease-in-out' } }} />

      {/* Row 5 */}
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😎"', position: 'absolute', top: '85%', left: '5%', animation: 'float21 20s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '36px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎯"', position: 'absolute', top: '85%', left: '25%', animation: 'float22 16s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '34px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🤹‍♂️"', position: 'absolute', top: '85%', left: '45%', animation: 'float23 18s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '38px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"😆"', position: 'absolute', top: '85%', left: '65%', animation: 'float24 22s infinite ease-in-out' } }} />
      <Box sx={{ ...backgroundStyles, fontSize: '32px', opacity: colorMode === 'dark' ? 0.35 : 0.4, _before: { content: '"🎭"', position: 'absolute', top: '85%', left: '85%', animation: 'float25 19s infinite ease-in-out' } }} />

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes float1 { 0%, 100% { transform: translate(0, 0) rotate(-10deg); } 50% { transform: translate(20px, 20px) rotate(10deg); } }
          @keyframes float2 { 0%, 100% { transform: translate(0, 0) rotate(10deg); } 50% { transform: translate(-20px, 15px) rotate(-10deg); } }
          @keyframes float3 { 0%, 100% { transform: translate(0, 0) rotate(-5deg); } 50% { transform: translate(15px, -20px) rotate(5deg); } }
          @keyframes float4 { 0%, 100% { transform: translate(0, 0) rotate(15deg); } 50% { transform: translate(-15px, 20px) rotate(-15deg); } }
          @keyframes float5 { 0%, 100% { transform: translate(0, 0) rotate(-8deg); } 50% { transform: translate(20px, -15px) rotate(8deg); } }
          @keyframes float6 { 0%, 100% { transform: translate(0, 0) rotate(12deg); } 50% { transform: translate(-15px, -20px) rotate(-12deg); } }
          @keyframes float7 { 0%, 100% { transform: translate(0, 0) rotate(-15deg); } 50% { transform: translate(20px, 15px) rotate(15deg); } }
          @keyframes float8 { 0%, 100% { transform: translate(0, 0) rotate(8deg); } 50% { transform: translate(-20px, 20px) rotate(-8deg); } }
          @keyframes float9 { 0%, 100% { transform: translate(0, 0) rotate(-12deg); } 50% { transform: translate(15px, -15px) rotate(12deg); } }
          @keyframes float10 { 0%, 100% { transform: translate(0, 0) rotate(15deg); } 50% { transform: translate(-15px, -20px) rotate(-15deg); } }
          @keyframes float11 { 0%, 100% { transform: translate(0, 0) rotate(-8deg); } 50% { transform: translate(20px, 20px) rotate(8deg); } }
          @keyframes float12 { 0%, 100% { transform: translate(0, 0) rotate(10deg); } 50% { transform: translate(-20px, 15px) rotate(-10deg); } }
          @keyframes float13 { 0%, 100% { transform: translate(0, 0) rotate(-15deg); } 50% { transform: translate(15px, -20px) rotate(15deg); } }
          @keyframes float14 { 0%, 100% { transform: translate(0, 0) rotate(12deg); } 50% { transform: translate(-15px, 20px) rotate(-12deg); } }
          @keyframes float15 { 0%, 100% { transform: translate(0, 0) rotate(-8deg); } 50% { transform: translate(20px, -15px) rotate(8deg); } }
          @keyframes float16 { 0%, 100% { transform: translate(0, 0) rotate(15deg); } 50% { transform: translate(-20px, -20px) rotate(-15deg); } }
          @keyframes float17 { 0%, 100% { transform: translate(0, 0) rotate(-10deg); } 50% { transform: translate(15px, 15px) rotate(10deg); } }
          @keyframes float18 { 0%, 100% { transform: translate(0, 0) rotate(8deg); } 50% { transform: translate(-15px, -15px) rotate(-8deg); } }
          @keyframes float19 { 0%, 100% { transform: translate(0, 0) rotate(-12deg); } 50% { transform: translate(20px, 20px) rotate(12deg); } }
          @keyframes float20 { 0%, 100% { transform: translate(0, 0) rotate(10deg); } 50% { transform: translate(-20px, 15px) rotate(-10deg); } }
          @keyframes float21 { 0%, 100% { transform: translate(0, 0) rotate(-15deg); } 50% { transform: translate(15px, -20px) rotate(15deg); } }
          @keyframes float22 { 0%, 100% { transform: translate(0, 0) rotate(12deg); } 50% { transform: translate(-15px, 20px) rotate(-12deg); } }
          @keyframes float23 { 0%, 100% { transform: translate(0, 0) rotate(-8deg); } 50% { transform: translate(20px, -15px) rotate(8deg); } }
          @keyframes float24 { 0%, 100% { transform: translate(0, 0) rotate(15deg); } 50% { transform: translate(-20px, -20px) rotate(-15deg); } }
          @keyframes float25 { 0%, 100% { transform: translate(0, 0) rotate(-10deg); } 50% { transform: translate(15px, 15px) rotate(10deg); } }
        `}
      </style>

      {/* Fixed Top Navigation */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        py={{ base: 2, md: 4 }}
        px={{ base: 4, md: 6 }}
        bg={colorMode === 'dark' ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
        borderBottomWidth="1px"
        borderColor={colorMode === 'dark' ? 'gray.800' : 'purple.100'}
        backdropFilter="blur(10px)"
        zIndex={1000}
        sx={transitionStyles}
      >
        <Flex 
          justify="space-between" 
          align="center" 
          maxW="1400px" 
          mx="auto"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 2, md: 0 }}
        >
          <Flex
            spacing={3}
            align="center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo
              size={{ base: "32px", md: "40px" }}
              color={colorMode === 'dark' ? '#E9D8FD' : '#6B46C1'}
            />
            <Heading
              size={{ base: "md", md: "lg" }}
              bgGradient={
                colorMode === 'dark'
                  ? 'linear(to-r, purple.200, pink.200)'
                  : 'linear(to-r, purple.600, pink.600)'
              }
              bgClip="text"
              display="flex"
              alignItems="center"
              gap={2}
            >
              Laugh Together
              <Text as="span" fontSize={{ base: "lg", md: "xl" }}>
                🤖
              </Text>
            </Heading>
          </Flex>
          <HStack spacing={4}>
            <MotionIconButton
              aria-label="Toggle color mode"
              onClick={toggleColorMode}
              variant="ghost"
              color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              icon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
            />
            <Button
              leftIcon={<FiUser />}
              onClick={() => navigate('/about')}
              variant="ghost"
              color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
              size={{ base: "sm", md: "md" }}
            >
              About
            </Button>
            <MotionIconButton
              aria-label="Sign out"
              onClick={onLogout}
              variant="ghost"
              color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              icon={<FiLogOut />}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content with Sidebar */}
      <Flex 
        pt={{ base: "120px", md: "72px" }} 
        minH="calc(100vh - 72px)"
        direction={{ base: "column", md: "row" }}
      >
        {/* Left Sidebar */}
        <Box
          w={{ base: "100%", md: "300px" }}
          bg={colorMode === 'dark' ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
          borderRightWidth="1px"
          borderColor={colorMode === 'dark' ? 'gray.800' : 'purple.100'}
          backdropFilter="blur(10px)"
          p={4}
          overflowY="auto"
          h={{ base: "auto", md: "calc(100vh - 72px)" }}
          position={{ base: "relative", md: "fixed" }}
          left={0}
          sx={transitionStyles}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colorMode === 'dark' ? '#2D3748' : '#805AD5',
              borderRadius: '24px',
            },
          }}
        >
          <VStack spacing={4} align="stretch">
            <MotionButton
              leftIcon={<FiPlus />}
              onClick={handleNewChat}
              colorScheme="purple"
              size="sm"
              w="full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              New Chat
            </MotionButton>
            
            <Divider />

            {/* Joke Type Selection */}
            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
                Joke Categories
              </Text>
              <VStack spacing={2}>
                {Object.entries({
                  general: { icon: FiSmile, label: 'General' },
                  programming: { icon: FiCode, label: 'Programming' },
                  food: { icon: FiCoffee, label: 'Food' },
                  animals: { icon: FiHeart, label: 'Animals' }
                }).map(([key, { icon: Icon, label }]) => (
                  <MotionButton
                    key={key}
                    leftIcon={<Icon />}
                    variant={selectedCategory === key ? 'solid' : 'ghost'}
                    colorScheme="purple"
                    size="sm"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => setSelectedCategory(key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {label}
                  </MotionButton>
                ))}
              </VStack>
            </Box>

            <Divider />
            
            <Text mb={2} fontSize="sm" fontWeight="medium" color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
              Chat History
            </Text>
            
            <VStack spacing={2} align="stretch">
              <AnimatePresence>
                {chatHistory.map((chat) => (
                  <MotionButton
                    key={chat.id}
                    variant="ghost"
                    justifyContent="space-between"
                    w="full"
                    h="auto"
                    py={2}
                    px={3}
                    onClick={() => loadChat(chat)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 90, 213, 0.1)'
                    }}
                  >
                    <HStack spacing={3} flex={1}>
                      <Box color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}>
                        <FiMessageSquare />
                      </Box>
                      <VStack spacing={0} align="start" flex={1}>
                        <Text
                          color={colorMode === 'dark' ? 'purple.200' : 'purple.600'}
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {chat.title}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={colorMode === 'dark' ? 'purple.400' : 'purple.500'}
                        >
                          {new Date(chat.timestamp).toLocaleString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      aria-label="Delete chat"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    />
                  </MotionButton>
                ))}
              </AnimatePresence>
            </VStack>
            
            {chatHistory.length > 0 && (
              <MotionButton
                leftIcon={<FiTrash2 />}
                onClick={onAlertOpen}
                size="sm"
                colorScheme="purple"
                variant="outline"
                mt="auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear History
              </MotionButton>
            )}
          </VStack>
        </Box>

        {/* Main Chat Area */}
        <Box 
          flex={1} 
          ml={{ base: 0, md: "300px" }} 
          position="relative" 
          h={{ base: "calc(100vh - 200px)", md: "calc(100vh - 72px)" }}
        >
          <VStack spacing={0} h="full">
            {/* Messages Container */}
            <Box
              flex={1}
              w="full"
              overflowY="auto"
              px={{ base: 4, md: 6 }}
              pb={32}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: colorMode === 'dark' ? '#2D3748' : '#805AD5',
                  borderRadius: '24px',
                },
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <MotionBox
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    mb={2}
                  >
                    <Flex
                      maxW="4xl"
                      mx="auto"
                      w="full"
                      justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      <Flex
                        maxW={message.sender === 'user' ? '60%' : '75%'}
                        gap={2}
                        bg={
                          message.sender === 'user'
                            ? colorMode === 'dark'
                              ? 'rgba(45, 55, 72, 0.3)'
                              : 'purple.50'
                            : colorMode === 'dark'
                              ? 'rgba(26, 32, 44, 0.3)'
                              : 'white'
                        }
                        p={2}
                        borderRadius="lg"
                        boxShadow="sm"
                        borderWidth="1px"
                        borderColor={
                          message.sender === 'user'
                            ? colorMode === 'dark'
                              ? 'purple.700'
                              : 'purple.200'
                            : colorMode === 'dark'
                              ? 'gray.700'
                              : 'gray.200'
                        }
                        sx={transitionStyles}
                        flexDirection={message.sender === 'user' ? 'row-reverse' : 'row'}
                        ml={message.sender === 'bot' ? '20px' : 'auto'}
                        mr={message.sender === 'user' ? '20px' : 'auto'}
                      >
                        <Avatar
                          size="sm"
                          name={message.sender === 'user' ? 'User' : 'Bot'}
                          bg={message.sender === 'user' ? 'purple.500' : 'green.500'}
                        />
                        <Box flex={1}>
                          <HStack justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} mb={0.5} spacing={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color={
                                message.sender === 'user'
                                  ? colorMode === 'dark' ? 'purple.300' : 'purple.600'
                                  : colorMode === 'dark' ? 'green.300' : 'green.600'
                              }
                            >
                              {message.sender === 'user' ? 'You' : 'Comedy Bot'}
                            </Text>
                          </HStack>
                          <Text
                            color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
                            textAlign={message.sender === 'user' ? 'right' : 'left'}
                            mb={0.5}
                            fontSize="sm"
                            lineHeight="short"
                          >
                            {message.text}
                          </Text>
                          <Text
                            fontSize="10px"
                            color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                            textAlign={message.sender === 'user' ? 'right' : 'left'}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Text>
                          {message.sender === 'bot' && (
                            <HStack mt={2} spacing={1}>
                              {message.reactions.length > 0 ? (
                                // Show selected reactions
                                <HStack spacing={1}>
                                  {[...new Set(message.reactions)].map((emoji) => (
                                    <MotionButton
                                      key={emoji}
                                      size="xs"
                                      variant="solid"
                                      colorScheme="purple"
                                      onClick={() => addReaction(message.id, emoji)}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {emoji}
                                    </MotionButton>
                                  ))}
                                  <MotionButton
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setMessages(messages.map(msg => 
                                      msg.id === message.id ? { ...msg, reactions: [] } : msg
                                    ))}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    ❌
                                  </MotionButton>
                                </HStack>
                              ) : (
                                // Show all available reactions when none selected
                                <Popover>
                                  <PopoverTrigger>
                                    <MotionButton
                                      size="xs"
                                      variant="ghost"
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      Add Reaction 😊
                                    </MotionButton>
                                  </PopoverTrigger>
                                  <PopoverContent width="auto" p={2}>
                                    <PopoverBody>
                                      <HStack spacing={1}>
                                        {emojiReactions.map((emoji) => (
                                          <MotionButton
                                            key={emoji}
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => {
                                              addReaction(message.id, emoji);
                                            }}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            {emoji}
                                          </MotionButton>
                                        ))}
                                      </HStack>
                                    </PopoverBody>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </HStack>
                          )}
                        </Box>
                      </Flex>
                    </Flex>
                  </MotionBox>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area with Footer */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg={colorMode === 'dark' ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
              borderTop="1px"
              borderColor={colorMode === 'dark' ? 'gray.800' : 'purple.100'}
              backdropFilter="blur(10px)"
              pt={2}
              pb={2}
              sx={transitionStyles}
            >
              <Box maxW="4xl" mx="auto" px={{ base: 4, md: 6 }}>
                <Box
                  bg={colorMode === 'dark' ? 'gray.900' : 'white'}
                  borderRadius="lg"
                  shadow="lg"
                  p={4}
                  mb={2}
                >
                  <form onSubmit={handleSend}>
                    <HStack spacing={2}>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me to tell you a joke..."
                        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                        borderColor={colorMode === 'dark' ? 'gray.700' : 'purple.200'}
                        _hover={{ borderColor: 'purple.500' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                        pr={{ base: "80px", md: "100px" }}
                      />
                      <HStack position="absolute" right={5}>
                        <MotionIconButton
                          aria-label="Voice input"
                          icon={<FiMic />}
                          onClick={handleVoiceInput}
                          colorScheme="purple"
                          variant="ghost"
                          size="sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                        <MotionIconButton
                          aria-label="Upload file"
                          icon={<FiUpload />}
                          onClick={() => fileInputRef.current?.click()}
                          colorScheme="purple"
                          variant="ghost"
                          size="sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                        <MotionIconButton
                          aria-label="Send message"
                          icon={<FiSend />}
                          type="submit"
                          colorScheme="purple"
                          size="sm"
                          isLoading={isLoading}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      </HStack>
                    </HStack>
                  </form>
                </Box>
                
                {/* Footer */}
                <Text
                  textAlign="center"
                  fontSize="xs"
                  color={colorMode === 'dark' ? 'purple.400' : 'purple.500'}
                  display={{ base: "none", md: "block" }}
                >
                  © 2024 Laugh Together. Created by{' '}
                  <Text as="span" fontWeight="medium">
                    Ram Singh Yadav (12307974)
                  </Text>
                  {' & '}
                  <Text as="span" fontWeight="medium">
                    Shivam k. Shivam (12308407)
                  </Text>
                </Text>
              </Box>
            </Box>
          </VStack>
        </Box>
      </Flex>

      {/* Clear History Alert Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg={colorMode === 'dark' ? 'gray.900' : 'white'}
            sx={transitionStyles}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Chat History
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will permanently delete all your chat history.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearHistory} ml={3}>
                Clear All
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Dashboard 