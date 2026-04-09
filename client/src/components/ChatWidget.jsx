'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER: Predictive Onboarding ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
};

const QUICK_REPLIES = ['📅 Class Schedule', '💷 Pricing & Sliding Scale', '📍 Location & Hours'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('wellbeing_chat');
      if (saved) return JSON.parse(saved);
    }
    return [
      { role: 'bot', content: `${getGreeting()} I am the Wellbeing Assistant. How can I support you today?` }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Von Restorff Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [previewText, setPreviewText] = useState('');

  // Refs for Accessibility and Auto-scrolling
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatButtonRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  // --- a11y: Auto-Scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- a11y: Keyboard Management & Escape Hatch ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Return focus to the toggle button so screen readers don't get lost
        chatButtonRef.current?.focus(); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // --- a11y: Auto-focus input when opened ---
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setUnreadCount(0); // Clear notifications when opened
      setPreviewText('');
    }
  }, [isOpen]);

  // ADD THIS BLOCK: Keep the ref perfectly synced with the state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('wellbeing_chat', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // Simulate network delay for "Illusion of Life" (HCI)
      await new Promise(resolve => setTimeout(resolve, 800));// 
      // --- NEW: The Sliding Window ---
      // We only want to send the last 4 messages to save context limit and money.
      // We filter out the 'isCrisis' flags because the LLM doesn't need to see those.
      const rawHistory = messages.filter(m => m.role !== 'system');
      
      // Slice the last 4 messages (e.g., User -> Bot -> User -> Bot)
      const slidingWindowHistory = rawHistory.slice(-4).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user', // LLMs expect the bot to be called 'assistant'
        content: m.content
      }));
      
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: slidingWindowHistory }),
      });

      const data = await response.json();
      const isCrisis = data.reply === 'CRISIS_ALERT';
      const replyContent = isCrisis ? data.message : data.reply;

      setMessages((prev) => [
        ...prev, 
        { role: 'bot', content: replyContent, isCrisis }
      ]);

      // --- Von Restorff Notification Trigger ---
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
        setPreviewText(replyContent.substring(0, 40) + "...");
      }

    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: 'bot', content: "I don't have that exact information right now, but our front desk team would love to help. Please call 020 8123 4567." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* --- The Chat Window (With Pop-In Animation) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="mb-4 w-80 md:w-96 flex flex-col h-[550px] max-h-[80vh] overflow-hidden rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-2xl shadow-blue-900/15"
            role="dialog"
            aria-label="Chat with Wellbeing Assistant"
          >
            
            {/* Header */}
            <div className="bg-blue-600/95 backdrop-blur-md px-5 py-4 text-white flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🌿</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Wellbeing Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <p className="text-[11px] text-blue-100 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3.5 text-sm leading-relaxed ${
                    msg.isCrisis 
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl rounded-bl-sm shadow-sm' 
                    : msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-blue-600/20' 
                    : 'bg-white/90 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-white'
                  }`}>
                    {msg.isCrisis && <AlertTriangle className="w-5 h-5 mb-2 text-rose-600" />}
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Quick Replies (Only show if exactly 1 message exists) */}
              {messages.length === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 mt-4">
                  {QUICK_REPLIES.map((reply) => (
                    <button 
                      key={reply} 
                      onClick={() => handleSend(reply)}
                      className="text-xs font-medium px-3 py-1.5 bg-white/60 hover:bg-white text-blue-800 border border-blue-100 rounded-full shadow-sm transition-all hover:shadow hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* HCI: Typing Indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/90 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-white flex gap-1.5 items-center">
                    {[0, 1, 2].map((dot) => (
                      <motion.div 
                        key={dot}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        animate={{ y: ["0%", "-50%", "0%"] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.2, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-3 bg-white/80 backdrop-blur-md border-t border-white/60 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 p-3 bg-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-white transition-all text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:outline-none"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- The Floating Toggle Button & Von Restorff Notification --- */}
      <div className="relative flex items-center gap-4">
        
        {/* Preview Toast (Von Restorff) */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="hidden md:block bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 text-sm max-w-[200px] truncate"
            >
              <span className="font-semibold text-blue-600">Bot: </span>{previewText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <button
          ref={chatButtonRef}
          onClick={() => setIsOpen(true)}
          className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-blue-600/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 relative`}
          aria-label="Open Wellbeing Assistant"
        >
          <MessageCircle size={28} />
          
          {/* Unread Badge (Von Restorff - highly contrasting Rose color) */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}