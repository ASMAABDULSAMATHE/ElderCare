import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Phone,
  ShieldAlert,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiHelpView: React.FC = () => {
  const {
    profile,
    waterCount,
    waterGoal,
    medications,
    appointments,
    caregivers,
    startCall,
    setActiveTab,
    accessibility,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${profile.name.split(' ')[0] || 'there'}! I am your ElderCare assistant. How can I help you today? You can ask about your medicine times, water intake, appointments, or how you are feeling.`,
      timestamp: 'Just now',
    },
  ]);

  const quickQuestions = [
    'What is my next appointment?',
    'When should I take my medicine?',
    'How much water have I had?',
    'Where is my appointment?',
    "I don't feel well.",
  ];

  const speakText = (text: string) => {
    if (accessibility.voiceGuidance && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const qLower = textToSend.toLowerCase();
    const isAskingToTakeAppointment =
      (qLower.includes('take') ||
        qLower.includes('book') ||
        qLower.includes('schedule') ||
        qLower.includes('add') ||
        qLower.includes('make') ||
        qLower.includes('cancel') ||
        qLower.includes('reschedule') ||
        qLower.includes('change') ||
        qLower.includes('fix') ||
        qLower.includes('reserve') ||
        qLower.includes('want an') ||
        qLower.includes('need an') ||
        qLower.includes('new')) &&
      (qLower.includes('appointment') ||
        qLower.includes('doctor') ||
        qLower.includes('clinic') ||
        qLower.includes('hospital') ||
        qLower.includes('physio') ||
        qLower.includes('consultation') ||
        qLower.includes('visit'));

    if (isAskingToTakeAppointment) {
      const refusalMsg =
        "Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic directly to schedule an appointment.";
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: refusalMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(refusalMsg);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          userData: {
            name: profile.name,
            waterCount,
            waterGoal,
            medications,
            appointments,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      const data = await response.json();
      const aiReply = data.answer || "I am here with you, Mariam. How else may I assist you today?";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(aiReply);
    } catch (err) {
      // Reliable fallback answering from local state
      let answer = "I am here to assist you, Mariam.";
      const q = textToSend.toLowerCase();

      if (q.includes('appointment')) {
        const nextApt = appointments[0];
        answer = `Your next appointment is with ${nextApt?.doctor || 'Dr. Sara Ahmed'} today at ${nextApt?.time || '6:00 PM'} at ${nextApt?.clinic || 'NMC Royal Hospital'}.`;
      } else if (q.includes('medicine') || q.includes('medication')) {
        const nextMed = medications.find((m) => m.status === 'due') || medications[0];
        answer = `Your next medicine is ${nextMed?.name} ${nextMed?.dosage} at ${nextMed?.time} (${nextMed?.foodInstruction.replace('_', ' ')}).`;
      } else if (q.includes('water')) {
        answer = `You have had ${waterCount} out of ${waterGoal} glasses of water today. Excellent progress!`;
      } else if (q.includes('feel') || q.includes('not well') || q.includes('pain')) {
        answer = `I am sorry to hear you are not feeling well. Please rest. Would you like me to connect you with your daughter Aisha or call emergency?`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(answer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-teal-600" />
          <span>How can I help?</span>
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Ask questions in clear, simple language about your schedule, reminders, or general wellness.
        </p>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-left text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 transition-colors shadow-2xs active:scale-98"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-teal-700 text-white'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-base ${
                  isUser
                    ? 'bg-teal-700 text-white font-medium rounded-tr-none'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none leading-relaxed'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? 'text-teal-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-50 text-slate-500 rounded-2xl p-4 text-sm border border-slate-200">
              Thinking gently for you, Mariam...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your question here (e.g. When is my appointment?)..."
            disabled={loading}
            className="w-full min-h-[54px] py-3.5 px-4 pr-12 rounded-2xl border-2 border-slate-200 focus:border-teal-600 focus:outline-none text-base text-slate-900 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="min-h-[54px] min-w-[54px] rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-transform active:scale-98 shadow-sm"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Medical Safety Disclaimer */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 leading-normal">
        <strong>Important Safety Notice:</strong> AI Help provides schedule reminders and assistance based on your caregiver's configured plan. It does not provide medical diagnoses. For symptoms or urgent health matters, please contact Dr. Sara Ahmed or call UAE National Ambulance (998).
      </div>
    </div>
  );
};
