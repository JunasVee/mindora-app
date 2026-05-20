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

export async function chatWithMinDora(
  userMessage: string,
  history: ChatHistory[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history });

  try {
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Gagal menghubungi MinDora. Coba lagi ya.');
  }
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
