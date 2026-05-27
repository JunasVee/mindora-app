import { GoogleGenerativeAI } from '@google/generative-ai';
import { Zone } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = `Kamu adalah MinDora. Bukan AI yang kaku — kamu teman curhat yang asli, yang ada buat dengerin tanpa nge-judge. Bayangkan kamu kayak sahabat karib yang kebetulan juga ngerti psikologi.

CARA NGOMONG:
- Pakai bahasa Indonesia sehari-hari yang santai: "kamu", "aku", "sih", "dong", "nih", "banget", "kayak gitu", "tuh", "deh"
- DILARANG keras bunyi AI: jangan mulai dengan "Tentu!", "Sebagai AI...", "Sangat wajar...", "Aku memahami perasaanmu", "Terima kasih sudah berbagi"
- Kalau user pakai campur Indo-Inggris atau full Inggris, ikutin gayanya secara natural
- Respons singkat dan real (2-4 kalimat) — teman beneran nggak ceramah panjang-panjang
- Boleh pakai emoji sesekali tapi jangan lebay
- Jangan terlalu banyak tanda seru
- Hindari bahasa buku atau terlalu puitis

JADI PENDENGAR YANG BAIK (ini yang paling penting):
- Dengerin dulu, solusi belakangan — jangan buru-buru kasih advice
- Reflect balik apa yang user rasain sebelum tanya atau kasih pendapat
- SATU pertanyaan per pesan, nggak perlu dibombardir
- Kalau ada momen natural dalam obrolan, boleh tanya soal keseharian mereka (hobi, rutinitas, situasi kerja/kuliah, apa yang bikin semangat atau drain) — tapi HANYA kalau mengalir natural dari konteks, bukan kayak ngisi form
- Prioritas selalu: bantu user ngeluarin apa yang ada di pikiran dan perasaan mereka

INGATAN ANTAR SESI:
- Kamu mungkin dapat catatan tentang user dari sesi-sesi sebelumnya (dalam format [Catatan tentang user:...])
- Pakai info itu buat respons yang lebih personal — tapi jangan sebut secara eksplisit "aku ingat dari sesi lalu..."
- Kalau ada tema yang berulang, acknowledge dengan empati tanpa keliatan kayak kamu lagi baca file

BATAS YANG NGGAK BOLEH DILANGGAR:
- Kamu bukan terapis atau dokter, jangan pura-pura bisa gantiin mereka
- Intensitas tinggi (4-5): sarankan psikolog dengan cara yang supportif dan nggak nakutin
- Kata-kata krisis (ingin menyakiti diri, nggak mau hidup, dll) → langsung arahkan ke Into The Light: 119 ext 8
- Jangan pernah kasih diagnosis atau saran obat`;

export interface ChatHistory {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// ── Model candidates (tried in order) ──────────────────────────────────
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

async function tryModel(
  modelName: string,
  userMessage: string,
  validHistory: ChatHistory[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  const chat = model.startChat({ history: validHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function chatWithMinDora(
  userMessage: string,
  history: ChatHistory[]
): Promise<string> {
  // Strip leading model messages — Gemini requires history to start with 'user'
  const firstUserIdx = history.findIndex(m => m.role === 'user');
  const validHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      return await tryModel(modelName, userMessage, validHistory);
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      lastError = error;

      if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
        throw new Error('MinDora lagi istirahat sebentar karena terlalu banyak permintaan. Coba lagi dalam beberapa detik ya 🙏');
      }
      if (msg.includes('API_KEY') || msg.includes('api key') || msg.includes('403')) {
        throw new Error('Konfigurasi AI belum siap. Hubungi admin ya.');
      }
      if (msg.includes('404') || msg.includes('not found') || msg.includes('NOT_FOUND')) {
        console.warn(`Gemini model "${modelName}" not available, trying next…`);
        continue;
      }
      console.error(`Gemini API error (${modelName}):`, msg);
      throw new Error('Gagal menghubungi MinDora. Coba lagi ya.');
    }
  }

  console.error('All Gemini candidate models failed. Last error:', lastError?.message);
  throw new Error('Gagal menghubungi MinDora. Coba lagi ya.');
}

// ── Extract user insights from a completed session ─────────────────────
export async function extractUserInsights(
  messages: { role: string; content: string }[],
  existingNotes: Record<string, any>
): Promise<Record<string, any>> {
  const transcript = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n---\n');

  if (!transcript.trim()) return existingNotes;

  const prompt = `Dari percakapan user ini, ekstrak fakta-fakta penting tentang user yang berguna untuk sesi mendatang. Fokus pada:
- Hobi atau aktivitas yang mereka suka/tidak suka
- Situasi hidup (kuliah/kerja/dll)
- Stressor utama yang berulang
- Cara mereka cope dengan masalah
- Karakter kepribadian yang terlihat
- Hal-hal personal yang mereka sebut (nama orang penting, tempat, dll)

Format output: JSON dengan keys: interests, stressors, situation, coping_strategies, personality_notes, personal_context
Hanya isi key yang ada informasinya. Gabungkan dengan existing notes berikut jika ada, jangan duplikat.

Existing notes: ${JSON.stringify(existingNotes)}

Percakapan user:
${transcript}

Output JSON saja, tidak ada teks lain:`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...existingNotes, ...parsed, last_updated: new Date().toISOString().split('T')[0] };
      }
      return existingNotes;
    } catch {
      continue;
    }
  }
  return existingNotes;
}

// ── Zone detection ─────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  'bunuh diri', 'mau mati', 'tidak mau hidup', 'menyakiti diri',
  'nyakitin diri', 'udah capek hidup', 'nggak mau ada lagi',
  'self harm', 'suicide',
];

export function detectZone(intensityScore: number, messageText: string): Zone {
  const lower = messageText.toLowerCase();
  const hasCrisisKeyword = CRISIS_KEYWORDS.some(kw => lower.includes(kw));
  if (hasCrisisKeyword || intensityScore >= 5) return 'red';
  if (intensityScore >= 3) return 'yellow';
  return 'green';
}
