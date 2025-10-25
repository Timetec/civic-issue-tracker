import React, { useState, useRef, useEffect } from 'react';
import * as issueService from '../services/issueService';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, Spinner, XMarkIcon } from './Icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const GREETING = "Hello! I can help you find the status of a civic issue. Just type your issue ID below.";
const issueIdRegex = /\b[a-zA-Z0-9]{6,10}\b/;

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', text: GREETING, sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userInput = inputValue.trim();
        if (!userInput) return;

        // Add user message to chat
        const userMessage: Message = { id: Date.now().toString(), text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsBotTyping(true);

        // Process user message
        const potentialId = userInput.match(issueIdRegex);
        let botResponseText = '';

        if (potentialId) {
            const issueId = potentialId[0];
            try {
                const issue = await issueService.getIssueById(issueId);
                botResponseText = `The status for issue #${issue.id} ("${issue.title}") is currently **${issue.status}**.`;
            } catch (error) {
                if (error instanceof Error) {
                    botResponseText = `I couldn't find an issue with the ID "${issueId}", or you might not have permission to view it. Please double-check the ID and try again.`;
                } else {
                    botResponseText = "An unexpected error occurred while fetching the issue details.";
                }
            }
        } else {
            botResponseText = "I'm sorry, I didn't recognize an issue ID in your message. Please provide a valid ID to check its status.";
        }

        // Add bot response
        const botMessage: Message = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
        
        // Simulate typing delay for better UX
        setTimeout(() => {
            setMessages(prev => [...prev, botMessage]);
            setIsBotTyping(false);
        }, 1000);
    };
    
    // Using a simple markdown-to-html for bold text
    const formatMessageText = (text: string) => {
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return { __html: boldedText };
    };


    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-20 right-5 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white rounded-t-lg">
                    <h3 className="font-semibold">Status Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-indigo-700">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </header>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                               <p dangerouslySetInnerHTML={formatMessageText(msg.text)}></p>
                            </div>
                        </div>
                    ))}
                    {isBotTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2">
                                <Spinner className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Enter issue ID..."
                        className="flex-1 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
                    />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-400">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
                aria-label="Open status chatbot"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
            </button>
        </>
    );
};
