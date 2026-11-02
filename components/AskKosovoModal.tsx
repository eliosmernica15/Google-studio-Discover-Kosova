'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  MapPin,
  ExternalLink,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Place, LanguageCode } from '@/lib/types';

interface AskKosovoModalProps {
  onClose: () => void;
  onOpenPlaceById: (placeId: string) => void;
  lang: LanguageCode;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citedPlaces?: Array<{
    id: string;
    title: string;
    cityId: string;
    category: string;
    rating: number;
    localTip: string;
  }>;
  citedDishes?: Array<{ id: string; name: string; region: string }>;
  citedTrails?: Array<{ id: string; title: string; difficulty: string; distanceKm: number }>;
}

export const AskKosovoModal: React.FC<AskKosovoModalProps> = ({
  onClose,
  onOpenPlaceById,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Përshëndetje! I am **Ask Kosovo**, your guide grounded exclusively in verified Discover Kosovo guides, trail waypoints, and culinary hubs. How can I assist your journey across the seven cities today?',
    },
  ]);

  const suggestedQuestions = [
    'Where is the best sunset view in Prizren?',
    'Where can I eat authentic Flija baked under a saç?',
    'What should I know before hiking Peaks of the Balkans?',
    'Tell me about the DokuFest festival venues',
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, language: lang }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        citedPlaces: data.citedPlaces,
        citedDishes: data.citedDishes,
        citedTrails: data.citedTrails,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the server right now. Try searching for specific landmarks like Prizren Fortress or Rugova Canyon in the City Atlas!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-kosovo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl h-[85vh] max-h-[700px] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="ask-kosovo-title" className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Ask Kosovo Guide</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Grounded AI
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Strictly verified local places and trails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close Ask Kosovo modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm'
                    : 'bg-slate-950 border border-white/10 text-slate-200 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Grounded Citation Place Cards */}
                {m.citedPlaces && m.citedPlaces.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                      Referenced In-App Places:
                    </span>
                    <div className="space-y-1.5">
                      {m.citedPlaces.map((cp) => (
                        <div
                          key={cp.id}
                          onClick={() => {
                            onClose();
                            onOpenPlaceById(cp.id);
                          }}
                          className="p-2 bg-slate-900 rounded-xl border border-white/10 hover:border-amber-400/50 cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-bold text-white text-[11px]">{cp.title}</span>
                            <span className="text-[10px] text-slate-400">({cp.cityId})</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 p-2 bg-slate-950/50 rounded-xl w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Grounded engine searching Discover Kosovo data...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about places, dishes, festivals, or trails..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            aria-label="Ask Kosovo input"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition"
            aria-label="Send question to Ask Kosovo"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
