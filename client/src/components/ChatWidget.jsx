'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatWidget.module.css';

// --- HELPER: Predictive Onboarding ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  // Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Keyboard Management & Escape Hatch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        chatButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setUnreadCount(0);
      setPreviewText('');
    }
  }, [isOpen]);

  // Keep ref in sync with state
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // Persist messages to sessionStorage
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
      await new Promise(resolve => setTimeout(resolve, 800));

      const rawHistory = messages.filter(m => m.role !== 'system');
      const slidingWindowHistory = rawHistory.slice(-4).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: slidingWindowHistory }),
      });

      const data = await response.json();
      const isCrisis = data.reply === 'CRISIS_ALERT';
      const replyContent = isCrisis ? data.message : data.reply;

      setMessages((prev) => [...prev, { role: 'bot', content: replyContent, isCrisis }]);

      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
        setPreviewText(replyContent.substring(0, 40) + "...");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "I don't have that exact information right now, but our front desk team would love to help. Please call 020 8123 4567." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className={styles.window}
            role="dialog"
            aria-label="Chat with Wellbeing Assistant"
          >

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatar}>🌿</div>
                <div>
                  <p className={styles.botName}>Wellbeing Assistant</p>
                  <div className={styles.statusRow}>
                    <span className={styles.statusDot} />
                    <span className={styles.statusText}>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeBtn}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot}`}
                >
                  <div className={`${styles.bubble} ${
                    msg.isCrisis   ? styles.bubbleCrisis
                    : msg.role === 'user' ? styles.bubbleUser
                    : styles.bubbleBot
                  }`}>
                    {msg.isCrisis && <AlertTriangle className={styles.crisisIcon} />}
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Quick Replies */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={styles.quickReplies}
                >
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      className={styles.quickReply}
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={styles.messageRowBot}
                >
                  <div className={styles.typingBubble}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className={styles.inputArea}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className={styles.input}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={styles.sendBtn}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB row */}
      <div className={styles.fabRow}>

        {/* Preview Toast */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.toast}
            >
              <span className={styles.toastLabel}>Bot: </span>{previewText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <button
          ref={chatButtonRef}
          onClick={() => setIsOpen(true)}
          className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
          aria-label="Open Wellbeing Assistant"
        >
          <MessageCircle size={28} />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </button>

      </div>
    </div>
  );
}
