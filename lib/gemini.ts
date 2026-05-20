import { GoogleGenerativeAI } from '@google/generative-ai';
import { Zone } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = `Kamu adalah MinDora, teman curhat digital untuk anak muda Indonesia (18-30 tahun). Peranmu adalah:

- Mendengarkan tanpa menghakimi
- Menggunakan bahasa Indonesia yang hangat dan kasual ("kamu" bukan "Anda")
- Membantu pengguna mengurai pikiran dan menemukan langkah kecil yang bisa dilakukan
- Menerapkan teknik reframing secara lembut
- BUKAN terapis atau dokter — kamu teman berpikir yang mendukung
- Jika intensitas tinggi (4-5), sarankan dengan lembut untuk berkonsultasi dengan psikolog
- Jaga respons tetap ringkas (2-4 kalimat per respons)
- Selalu akhiri dengan satu pertanyaan terbuka atau ajakan bertindak kecil

Jangan pernah:
- Memberikan diagnosis
- Meresepkan obat atau saran medis
- Mengabaikan tanda-tanda krisis (kata kunci: menyakiti diri sendiri, tidak mau hidup, dll.)
- Jika ada tanda krisis, segera arahkan ke profesional atau hotline Into The Light (021-7884-5555)`;

export interface ChatHistory {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// Models to try in order — first one that responds wins.
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',       // latest & fastest free-tier (2025)
  'gemini-2.0-flash',       // fallback
  'gemini-2.0-flash-lite',  // lightest fallback
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
  // Gemini requires history to start with role 'user'.
  // The chat UI seeds an opening 'model' greeting for display purposes —
  // strip any leading model messages before passing to the API.
  const firstUserIdx = history.findIndex(m => m.role === 'user');
  const validHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const text = await tryModel(modelName, userMessage, validHistory);
      return text;
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      lastError = error;

      // Quota / rate-limit — no point trying other models
      if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
        throw new Error('MinDora lagi istirahat sebentar karena terlalu banyak permintaan. Coba lagi dalam beberapa detik ya 🙏');
      }
      // Auth / key error — no point trying other models
      if (msg.includes('API_KEY') || msg.includes('api key') || msg.includes('403')) {
        throw new Error('Konfigurasi AI belum siap. Hubungi admin ya.');
      }
      // 404 or model-not-found → try next candidate
      if (msg.includes('404') || msg.includes('not found') || msg.includes('NOT_FOUND')) {
        console.warn(`Gemini model "${modelName}" not available, trying next…`);
        continue;
      }
      // Unknown error — surface it
      console.error(`Gemini API error (${modelName}):`, msg);
      throw new Error('Gagal menghubungi MinDora. Coba lagi ya.');
    }
  }

  // All models exhausted
  console.error('All Gemini candidate models failed. Last error:', lastError?.message);
  throw new Error('Gagal menghubungi MinDora. Coba lagi ya.');
}

const CRISIS_KEYWORDS = [
  'bunuh diri', 'mau mati', 'tidak mau hidup', 'menyakiti diri',
  'nyakitin diri', 'udah capek hidup', 'nggak mau ada lagi',
  'self harm', 'suicide'
];

export function detectZone(intensityScore: number, messageText: string): Zone {
  const lower = messageText.toLowerCase();
  const hasCrisisKeyword = CRISIS_KEYWORDS.some(kw => lower.includes(kw));

  if (hasCrisisKeyword || intensityScore >= 5) return 'red';
  if (intensityScore >= 3) return 'yellow';
  return 'green';
}
