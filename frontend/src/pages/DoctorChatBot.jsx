import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const DoctorChatBot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Add welcome message after user is loaded
    if (user && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text: `Hello Dr. ${user.name}! I'm DocBot, your AI clinical assistant${user.specialization ? ` for ${user.specialization}` : ''}. I can help you with:\n\n• Diagnosis suggestions and differential diagnosis\n• Medication information and drug interactions\n• Patient history analysis\n• Clinical decision support\n• Evidence-based treatment recommendations\n• Lab result interpretation\n\nI have access to all patient records in your department. How can I assist you today?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const userRes = await axios.get('http://localhost:5000/api/auth/profile', config);
      setUser(userRes.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { message: userMessage },
        config
      );

      // Add bot response to chat
      const botMessage = {
        type: 'bot',
        text: response.data.message,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);

      // Add error message to chat
      const errorMsg = {
        type: 'bot',
        text: `⚠️ ${errorMessage}`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="doctor" userName={user?.name || 'Doctor'} />

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg p-6 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DocBot AI Assistant</h1>
                <p className="text-sm text-blue-100">
                  Your clinical decision support system
                  {user?.specialization && ` • ${user.specialization}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/doctor')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {message.type === 'bot' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-lg">👨‍⚕️</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div>
                  <div
                    className={`rounded-lg px-4 py-3 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-green-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about diagnosis, medications, patient care, or clinical guidelines..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2 shadow-sm"
              >
                <span>Send</span>
                <span>📤</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInputMessage('Show me critical patients in my department')}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200"
                disabled={isLoading}
              >
                💊 Critical Patients
              </button>
              <button
                type="button"
                onClick={() => setInputMessage('Drug interactions to check')}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200"
                disabled={isLoading}
              >
                💊 Drug Interactions
              </button>
              <button
                type="button"
                onClick={() => setInputMessage('Latest evidence-based treatment guidelines')}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200"
                disabled={isLoading}
              >
                📚 Guidelines
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-gray-500 mt-2 text-center">
              🔒 Secure AI-powered clinical support with access to your department's patient data
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorChatBot;
