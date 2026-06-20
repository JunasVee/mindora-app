'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';

interface Post {
  id: string;
  content: string;
  emotion: string | null;
  created_at: string;
}

interface ReactionState {
  counts: Record<string, number>;
  mine: Set<string>;
}

const EMOTIONS = ['Senang', 'Biasa aja', 'Cemas', 'Sedih', 'Frustrasi', 'Overwhelmed'];

const EMOTION_EMOJI: Record<string, string> = {
  Senang: '😊', 'Biasa aja': '😐', Cemas: '😟',
  Sedih: '😔', Frustrasi: '😤', Overwhelmed: '😵',
};

const EMOTION_COLOR: Record<string, { bg: string; text: string }> = {
  Senang:      { bg: '#F0FFF4', text: '#2E7D32' },
  'Biasa aja': { bg: '#F3F4F6', text: '#6B7280' },
  Cemas:       { bg: '#FFF9E6', text: '#B8860B' },
  Sedih:       { bg: '#FFF3E0', text: '#E65100' },
  Frustrasi:   { bg: '#FFF5F5', text: '#C62828' },
  Overwhelmed: { bg: '#FFEBEE', text: '#B71C1C' },
};

const REACTIONS = ['💙', '🤗', '👏'];
const MAX_LEN = 500;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function CommunityPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, ReactionState>>({});
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    const { data: postRows } = await supabase
      .from('community_posts')
      .select('id, content, emotion, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    setPosts(postRows ?? []);

    if (postRows && postRows.length > 0) {
      const ids = postRows.map(p => p.id);
      const { data: reactionRows } = await supabase
        .from('community_reactions')
        .select('post_id, emoji, user_id')
        .in('post_id', ids);

      const next: Record<string, ReactionState> = {};
      for (const id of ids) next[id] = { counts: {}, mine: new Set() };
      (reactionRows ?? []).forEach(r => {
        const state = next[r.post_id];
        state.counts[r.emoji] = (state.counts[r.emoji] ?? 0) + 1;
        if (r.user_id === user?.id) state.mine.add(r.emoji);
      });
      setReactions(next);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePost = async () => {
    if (!content.trim() || !userId) return;
    setPosting(true);
    const supabase = createClient();
    const { error } = await supabase.from('community_posts').insert({
      user_id: userId,
      content: content.trim(),
      emotion: selectedEmotion,
    });
    setPosting(false);
    if (!error) {
      setContent('');
      setSelectedEmotion(null);
      load();
    }
  };

  const toggleReaction = async (postId: string, emoji: string) => {
    if (!userId) return;
    const supabase = createClient();
    const already = reactions[postId]?.mine.has(emoji);

    // Optimistic update
    setReactions(prev => {
      const cur = prev[postId] ?? { counts: {}, mine: new Set<string>() };
      const counts = { ...cur.counts };
      const mine = new Set(cur.mine);
      if (already) {
        counts[emoji] = Math.max(0, (counts[emoji] ?? 1) - 1);
        mine.delete(emoji);
      } else {
        counts[emoji] = (counts[emoji] ?? 0) + 1;
        mine.add(emoji);
      }
      return { ...prev, [postId]: { counts, mine } };
    });

    if (already) {
      await supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emoji', emoji);
    } else {
      await supabase
        .from('community_reactions')
        .insert({ post_id: postId, user_id: userId, emoji });
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="h-11" />
      <AppHeader title="Komunitas" showBack={false} />

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-24">
        {/* Intro */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: 'linear-gradient(135deg, #EDF4F8, #F5EDE4)' }}
        >
          <p className="m-0 text-sm text-[#1A3448] leading-relaxed">
            🌿 Papan cerita anonim. Tulis apa yang kamu rasain — nggak ada nama, nggak ada yang nge-judge. Yang lain cuma bisa kasih dukungan lewat reaksi, nggak ada komentar.
          </p>
        </div>

        {/* Compose box */}
        <Card className="p-4 mb-5">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_LEN))}
            placeholder="Lagi mikirin apa hari ini? Cerita aja, anonim..."
            className="w-full min-h-[80px] p-0 border-none bg-transparent outline-none text-sm font-poppins text-[#1A3448] placeholder:text-gray-400 resize-none"
          />

          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
            {EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setSelectedEmotion(selectedEmotion === e ? null : e)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border-[1.5px] transition-all"
                style={{
                  background: selectedEmotion === e ? EMOTION_COLOR[e].bg : 'transparent',
                  borderColor: selectedEmotion === e ? EMOTION_COLOR[e].text : '#E5E7EB',
                  color: selectedEmotion === e ? EMOTION_COLOR[e].text : '#6B7280',
                }}
              >
                {EMOTION_EMOJI[e]} {e}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{content.length}/{MAX_LEN}</span>
            <button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className="px-5 py-2 bg-[#1A3448] text-white border-none rounded-xl text-xs font-semibold cursor-pointer font-poppins disabled:opacity-40"
            >
              {posting ? 'Mengirim...' : 'Posting Anonim'}
            </button>
          </div>
        </Card>

        {/* Feed */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <span className="text-5xl">🌿</span>
            <p className="text-sm text-[#6B7280]">Belum ada cerita. Jadi yang pertama berbagi?</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {posts.map(post => {
            const r = reactions[post.id] ?? { counts: {}, mine: new Set<string>() };
            const tag = post.emotion ? EMOTION_COLOR[post.emotion] : null;
            return (
              <Card key={post.id} className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EDF4F8] flex items-center justify-center text-sm">
                      🌱
                    </div>
                    <span className="text-xs font-medium text-[#6B7280]">Seseorang</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{timeAgo(post.created_at)}</span>
                </div>

                {post.emotion && tag && (
                  <span
                    className="inline-block mb-2 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ background: tag.bg, color: tag.text }}
                  >
                    {EMOTION_EMOJI[post.emotion]} {post.emotion}
                  </span>
                )}

                <p className="m-0 mb-3 text-sm text-[#1A3448] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex gap-2">
                  {REACTIONS.map(emoji => {
                    const active = r.mine.has(emoji);
                    const count = r.counts[emoji] ?? 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(post.id, emoji)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs cursor-pointer border-[1.5px] transition-all"
                        style={{
                          background: active ? '#EDF4F8' : 'transparent',
                          borderColor: active ? '#A8C8D8' : '#E5E7EB',
                        }}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-[11px] text-[#6B7280]">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
