'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Moon, Sun, Image, Paperclip, Mic, Sparkles as SparklesIcon, X, History, LogOut, User, ChevronLeft, ChevronRight, Menu, PlusIcon } from 'lucide-react';
import { Lock } from 'lucide-react';
import LandingPage from "./components/LandingPage";


// Define a type for your chat session data
type Session = {
  id: string;
  title: string;
  updated_at: string;
  messages?: any[]; // optional because it might not exist in DB
};

// ✅ At the top of app/page.tsx

type ModelKey = 'chatgpt' | 'gemini' | 'deepseek' | 'perplexity' | 'anthropic' | 'xai';

interface ModelPreferences {
  chatgpt: boolean;
  gemini: boolean;
  deepseek: boolean;
  perplexity: boolean;
  anthropic: boolean;
  xai: boolean;
}

// Custom SVG Logo Components
const GPTLogo = ({ className = "w-8 h-8", darkMode = false }: { className?: string; darkMode?: boolean }) => (
  <div 
    className={className}
    style={{
      backgroundImage: `url(/svg-logos/${darkMode ? 'chatgpt-white.svg' : 'gpt-5.svg'})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      minWidth: '32px',
      minHeight: '32px'
    }}
  />
);

const ClaudeLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div 
    className={className}
    style={{
      backgroundImage: 'url(/svg-logos/claude.svg)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      minWidth: '32px',
      minHeight: '32px'
    }}
  />
);

const GeminiLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div 
    className={className}
    style={{
      backgroundImage: 'url(/svg-logos/gemini.svg)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      minWidth: '32px',
      minHeight: '32px'
    }}
  />
);

const DeepSeekLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div 
    className={className}
    style={{
      backgroundImage: 'url(/svg-logos/deepseek.svg)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      minWidth: '32px',
      minHeight: '32px'
    }}
  />
);
// Add these above AI_MODELS in your page.tsx

const MistralLogo = () => (
  <svg width="32" height="32" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="60" fill="#FF6B00" />
    <path
      d="M75 180 L115 70 L155 180 Z"
      fill="white"
    />
  </svg>
);

const LlamaLogo = () => (
  <svg width="32" height="32" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#007AFF" />
    <path
      d="M22 38 C22 26, 42 26, 42 38 C42 46, 22 46, 22 38 Z"
      fill="white"
    />
    <circle cx="26" cy="30" r="4" fill="white" />
    <circle cx="38" cy="30" r="4" fill="white" />
  </svg>
);

const QwenLogo = () => (
  <svg width="32" height="32" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="50" fill="#0FA970" />
    <path
      d="M128 50 C80 50, 50 90, 50 128 C50 166, 80 206, 128 206 C176 206, 206 166, 206 128 C206 90, 176 50, 128 50 Z M128 170 C102 170, 85 150, 85 128 C85 106, 102 86, 128 86 C154 86, 171 106, 171 128 C171 150, 154 170, 128 170 Z"
      fill="white"
    />
  </svg>
);

const PerplexityLogo = () => (
  <svg width="32" height="32" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="120" fill="#1A73E8" />
    <text
      x="128"
      y="155"
      textAnchor="middle"
      fontSize="140"
      fontWeight="bold"
      fill="white"
      fontFamily="Arial, sans-serif"
    >
      P
    </text>
  </svg>
);


const GrokLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div 
    className={className}
    style={{
      backgroundImage: 'url(/svg-logos/grok.svg)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      minWidth: '32px',
      minHeight: '32px'
    }}
  />
);
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChatSession } from './types';

interface AIModel {
  [x: string]: any;
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode | ((darkMode: boolean) => React.ReactNode);
  color: string;
  bgColor: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  modelId?: string;
  isBest?: boolean;
}

interface ModelResponse {
  modelId: string;
  content: string;
  isLoading: boolean;
  error?: string;
  isBest?: boolean;
}

// ===== Model Preferences Types =====

const MODELS: { name: string; key: ModelKey; logo: string }[] = [
  { name: "ChatGPT", key: "chatgpt", logo: "/logos/chatgpt.svg" },
  { name: "Gemini", key: "gemini", logo: "/logos/gemini.svg" },
  { name: "DeepSeek", key: "deepseek", logo: "/logos/deepseek.svg" },
  { name: "Perplexity", key: "perplexity", logo: "/logos/perplexity.svg" },
 
  { name: "Anthropic", key: "anthropic", logo: "/logos/anthropic.svg" },
  { name: "xAI", key: "xai", logo: "/logos/xai.svg" },
];

const FREE_MODELS = ['mistral', 'deepseek', 'google', 'meta', 'qwen'];
const PREMIUM_MODELS = [
  "gpt-5",
  "claude-4-sonnet",
  "gemini-pro",
  "deepseek-pro",
  "perplexity",
  "grok"
];


// =======================
// FREE + PREMIUM MODELS
// =======================

const AI_MODELS: AIModel[] = [
  // -----------------------
  // FREE MODELS
  // -----------------------

  {
  id: "mistral",
  name: "Mistral",
  provider: "Mistral AI",
  description: "Fast open-source 7B instruction model",
  model: "mistralai/mistral-7b-instruct:free",
  icon: <MistralLogo />,
  color: "from-blue-500 to-indigo-600",
  bgColor: "bg-blue-500/10",
  premium: false,
},

  {
    id: "deepseek",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    description: "Free version of DeepSeek",
    icon: <DeepSeekLogo className="w-8 h-8" />,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-500/10",
    premium: false,
  },

  {
    id: "gemini-free",
    name: "Google Gemini",
    provider: "Google",
    description: "Free Gemini model",
    icon: <GeminiLogo className="w-8 h-8" />,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    premium: false,
  },

  {
  id: "meta",
  name: "Meta LLaMA",
  provider: "Meta AI",
  description: "Free Meta LLaMA model",
  icon: <LlamaLogo />,
  color: "from-purple-500 to-pink-500",
  bgColor: "bg-purple-500/10",
  premium: false,
},

{
  id: "qwen",
  name: "Qwen",
  provider: "Alibaba",
  description: "Qwen 2.5 7B instruction model",
  icon: <QwenLogo />,
  color: "from-green-500 to-emerald-600",
  bgColor: "bg-green-500/10",
  premium: false,
  model: "qwen/qwen2.5-7b-instruct"
},

  // -----------------------
  // PREMIUM MODELS (LOCKED)
  // -----------------------

  {
    id: "gpt-5",
    name: "ChatGPT GPT-5",
    provider: "OpenAI",
    description: "Advanced OpenAI model",
    icon: (darkMode: boolean) => <GPTLogo className="w-8 h-8" darkMode={darkMode} />,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    premium: true,
  },

  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    description: "Premium Claude model",
    icon: <ClaudeLogo className="w-8 h-8" />,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    premium: true,
  },

  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Premium Google Gemini model",
    icon: <GeminiLogo className="w-8 h-8" />,
    color: "from-green-500 to-teal-600",
    bgColor: "bg-green-500/10",
    premium: true,
  },

  {
    id: "deepseek-pro",
    name: "DeepSeek Pro",
    provider: "DeepSeek",
    description: "Premium DeepSeek model",
    icon: <DeepSeekLogo className="w-8 h-8" />,
    color: "from-red-600 to-rose-700",
    bgColor: "bg-red-500/10",
    premium: true,
  },

  {
  id: "perplexity",
  name: "Perplexity",
  provider: "Perplexity AI",
  description: "Web-connected premium reasoning model",
  icon: <PerplexityLogo />,
  color: "from-blue-500 to-indigo-600",
  bgColor: "bg-blue-500/10",
  premium: true,
},

  {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    description: "Premium xAI model",
    icon: <GrokLogo className="w-8 h-8" />,
    color: "from-orange-500 to-yellow-600",
    bgColor: "bg-orange-500/10",
    premium: true,
  },
];





export default function Home() {
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode, mounted } = useTheme();
  const [selectedModels, setSelectedModels] = useState<string[]>(AI_MODELS.map(m => m.id));
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [modelPlan, setModelPlan] = useState<'free' | 'premium'>('free');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

type ModelKey = 'gpt-5' | 'claude-4-sonnet' | 'gemini-2.5' | 'deepseek' | 'perplexity' | 'grok';

interface ModelPreferences {
  'gpt-5': boolean;
  'claude-4-sonnet': boolean;
  'gemini-2.5': boolean;
  'deepseek': boolean;
  'perplexity': boolean;
  'grok': boolean;
}

const [modelPrefs, setModelPrefs] = useState<ModelPreferences>({
  'gpt-5': true,
  'claude-4-sonnet': true,
  'gemini-2.5': true,
  'deepseek': true,
  'perplexity': true,
  'grok': true,
});

  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [recentSessions, setRecentSessions] = useState<{
    id: string; title: string; firstMessage: string; date: string; messages: any[];
}[]>([]);

  // State for file attachments
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  

// Auto-save to recent chats
useEffect(() => {
    if (recentSessions.length > 0) {
        localStorage.setItem('recentSessions', JSON.stringify(recentSessions));
    }
}, [recentSessions]);

// Load saved chats on page load
useEffect(() => {
    const saved = localStorage.getItem('recentSessions');
    if (saved) {
        setRecentSessions(JSON.parse(saved));
    }
}, []);

// Function to save chats to history
const saveChatToHistory = (message: string) => {
    const newChat = {
        id: Date.now().toString(),
        title: message.substring(0, 30) + '...',
        firstMessage: message,
        date: new Date().toLocaleDateString(),
        messages: [{ text: message, isUser: true }]
    };
    
    setRecentSessions(prev => [newChat, ...prev]);
};

  // Check for mobile screen size and collapse sidebar by default
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Standard mobile breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
// 🔍 Filter recent chats based on search query
useEffect(() => {
  if (searchQuery.trim() === '') {
    setFilteredSessions(recentSessions);
  } else {
    const filtered = recentSessions
      .filter(session =>
        (session.title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
        (session.firstMessage?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
      )
      // ✅ Add this to ensure the structure matches ChatSession type
      .map(session => ({
        ...session,
        messages: session.messages || [],
      }));

    setFilteredSessions(filtered);
  }
}, [searchQuery, recentSessions]);


  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, responses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown="user-menu"]')) {
          setShowUserDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

useEffect(() => {
  // Load saved preferences from localStorage
  const savedPrefs = localStorage.getItem('modelPreferences');
  if (savedPrefs) {
    try {
      const parsed = JSON.parse(savedPrefs);
      setModelPrefs(parsed);
      
      // Update selected models based on loaded preferences
      const enabledModels = AI_MODELS
        .filter(model => parsed[model.id as ModelKey])
        .map(model => model.id);
      setSelectedModels(enabledModels);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }
}, []);
  
  // Load recent chat sessions
  useEffect(() => {
    if (user) {
      loadRecentSessions();
    }
  }, [user]);
  
  // Function to load recent chat sessions
const loadRecentSessions = async () => {
  if (!user) {
    setRecentSessions([]);
    return;
  }

  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    // FIXED: Throw a real Error with message
    if (error) {
      throw new Error(`Failed to load sessions: ${error.message}`);
    }

    if (!sessions || sessions.length === 0) {
      setRecentSessions([]);
      return;
    }

    const sessionsWithFirstMessage = await Promise.all(
      sessions.map(async (session) => {
        const { data: messageData, error: msgError } = await supabase
          .from('messages')
          .select('content')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true })
          .limit(1);

        if (msgError) {
          console.warn('Could not fetch first message for session', session.id, msgError);
        }

        const firstMsg = messageData?.[0]?.content || 'New conversation';

        const updatedAt = new Date(session.updated_at);
        const now = new Date();
        const dateDisplay =
          updatedAt.toDateString() === now.toDateString()
            ? 'Today'
            : updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return {
          id: session.id,
          title: session.title || 'New conversation',
          firstMessage: firstMsg,
          date: dateDisplay,
          messages: messageData || [],
        };
      })
    );

    setRecentSessions(sessionsWithFirstMessage);
  } catch (error: any) {
    // Now you'll see the REAL error message!
    console.error('Error loading recent sessions:', error.message || error);
    setRecentSessions([]);
  }
};
  
  // Function to load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Validate session ID
      if (!sessionId) {
        throw new Error('Invalid session ID');
      }
      
      // Set current session ID
      setCurrentSessionId(sessionId);
      
      // Clear current messages and responses
      setMessages([]);
      setResponses([]);
      
      // Load messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, content, role, timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) {
        console.log('Error fetching messages:', messagesError);
        throw new Error(`Failed to fetch messages: ${messagesError.message}`);
      }
      
      if (!messagesData) {
        throw new Error('No message data returned from database');
      }
      
      if (messagesData) {
        // Load all model responses for all user messages
        const userMessages = messagesData.filter((msg: { role: string; }) => msg.role === 'user');
        const allResponses = new Map();
        
        // For each user message, load its model responses
        for (const userMsg of userMessages) {
          if (userMsg.id) {
            const { data: responsesData, error: responsesError } = await supabase
              .from('model_responses')
              .select('model_id, content, is_best')
              .eq('message_id', userMsg.id);
            
            if (!responsesError && responsesData) {
              allResponses.set(userMsg.id, responsesData);
            }
          }
        }
        
        // Create proper conversational flow: user → AI responses → user → AI responses
        const formattedMessages = [];
        
        // Get only user messages and sort them chronologically
        const userMessagesOnly = messagesData.filter((msg: { role: string; }) => msg.role === 'user')
          .sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        for (const userMsg of userMessagesOnly) {
          // Add user message
          formattedMessages.push({
            id: userMsg.id,
            content: userMsg.content,
            role: 'user' as const,
            timestamp: new Date(userMsg.timestamp)
          });
          
          // Add AI responses for this user message
          if (allResponses.has(userMsg.id)) {
            const responses = allResponses.get(userMsg.id);
            for (const response of responses as Array<{model_id: string, content: string, is_best?: boolean}>) {
              formattedMessages.push({
                id: `${userMsg.id}-${response.model_id}`,
                content: response.content,
                role: 'assistant' as const,
                timestamp: new Date(userMsg.timestamp),
                modelId: response.model_id,
                isBest: response.is_best
              });
            }
          }
        }
        
        setMessages(formattedMessages);
        
        // Set responses for the last user message (for current interaction)
        if (userMessages.length > 0) {
          const lastUserMessage = userMessages[userMessages.length - 1];
          if (lastUserMessage && allResponses.has(lastUserMessage.id)) {
            const lastResponses = allResponses.get(lastUserMessage.id);
            const formattedResponses = lastResponses.map((resp: {model_id: string, content: string, is_best?: boolean}) => ({
              modelId: resp.model_id,
              content: resp.content,
              isLoading: false,
              isBest: resp.is_best
            }));
            
            setResponses(formattedResponses);
            
            // Update selected models based on responses
            const modelIds = lastResponses.map((resp: {model_id: string, content: string, is_best?: boolean}) => resp.model_id);
            setSelectedModels(modelIds);
          }
        }
      }
    } catch (error) {
      // Improved error logging with more details
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = error instanceof Error ? (error.stack || '') : JSON.stringify(error);
      console.error(`Error loading chat session: ${errorMessage}`, { error, details: errorDetails });
      
      // Show a user-friendly message
      alert('Failed to load chat session. Please try again.');
    }
  };

  // Don't render until theme is mounted to prevent hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-gray-900"></div>;
  }

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

const createNewSession = async () => {
  try {
    if (!user?.id) {
      console.error("❌ No user logged in — cannot create session");
      return null;
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        { 
          user_id: user.id,       // ✅ REQUIRED
          title: "New Chat",
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("🔥 Error creating session:", error);
    return null;
  }
};



const saveMessageToDatabase = async (message: Message, sessionId: string) => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: message.role,       // ✔ this column exists
        content: message.content  // ✔ this column exists
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;  // 👍 this is valid

  } catch (error) {
    console.error("🔥 Error saving message:", error);
    return null;
  }
};



  const saveModelResponseToDatabase = async (messageId: string, modelId: string, content: string, isBest: boolean = false) => {
    try {
      const { error } = await supabase
        .from('model_responses')
        .insert({
          message_id: messageId,
          model_id: modelId,
          content,
          is_best: isBest
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving model response:', error);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setResponses([]);
    setCurrentInput('');
    setSelectedModels(AI_MODELS.map(m => m.id));
    setCurrentSessionId(null);
     loadRecentSessions();
    
const session = await createNewSession();
  setCurrentSessionId(session.id);

const handleUpdatePreferences = async () => {
  try {
    
    // Update selected models based on preferences
    const enabledModels = AI_MODELS
      .filter(model => modelPrefs[model.id as ModelKey])
      .map(model => model.id);
    
    setSelectedModels(enabledModels);
    
    // Save to localStorage for persistence
    localStorage.setItem('modelPreferences', JSON.stringify(modelPrefs));
    
    alert('Model preferences updated successfully!');
    setShowSettings(false);
  } catch (error) {
    console.error('Error updating preferences:', error);
    alert('Failed to update preferences');
  }
};
    
    // Refresh recent sessions list
    loadRecentSessions();
  };

  const handlePasswordChange = async () => {
    if (passwordChange.new !== passwordChange.confirm) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordChange.new.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.new
      });

      if (error) throw error;
      
      alert('Password updated successfully!');
      setPasswordChange({ current: '', new: '', confirm: '' });
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

 const handleSendMessage = async () => {
  if ((!currentInput.trim() && attachedFiles.length === 0) || selectedModels.length === 0 || !user) return;


  
    // Create message content - include file information if files are attached
    let messageContent = currentInput;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(file => file.name).join(', ');
      messageContent += `\n[Attached: ${fileNames}]`;
    }
saveChatToHistory(messageContent);

if (attachedFiles.length > 0) {
    const fileNames = attachedFiles.map(file => file.name).join(', ');
    messageContent += '\n[attached: ${fileNames}]';
}

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    // Create or get session
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession();
      setCurrentSessionId(sessionId);
    }

    // Save user message to database
    let messageId: string | null = null;
    if (sessionId) {
      messageId = await saveMessageToDatabase(userMessage, sessionId);
    }

    // Initialize responses for selected models
    const initialResponses: ModelResponse[] = selectedModels.map(modelId => ({
      modelId,
      content: '',
      isLoading: true
    }));
    setResponses(initialResponses);
     try {
      // Make API call to our backend which will call OpenRouter
      // Note: In a real implementation, you would need to handle file uploads
      // This would typically involve FormData and multipart/form-data
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          models: selectedModels,
          // In a real implementation, you would upload files and include references
          attachedFiles: attachedFiles.length > 0 ? attachedFiles.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          })) : []
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Map the API responses to our local format
      const results: ModelResponse[] = data.responses.map((resp: { modelId: string; content?: string; error?: string }) => ({
        modelId: resp.modelId,
        content: resp.content || '',
        isLoading: false,
        error: resp.error
      }));

      setResponses(results);

      // Save model responses to database
      if (messageId && sessionId) {
        for (const result of results) {
          if (result.content && !result.error) {
            await saveModelResponseToDatabase(messageId, result.modelId, result.content, result.isBest);
          }
        }
      }

      // Update session title if it's the first message
      if (sessionId && messages.length === 0) {
        const title = currentInput.length > 50 ? currentInput.substring(0, 50) + '...' : currentInput;
        await supabase
          .from('chat_sessions')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
          
        // Refresh recent sessions list
        loadRecentSessions();
      }

    } catch (error) {
      console.error('Error getting responses:', error);
      setResponses(prev => prev.map(r => ({ 
        ...r, 
        error: error instanceof Error ? error.message : 'Failed to get response', 
        isLoading: false 
      })));
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused functions: handleCopyResponse and handleMarkBest

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle file attachment
  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
      setShowFilePicker(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
      setShowPhotoOptions(false);
    }
  };
  
  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Trigger file input click
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  // Handle photo options
  const handleTakePhoto = () => {
    // TODO: Implement camera functionality
    setShowPhotoOptions(false);
  };
  
  const handleSelectPhoto = () => {
    imageInputRef.current?.click();
    setShowPhotoOptions(false);
  };

  if (!user) {
  return <LandingPage />;
}


const handleUpdatePreferences = async () => {
  try {
    // Update selected models based on preferences
    const enabledModels = AI_MODELS
      .filter(model => modelPrefs[model.id as ModelKey])
      .map(model => model.id);
    
    setSelectedModels(enabledModels);
    
    // Save to localStorage for persistence
    localStorage.setItem('modelPreferences', JSON.stringify(modelPrefs));
    
    // Show toast notification
    ('Model preferences updated successfully!');
    setShowToast(true);
    setShowSettings(false);
    
    // Hide toast after 1 second
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  } catch (error) {
    console.error('Error updating preferences:', error);
  ('Failed to update preferences');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  }
};

 




  return (
/* ------------------ THEME: main wrapper (paste in place of the old wrapper) ------------------ */
<div
  className={cn(
    "flex flex-col lg:flex-row w-full h-screen overflow transition-colors duration-300",
    darkMode
      ? "bg-black text-white"
      : "bg-white text-black"
  )}
>

      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "fixed top-4 left-3 z-30 p-2 rounded-lg transition-all duration-200",
            darkMode 
              ? "bg-slate-800/90 text-white hover:bg-slate-700" 
              : "bg-white/90 text-black-900 hover:bg-black-100",
            "shadow-lg backdrop-blur-sm"
          )}
       >
          <Menu className="w-6 h-6" />
        </button>
      )}
      
<div className={cn(
  "fixed left-0 top-0 h-full transition-all duration-300 z-40",
  darkMode 
    ? "bg-black border-r border-slate-700" 
    : "bg-white border-r border-slate-300",
  sidebarCollapsed ? "w-16" : "w-64",
  isMobile && sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
)}>

                <div className={cn(
          "h-full transition-all duration-300 overflow-hidden", 
          sidebarCollapsed ? "p-3" : "pl-6 pr-0 py-6"
        )}>

        {/* Logo and Dark Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-purple-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent"
                >
                  MultiMind
                </h1>
                <p className={cn(
                  "text-sm",
                  darkMode ? "text-slate-400" : "text-slate-600"
                )}>
                  Compare AI models in real-time
                </p>
              </div>
            )}
          </div>

          
          
          {/* Dark Mode Toggle */}
          {!sidebarCollapsed && (
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-lg transition-colors mr-2",
                darkMode 
                  ? "bg-black text-white"
                  : "bg-white text-black"
              )}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
        


        {/* Sidebar Actions (Vertical List) */}
<div className="flex flex-col gap-4">

  {/* Search Bar */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={cn(
        "w-full pl-10 pr-4 py-3 rounded-xl text-sm",
        darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-black"
      )}
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
      </svg>
    </span>
  </div>

  {/* MENU ITEMS */}
<div className="mt-4 space-y-2"></div>

   {/* New Chat */}
<div 
  onClick={handleNewChat}
  className="flex items-center gap-3 cursor-pointer px-4 py-2 group hover:bg-slate-500 rounded-lg"
>
  <PlusIcon className="w-6 h-6 text-teal-400" />
  {!sidebarCollapsed && (
    <span  className="text-sm dark:text-black-700 text-grey">New Chat</span>

  )}
</div>


  {/* History */}
  <div
    onClick={() => setShowHistory(true)}
    className={cn(
      "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
     darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
  )}
  >
    <svg  className="w-4 h-4 dark:text-teal-600 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {!sidebarCollapsed && (
  <span  className="text-sm dark:text-black-900 text-grey">History</span>
)}

  </div>

</div>


{/* Create Project */}
<div
  onClick={() => setIsProjectModalOpen(true)}
  className={cn(
    "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
    darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
  )}
>
  <Plus 
    className="w-4 h-4 rotate-90 text-teal-400"
  />
  {!sidebarCollapsed && (
    <span
      className={cn(
        "text-sm",
        darkMode ? "text-white-400" : "text-black"
      )}
    >
      Create Project
    </span>
  )}
</div>


         {/* Models */}
<div
  onClick={() => setShowModelMenu(!showModelMenu)}
  className={cn(
    "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
    darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
  )}
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="w-4 h-4 text-teal-400" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
  {!sidebarCollapsed && (
    <span className={cn(
      "text-sm",
      darkMode ? "text-white-300" : "text-black"
    )}>
      Models
    </span>
  )}
</div>

{/* Models submenu */}
{showModelMenu && !sidebarCollapsed && (
  <div className="ml-10 mt-1 flex flex-col gap-1">

    <div
      onClick={() => { setModelPlan("free"); setSelectedModels(FREE_MODELS); }}
      className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
        darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
      )}
    >
      <span className={cn(
        darkMode ? "text-white-300" : "text-black"
      )}>
        Free Models
      </span>
    </div>

    <div
      onClick={() => { setModelPlan("premium"); setSelectedModels(PREMIUM_MODELS); }}
      className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
        darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
      )}
    >
      <span className={cn(
        darkMode ? "text-white-300" : "text-black"
      )}>
        Premium Models
      </span>
    </div>

  </div>
)}


          {/* Recent Chats */}
{!sidebarCollapsed && (
  <div className="px-3 mt-6">
    <h3 className={cn(
      "text-xs mb-2",
      darkMode ? "text-white-400" : "text-black"
    )}>
      Recent Chats
    </h3>

    <div className="space-y-1 max-h-[45vh] overflow-y-auto pr-2">
      {filteredSessions.length > 0 ? (
        filteredSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition",
              darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
            )}
            onClick={() => loadChatSession(session.id)}
          >
            <p className={cn(
              "text-sm truncate",
              darkMode ? "text-white-300" : "text-black"
            )}>
              {session.title}
            </p>
            <p className={cn(
              "text-xs truncate",
              darkMode ? "text-whitel-700" : "text-gray-600"
            )}>
              {session.firstMessage}
            </p>

          </div>
        ))
      ) : (
        <p className="text-slate-500 text-xs text-center py-4">No conversations yet</p>
      )}
    </div>
  </div>
)}


          {/* Settings Section */}
          <div className={cn(
            "absolute bottom-6 transition-all duration-300",
            sidebarCollapsed ? "left-3 right-3" : "left-6 right-6"
          )}>
            <div className="space-y-3">
              
              {/* User Dropdown Button */}
              <div className="flex items-center gap-2 relative" data-dropdown="user-menu">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={cn(
                    "flex items-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-purple-700 text-white rounded-lg hover:from-black-700 hover:to-purple-800 transition-all duration-200 shadow-lg flex-grow",
                    sidebarCollapsed ? "justify-center px-2" : "px-4"
                  )}
                  title={user?.email || "User Menu"}
                >
                  <User className="w-4 h-4" />
                  {!sidebarCollapsed && <span className="text-sm">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>}
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className={cn(
                    "absolute bottom-full mb-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl z-50 min-w-[240px] overflow-hidden",
                    sidebarCollapsed ? "left-0" : "left-0"
                  )}>
                    {/* Email ID Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 border-b border-slate-600/50">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {user?.email || 'user@example.com'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {/* Settings */}
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>
                      
                      {/* Logout */}
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {!sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                      "py-3 px-2 bg-gradient-to-r from-teal-500 to-purple-700 text-white rounded-lg hover:from-black-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                    )}
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Collapse Button - Now below the human button when sidebar is collapsed */}
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={cn(
                    "w-full py-3 px-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-lg hover:from-violet-700 hover:to-purple-800 transition-all duration-200 shadow-lg flex justify-center mt-3"
                  )}
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300", 
        isMobile ? "ml-0 p-0" : sidebarCollapsed ? "ml-16 p-6" : "ml-64 p-6"
      )}>


        {selectedModels.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to MultiMind</h2>
            <p className="text-slate-400 text-lg mb-8">Click &quot;All&quot; above to start comparing all AI models</p>
            <button 
              onClick={() => setSelectedModels(AI_MODELS.map(m => m.id))}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start with All Models
            </button>
          </div>
        ) : (
          /* Chat Interface */
          <>
            {/* Header/Partition with Menu - Mobile Only */}
            {isMobile && (
              <div className={cn(
                "fixed top-0 left-0 right-0 z-30 backdrop-blur-xl border-b transition-all duration-300",
                darkMode 
                  ? "bg-slate-900/90 border-slate-700" 
                  : "bg-white/90 border-slate-200"
              )}>
                <div className="flex items-center justify-between px-6 py-4">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      darkMode 
                        ? "text-white hover:bg-slate-700/60" 
                        : "text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className={cn(
                    "text-lg font-semibold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    MultiMind Chat
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            )}

          


<div
   className="
    w-full 
    overflow-x-auto 
    whitespace-nowrap 
    scrollbar-thin 
    scrollbar-thumb-slate-500 
    scrollbar-track-transparent 
  "
  style={{ height: "500px" }}  // 👈 FIX: locks model section height so scroll bar moves up
>
  <div className="flex flex-row gap-4 px-4 min-w-max">

    {AI_MODELS.filter(m =>
      modelPlan === 'free'
        ? FREE_MODELS.includes(m.id)
        : PREMIUM_MODELS.includes(m.id)
    ).map((model) => {
      const modelId = model.id;
      const isSelected = selectedModels.includes(modelId) && !(PREMIUM_MODELS.includes(modelId) && modelPlan !== 'premium');
      const response = responses.find(r => r.modelId === modelId);
      const hasMessages = messages.length > 0;
      
      return (
        <div
          key={modelId}
          className={cn(
            "rounded-2xl shadow-lg border flex flex-col transition-all duration-300",
            "min-w-[330px] max-w-[330px] h-[480px] p-0",
            darkMode ? "bg-[#1A1A1A] border-[#333]" : "bg-[#FAFAFA] border-[#DDD]"
          )}
        >
          

    

                    {/* Model Header */}
                    <div className={cn(
                      "mb-6",
                      isSelected ? "" : "flex flex-col items-center justify-start pt-4 h-full"
                    )}>
                    

                      {isSelected ? (
                        <div className={cn(
                          "flex items-center justify-between w-full transition-all duration-300 px-4 py-3",
                          darkMode 
                            ? "bg-slate-700 border-b border-slate-600"
                            : "bg-white border-b border-gray-200"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 -ml-2">
                              {typeof model?.icon === 'function' ? model.icon(darkMode) : model?.icon}
                            </div>
                            <div>
                              <h3 className={cn(
                                  "font-bold text-lg transition-colors duration-300",
                                  darkMode ? "text-white" : "text-gray-900"
                              )}>{model?.name}</h3>
                              <p className={cn(
                                  "text-sm transition-colors duration-300",
                                  darkMode ? "text-gray-300" : "text-gray-600"
                              )}>{model?.provider}</p>
                            </div>
                          </div>
                          
                          
                          {/* Toggle Switch - Deselect Model */}
                          <button 
                            onClick={() => {
  if (PREMIUM_MODELS.includes(modelId)) {
    setShowSubscribeModal(true); // show “Upgrade to unlock”
    return;
  }
  handleModelToggle(modelId);
}}


                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 bg-black border border-slate-700",
                            )}
                            title="Deselect Model"
                          >
                            <span
                              className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 translate-x-6"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 h-full">
                          <div className="flex items-center justify-center w-8 h-8">
                          </div>
                          
                          <button 
                           
                            onClick={() => {
  if (PREMIUM_MODELS.includes(modelId)) {
    setShowSubscribeModal(true);
    return;
  }
  handleModelToggle(modelId);
}}

                            className="w-6 h-6 flex items-center justify-center"
                            title="Select Model"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    

                    {/* Chat Content */}
                    <div className={cn(
                      "flex-1 transition-opacity duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50",
                      isSelected ? "" : "hidden"
                    )}>
{/* 🔒 LOCKED PREMIUM MODEL UI */}
{PREMIUM_MODELS.includes(modelId) && (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <Lock className="w-10 h-10 text-gray-400 mb-4" />
    <h2 className="text-lg font-semibold text-gray-300 mb-2">Locked</h2>
    <p className="text-gray-400 mb-4">Upgrade to unlock this model</p>

    <div className="w-full max-w-xs">
      <button
        onClick={() => setShowSubscribeModal(true)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-90 transition"
      >
        Upgrade to Unlock
      </button>
    </div>
  </div>
)}

                      <div className="space-y-4 px-8 py-4">
                     {hasMessages && isSelected && !PREMIUM_MODELS.includes(modelId) && (

                        <div className="space-y-6">

                          {/* Display messages filtered for this specific model */}
                          {messages.filter(message => 
                            message.role === 'user' || message.modelId === modelId
                          ).map((message, index) => (
                            <div key={message.id || index}>
                              {message.role === 'user' ? (
                                /* User Message */
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className={cn(
                                      "text-base leading-relaxed",
                                      darkMode ? "text-white" : "text-gray-900"
                                    )}>{message.content}</p>
                                  </div>
                                </div>
                              ) : (
                                /* AI Response Message - Only for this specific model */
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                                    {typeof model?.icon === 'function' ? model.icon(darkMode) : model?.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="prose prose-sm max-w-none">
                                      <p className={cn(
                                        "text-base leading-relaxed whitespace-pre-wrap",
                                        darkMode ? "text-white" : "text-gray-900"
                                      )}>{message.content}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Current AI Response (for the latest user message) */}
                          {messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                                {typeof model?.icon === 'function' ? model.icon(darkMode) : model?.icon}
                              </div>
                              <div className="flex-1">
                                {response?.isLoading ? (
                                  <div className={cn(
                                    "flex items-center gap-2",
                                    darkMode ? "text-gray-300" : "text-gray-600"
                                  )}>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                    <span className="text-sm">Thinking...</span>
                                  </div>
                                ) : response?.error ? (
                                  <p className="text-red-600 text-sm">{response.error}</p>
                                ) : response?.content ? (
                                  <div className="prose prose-sm max-w-none">
                                    <p className={cn(
                                      "text-base leading-relaxed whitespace-pre-wrap",
                                      darkMode ? "text-white" : "text-gray-900"
                                    )}>{response.content}</p>
                                  </div>
                                ) : (
                                  <p className={cn(
                                    "text-sm",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  )}>Ready to respond...</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!hasMessages && (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className={cn(
                            "w-16 h-16 mb-6 flex items-center justify-center transition-all duration-300",
                            isSelected 
                              ? "opacity-100"
                              : "opacity-40"
                          )}>
                            {typeof model?.icon === 'function' ? model.icon(darkMode) : model?.icon}
                          </div>
                          <h3 className={cn(
                            "text-2xl font-semibold mb-3 transition-colors duration-300",
                            isSelected
                              ? darkMode ? "text-white" : "text-gray-900"
                              : "text-gray-400"
                          )}>
                            {model?.name === "GPT-5" && "Hi, I'm GPT-5."}
                            {model?.name === "Claude Sonnet 4" && "Hi maher, how are you?"}
                            {model?.name === "Gemini" && "Hello, Taniya"}
                            {model?.name === "DeepSeek" && "Hi, I'm DeepSeek."}
                          </h3>
                          <p className={cn(
                            "text-base text-center max-w-md transition-colors duration-300",
                            isSelected
                              ? darkMode ? "text-gray-300" : "text-gray-600"
                              : "text-gray-400"
                          )}>
                            {isSelected ? "How can I help you today?" : "Model disabled"}
                          </p>
                        </div>
                      )}
                      </div>
                    </div>


                  </div>
                );
              })}
              </div>
            </div>

            {/* Bottom Message Input */}
            <div className={cn(
              "fixed backdrop-blur-xl shadow-2xl transition-all duration-300 border-2 z-10 max-w-4xl mx-auto",
              darkMode 
                ? "bg-slate-800/90 border-slate-600" 
                : "bg-white/95 border-slate-300",
              isMobile 
                ? "bottom-0 left-0 right-0 rounded-t-2xl" 
                : sidebarCollapsed ? "bottom-8 left-20 right-6 rounded-2xl" : "bottom-8 left-72 right-6 rounded-2xl"
            )}>
              <div className="flex items-center p-2">
                {/* Left Action Buttons */}
                <div className="flex items-center gap-1 mr-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      className={cn(
                        "p-2 transition-all duration-200 rounded-lg hover:scale-105",
                        darkMode 
                          ? "text-white hover:bg-slate-700/60" 
                          : "text-slate-700 hover:bg-slate-200/80"
                      )}
                      title="Add Photo"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    
                    {/* Photo Options Dropdown */}
                    {showPhotoOptions && (
                      <div className={cn(
                        "absolute bottom-full mb-2 left-0 rounded-lg shadow-lg border min-w-[140px] z-50",
                        darkMode 
                          ? "bg-slate-800 border-slate-600" 
                          : "bg-white border-slate-200"
                      )}>
                        <button
                          onClick={handleTakePhoto}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors rounded-t-lg flex items-center gap-2",
                            darkMode 
                              ? "text-white hover:bg-slate-700" 
                              : "text-gray-900 hover:bg-slate-100"
                          )}
                        >
                           Take Photo
                        </button>
                        <button
                          onClick={handleSelectPhoto}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors rounded-b-lg flex items-center gap-2",
                            darkMode 
                              ? "text-white hover:bg-slate-700" 
                              : "text-gray-900 hover:bg-slate-100"
                          )}
                        >
                          Select Photo
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={openFilePicker}
                    className={cn(
                      "p-2 transition-all duration-200 rounded-lg hover:scale-105",
                      darkMode 
                        ? "text-white hover:bg-slate-700/60" 
                        : "text-slate-700 hover:bg-slate-200/80"
                    )}
                    title="Attach Files"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  {/* Hidden file inputs */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileAttachment}
                    className="hidden" 
                    multiple 
                    accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.xlsx,.xls,.ppt,.pptx"
                  />
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleImageUpload}
                    className="hidden" 
                    multiple 
                    accept="image/*"
                  />
                </div>

                {/* Attached Files Display */}
                {attachedFiles.length > 0 && (
                  <div className={cn(
                    "flex flex-wrap gap-2 mb-2 max-w-full overflow-x-auto py-2",
                    darkMode ? "bg-slate-700/60" : "bg-slate-100",
                    "rounded-lg px-2"
                  )}>
                    {attachedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-center gap-1 py-1 px-2 rounded-md",
                          darkMode ? "bg-slate-600" : "bg-white border border-slate-200"
                        )}
                      >
                        {file.type.startsWith('image/') ? (
                          <div className="w-5 h-5 flex-shrink-0">
                            <Image className="w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 flex-shrink-0">
                            <Paperclip className="w-full h-full" />
                          </div>
                        )}
                        <span className={cn(
                          "text-xs truncate max-w-[100px]",
                          darkMode ? "text-white" : "text-slate-700"
                        )}>
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeAttachedFile(index)}
                          className={cn(
                            "p-1 rounded-full hover:bg-opacity-80",
                            darkMode ? "hover:bg-slate-500" : "hover:bg-slate-200"
                          )}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Main Input Field */}
                <div className="relative flex-grow">
                  <input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 border-2 transition-all duration-200",
                      darkMode 
                        ? "bg-slate-700/60 text-white placeholder-slate-400 border-slate-600 focus:border-violet-500" 
                        : "bg-slate-50 text-slate-800 placeholder-slate-500 border-slate-300 focus:border-violet-500"
                    )}
                    disabled={selectedModels.length === 0 || isLoading}
                  />
                  {selectedModels.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        darkMode ? "text-slate-500 bg-slate-600/30" : "text-slate-400 bg-slate-200/50"
                      )}>
                        Select at least one model
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    className={cn(
                      "p-2 transition-all duration-200 rounded-lg hover:scale-105",
                      darkMode 
                        ? "text-white hover:bg-slate-700/60" 
                        : "text-slate-700 hover:bg-slate-200/80"
                    )}
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || selectedModels.length === 0 || isLoading}
                    className={cn(
                      "p-2.5 transition-all duration-200 rounded-lg shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                      currentInput.trim() && selectedModels.length > 0 && !isLoading
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-slate-600/50 text-slate-400"
                    )}
                    title="Send Message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div ref={messagesEndRef} />

{showHistory && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-600 shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Chat History</h2>
        <button onClick={() => setShowHistory(false)}>
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="max-h-[60vh] overflow-y-auto space-y-2">
        {recentSessions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">
            No history found
          </p>
        ) : (
          recentSessions.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                loadChatSession(s.id);
                setShowHistory(false);
              }}
              className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition text-white"
            >
              <p className="font-medium truncate">{s.title}</p>
              <p className="text-sm text-slate-300 truncate">{s.firstMessage}</p>
              <p className="text-xs text-slate-500">{s.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}


      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border-2 border-slate-600 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Change Password</h3>
              
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordChange.current}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 border-2 border-slate-600"
                />
                
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordChange.new}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 border-2 border-slate-600"
                />
                
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordChange.confirm}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 border-2 border-slate-600"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading || !passwordChange.current || !passwordChange.new || !passwordChange.confirm}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg py-3 px-4 font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>

                {/* Model Preferences Section */}
<div className="mt-8 bg-slate-900/50 rounded-xl p-7 border border-slate-700 max-h-[45vh] overflow-y-auto custom-scrollbar">
  <h3 className="text-lg font-semibold mb-7 text-white  top-0 bg-slate-900/50 pb-3 backdrop-blur-sm">
    Customize your chat AI model preferences
  </h3>
  <p className="text-sm text-slate-400 mb-7">
    Easily update your selections anytime in the settings
  </p>

  <div className="space-y-3">
    {AI_MODELS.map((model) => (
      <div
        key={model.id}
        className="flex items-center justify-between bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition"
      >
        {/* Left Side (Logo + Name + Description) */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 flex items-center justify-center">
            {typeof model.icon === 'function' ? model.icon(darkMode) : model.icon}
          </div>
          <div>
            <span className="text-sm font-medium text-white">{model.name}</span>
            <p className="text-xs text-slate-400">{model.description}</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => {
  // If model is premium → block toggle
  if (model.premium) {
    setShowSubscribeModal(true);
    return;
  }

  // Otherwise allow toggle
  setModelPrefs((prev) => ({
    ...prev,
    [model.id as ModelKey]: !prev[model.id as ModelKey],
  }));
}}

          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            modelPrefs[model.id as ModelKey] ? "bg-violet-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
              modelPrefs[model.id as ModelKey] ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>
    ))}
  </div>

  <button
    onClick={handleUpdatePreferences}
    className="mt-5 w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-medium py-3 rounded-lg hover:from-violet-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
  >
    Update preferences
  </button>
</div>


              
              {/* Sign Out Button */}
              <div className="mt-6 pt-6 border-t border-slate-600">
                <button
                  onClick={() => {
                    signOut();
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
 </button>
</div>
</div>
</div>
</div>
)}




{/* ✅ Project Creation Modal */}
{isProjectModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-96">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Create New Project</h2>

      <input
        type="text"
        placeholder="Project Name"
        value={newProject.name}
        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
        className="w-full mb-3 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-white"
      />

      <textarea
        placeholder="Description (optional)"
        value={newProject.description}
        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        className="w-full mb-4 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-white"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsProjectModalOpen(false)}
          className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (!newProject.name.trim()) {
              alert('Please enter a project name');
              return;
            }
            console.log('✅ Project Created:', newProject);
            setIsProjectModalOpen(false);
            setNewProject({ name: '', description: '' });
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:from-violet-700 hover:to-purple-800 transition"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}
       {/* option B */}
{showSubscribeModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">

      <h2 className="text-2xl font-bold mb-2">Upgrade your plan</h2>
      <p className="text-gray-600 mb-4">Get access to all premium AI models:</p>

      <ul className="text-left text-gray-700 mb-4 space-y-1">
        <li>✔ ChatGPT (GPT-5)</li>
        <li>✔ Claude</li>
        <li>✔ Google Gemini</li>
        <li>✔ Perplexity</li>
        <li>✔ Grok</li>
      </ul>

      <p className="text-xl font-semibold mb-5">₹599 / month</p>

      <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl w-full">
        Subscribe Now
      </button>

      <button
        onClick={() => setShowSubscribeModal(false)}
        className="mt-3 px-5 py-2.5 bg-gray-300 rounded-xl w-full"
      >
        Cancel
      </button>

    </div>
  </div>
)}


      </div>  
   
  );
}
function setModelPrefs(parsed: any) {
  throw new Error('Function not implemented.');
}

function setSelectedModels(enabledModels: string[]) {
  throw new Error('Function not implemented.');
}



function setShowToast(arg0: boolean) {
  throw new Error('Function not implemented.');
}

