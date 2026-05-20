'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { MinDoraAvatar } from '@/components/Logo';
import { createClient } from '@/lib/supabase';
import { detectZone } from '@/lib/gemini';
import type { ChatMessage, Zone } from '@/types';

interface UIMessage {
  role: 'user' | 'model';
  content: string;
}

const ZONE_CONFIG = {
  green: { emoji: '🟢', label: 'HIJAU', bg: '#F0FFF4', border: '#C6F6D5', textColor: '#2E7D32' },
  yellow: { emoji: '🟡', label: 'KUNING', bg: '#FFF9E6', border: '#FFE082', textColor: '#B8860B' },
  red: { emoji: '🔴', label: 'MERAH', bg: '#FFF5F5', border: '#FFCDD2', textColor: '#C62828' },
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: 'model', content: 'Hal apa yang paling banyak nguras pikiranmu sekarang? Cerita aja, MinDora di sini dengerin kamu 💙' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);
  const [zone, setZone] = useState<Zone | null>(null);
  const [saveSession, setSaveSession] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, showIntensityPicker]);

  // Show intensity picker after 3 user messages
  useEffect(() => {
    if (messageCount === 3 && !showIntensityPicker && !intensity) {
      setShowIntensityPicker(true);
    }
  }, [messageCount, showIntensityPicker, intensity]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');

    const userMsg: UIMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setMessageCount(prev => prev + 1);
    setTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (data.response) {
        const botMsg: UIMessage = { role: 'model', content: data.response };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: 'Maaf, koneksi bermasalah. Coba lagi ya 🙏' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleIntensity = async (val: number) => {
    setIntensity(val);
    setShowIntensityPicker(false);

    const allText = messages.map(m => m.content).join(' ');
    const detectedZone = detectZone(val, allText);
    setZone(detectedZone);

    if (detectedZone === 'red') {
      router.push('/dashboard/red-zone');
      return;
    }

    // Continue chat
    setTyping(true);
    setTimeout(async () => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Sistem: intensitas ${val}/5]`,
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      }
      setTyping(false);
    }, 800);
  };

  const handleEndSession = async () => {
    if (saveSession) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('chat_sessions').insert({
            user_id: user.id,
            messages: messages,
            intensity_score: intensity,
            zone: zone ?? 'green',
          });

          await supabase
            .from('profiles')
            .update({ session_count: supabase.rpc as unknown })
            .eq('id', user.id);
        }
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }

    if (zone === 'yellow') {
      router.push('/dashboard/psikolog');
    } else {
      router.push('/dashboard');
    }
  };

  const zoneInfo = zone ? ZONE_CONFIG[zone] : null;
  const showResult = zone !== null && !showIntensityPicker;

  if (showResult && zone) {
    const info = ZONE_CONFIG[zone];
    return (
      <div className="mobile-shell bg-white">
        <div className="h-11" />
        <AppHeader title="Sesi Cerita" />

        <div className="flex-1 overflow-auto relative">
          {/* Blurred chat bg */}
          <div className="p-4 opacity-30 blur-sm pointer-events-none">
            {messages.slice(0, 3).map((m, i) => (
              <div key={i} className={`flex gap-2 mb-2.5 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'model' && <MinDoraAvatar size={32} />}
                <div
                  className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm"
                  style={{
                    background: m.role === 'user' ? '#1A3448' : '#EDF4F8',
                    color: m.role === 'user' ? '#fff' : '#1A3448',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] p-6 animate-slide-up">
            {/* Zone badge */}
            <div className="text-center mb-4">
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border"
                style={{ background: info.bg, borderColor: info.border }}
              >
                <span className="text-xl">{info.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: info.textColor }}>
                  ZONA {info.label}
                </span>
              </div>
            </div>

            {zone === 'yellow' ? (
              <>
                <h2 className="font-boogaloo text-[22px] text-[#1A3448] text-center mb-2">
                  Kamu lagi bawa banyak hal nih.
                </h2>
                <p className="text-sm text-[#6B7280] text-center mb-5 leading-relaxed">
                  Nggak ada yang salah minta bantuan lebih. Mau ngobrol sama psikolog mitra MinDora?
                </p>
                <Button onClick={() => router.push('/dashboard/psikolog')}>
                  Ya, hubungkan aku
                </Button>
                <Button variant="ghost" onClick={handleEndSession} className="mt-2.5">
                  Nanti aja
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-boogaloo text-[22px] text-[#1A3448] text-center mb-2">
                  Kamu udah hebat banget hari ini!
                </h2>
                <p className="text-sm text-[#6B7280] text-center mb-5 leading-relaxed">
                  Kondisimu terlihat oke. Tetap jaga diri dan check-in lagi besok ya 💙
                </p>
                <Button onClick={handleEndSession}>Selesai</Button>
              </>
            )}

            {/* Micro action */}
            <Card className="mt-4 p-3.5" style={{ background: '#F0FFF4', border: '1px solid #C6F6D5' } as React.CSSProperties}>
              <p className="m-0 mb-1.5 text-xs font-semibold text-[#2E7D32]">
                Satu hal yang bisa kamu coba hari ini:
              </p>
              <p className="m-0 text-sm leading-relaxed">
                Tulis 3 hal yang masih dalam kendalimu terkait masalah ini. ✏️
              </p>
            </Card>

            {/* Save toggle */}
            <div className="mt-3.5">
              <ToggleSwitch
                checked={saveSession}
                onChange={setSaveSession}
                label="Simpan sesi ini"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-shell bg-white flex flex-col">
      <div className="h-11" />

      {/* Chat header */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="p-1 bg-transparent border-none cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <MinDoraAvatar size={32} />
          <span className="font-boogaloo text-[17px] text-[#1A3448]">Sesi Cerita</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 flex flex-col gap-3 scrollbar-none"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 items-end animate-fade-in ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {m.role === 'model' && <MinDoraAvatar size={32} />}
            <div
              className="max-w-[78%] px-4 py-3 text-sm leading-snug"
              style={{
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? '#1A3448' : '#EDF4F8',
                color: m.role === 'user' ? '#fff' : '#1A3448',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Intensity picker */}
        {showIntensityPicker && (
          <div className="flex gap-2 items-end animate-fade-in">
            <MinDoraAvatar size={32} />
            <div className="px-4 py-3 rounded-[18px_18px_18px_4px] bg-[#EDF4F8] max-w-[78%]">
              <p className="m-0 mb-2.5 text-sm text-[#1A3448]">Dari 1–5, seberapa berat rasanya?</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => handleIntensity(v)}
                    className="w-10 h-10 rounded-xl border-[1.5px] border-[#A8C8D8] text-[15px] font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      background: intensity === v ? '#A8C8D8' : '#fff',
                      color: intensity === v ? '#fff' : '#1A3448',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-2 items-end">
            <MinDoraAvatar size={32} />
            <div className="px-5 py-3.5 rounded-[18px_18px_18px_4px] bg-[#EDF4F8] flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 dot-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-7 pt-3 border-t border-gray-100 flex gap-2.5 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ketik di sini..."
          className="flex-1 px-4 py-3 rounded-full border-[1.5px] border-[#E5E7EB] bg-[#F9FAFB] text-sm font-poppins outline-none focus:border-[#1A3448] transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          className="w-11 h-11 rounded-[14px] bg-[#1A3448] border-none cursor-pointer flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
