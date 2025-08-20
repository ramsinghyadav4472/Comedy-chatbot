import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Function to verify API key format
function isValidApiKey(key: string): boolean {
  // Basic check for API key format (starts with 'AIza')
  return key.startsWith('AIza');
}

// Define joke generation parameters
const JOKE_GENERATION_PROMPT = `You are a comedy chatbot. Your responses should always be in the form of jokes or humorous content.
Rules:
1. Always respond with a joke or humorous content
2. Keep responses family-friendly
3. If the user's query isn't specifically asking for a joke, turn it into a joke-related response
4. Include a mix of wordplay, puns, and situational humor
5. Keep responses concise and punchy`;

// Model configuration for joke generation
const MODEL_CONFIG = {
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.8,  // Higher temperature for more creative jokes
    topP: 0.8,        // Nucleus sampling for more varied responses
    topK: 40,         // Consider more options for creative responses
    maxOutputTokens: 200,  // Keep jokes concise
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
};

// Function to initialize the Gemini client
function getGeminiClient() {
  if (!API_KEY) {
    throw new Error("API key is missing. Please check your .env file and make sure you've added VITE_GEMINI_API_KEY.");
  }

  if (!isValidApiKey(API_KEY)) {
    throw new Error("Invalid API key format. Please make sure you've copied the correct API key from Google AI Studio.");
  }
  
  try {
    return new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
    throw new Error(`Failed to initialize Gemini client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to get the Gemini model with joke-specific configuration
function getGeminiModel() {
  try {
    const genAI = getGeminiClient();
    return genAI.getGenerativeModel(MODEL_CONFIG);
  } catch (error) {
    console.error("Error getting Gemini model:", error);
    throw new Error(`Failed to get Gemini model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to format the user's prompt for joke generation
function formatJokePrompt(userPrompt: string): string {
  // If the prompt already asks for a joke, use it directly
  if (userPrompt.toLowerCase().includes('joke') || 
      userPrompt.toLowerCase().includes('funny') || 
      userPrompt.toLowerCase().includes('humor')) {
    return `${JOKE_GENERATION_PROMPT}\n\nUser: ${userPrompt}\nBot:`;
  }
  
  // Otherwise, modify the prompt to request a joke about the topic
  return `${JOKE_GENERATION_PROMPT}\n\nUser: Tell me a joke about ${userPrompt}\nBot:`;
}

// Function to verify API access
export async function verifyApiAccess(): Promise<{ isValid: boolean; message: string }> {
  try {
    if (!API_KEY) {
      return {
        isValid: false,
        message: "API key is missing. Please add your API key to the .env file."
      };
    }

    if (!isValidApiKey(API_KEY)) {
      return {
        isValid: false,
        message: "Invalid API key format. Please check your API key."
      };
    }

    const model = getGeminiModel();
    const result = await model.generateContent("Tell me a quick joke");
    await result.response;
    
    return {
      isValid: true,
      message: "API connection successful"
    };
  } catch (error) {
    console.error("API verification error:", error);
    return {
      isValid: false,
      message: error instanceof Error ? error.message : "Failed to verify API access"
    };
  }
}

// Main function to generate joke content
export async function generateContent(prompt: string): Promise<string> {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt cannot be empty");
  }
  
  try {
    // Verify API access first
    const apiStatus = await verifyApiAccess();
    if (!apiStatus.isValid) {
      throw new Error(apiStatus.message);
    }

    const model = getGeminiModel();
    const formattedPrompt = formatJokePrompt(prompt);
    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    
    // Clean up the response to remove any system prompts or prefixes
    let joke = response.text().trim();
    if (joke.toLowerCase().startsWith('bot:')) {
      joke = joke.substring(4).trim();
    }
    
    return joke;
  } catch (error) {
    console.error("Error generating content:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Please check your API key configuration at https://makersuite.google.com/app/apikey");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please check your usage at https://makersuite.google.com/app/apikey");
      } else if (error.message.includes("network")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    } else {
      throw new Error("An unknown error occurred while generating content");
    }
  }
}

// Example usage:
// const response = await generateContent("Explain how AI works in a few words");
// console.log(response); 