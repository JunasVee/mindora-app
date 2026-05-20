import { Emotion, ForecastDay, WeekForecast, PreventionPlan } from '@/types';

const EMOTION_SEVERITY: Record<Emotion, number> = {
  'Senang': 1,
  'Biasa aja': 2,
  'Cemas': 3,
  'Sedih': 3,
  'Frustrasi': 4,
  'Overwhelmed': 5,
};

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface MoodData {
  date: string;
  emotion: Emotion;
  sleep_quality: number;
}

export function generateForecast(
  moods: MoodData[],
  weekOffset: number
): WeekForecast {
  const weekdayPatterns = analyzeWeekdayPatterns(moods);
  const emotionFreq = analyzeEmotionFrequency(moods);
  const dataBonus = Math.min(10, moods.length / 3);

  const days: ForecastDay[] = [];
  const startOfWeek = getWeekStart(weekOffset);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayOfWeek = date.getDay();

    const emotion = weekOffset < 0
      ? (moods.find(m => isSameDay(new Date(m.date), date))?.emotion ?? predictEmotion(dayOfWeek, weekdayPatterns, emotionFreq))
      : predictEmotion(dayOfWeek, weekdayPatterns, emotionFreq);

    const probability = weekOffset < 0
      ? 98
      : calculateProbability(weekOffset, i, moods.length, dataBonus);

    days.push({
      day: DAY_LABELS[dayOfWeek],
      date: date.toISOString().split('T')[0],
      emotion,
      probability,
      severity: EMOTION_SEVERITY[emotion],
    });
  }

  const avgSeverity = days.reduce((s, d) => s + d.severity, 0) / 7;

  return {
    week_offset: weekOffset,
    days,
    avg_severity: avgSeverity,
    prevention_plan: buildPreventionPlan(avgSeverity),
  };
}

function getWeekStart(offset: number): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function analyzeWeekdayPatterns(moods: MoodData[]): Record<number, Emotion[]> {
  const patterns: Record<number, Emotion[]> = {};
  for (let d = 0; d < 7; d++) patterns[d] = [];

  moods.forEach(m => {
    const day = new Date(m.date).getDay();
    patterns[day].push(m.emotion);
  });

  return patterns;
}

function analyzeEmotionFrequency(moods: MoodData[]): Record<Emotion, number> {
  const freq: Partial<Record<Emotion, number>> = {};
  moods.forEach(m => {
    freq[m.emotion] = (freq[m.emotion] ?? 0) + 1;
  });
  return freq as Record<Emotion, number>;
}

function predictEmotion(
  dayOfWeek: number,
  weekdayPatterns: Record<number, Emotion[]>,
  emotionFreq: Record<Emotion, number>
): Emotion {
  const dayEmotions = weekdayPatterns[dayOfWeek];

  if (dayEmotions && dayEmotions.length > 0) {
    const freq: Partial<Record<Emotion, number>> = {};
    dayEmotions.forEach(e => { freq[e] = (freq[e] ?? 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as Emotion;
  }

  if (Object.keys(emotionFreq).length > 0) {
    return Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0][0] as Emotion;
  }

  // Default if no data
  const defaults: Emotion[] = ['Biasa aja', 'Senang', 'Cemas', 'Biasa aja', 'Cemas', 'Senang', 'Senang'];
  return defaults[dayOfWeek];
}

function calculateProbability(
  weekOffset: number,
  dayIdx: number,
  dataPoints: number,
  dataBonus: number
): number {
  const bases = [88, 74, 58];
  const base = bases[Math.min(weekOffset, 2)] ?? 50;
  const dayPenalty = dayIdx * 0.8;
  return Math.max(40, Math.round(base - dayPenalty + dataBonus));
}

function buildPreventionPlan(avgSeverity: number): PreventionPlan {
  if (avgSeverity >= 3.5) {
    return {
      title: 'Minggu Butuh Perhatian Ekstra',
      description: 'Pola mood kamu minggu ini menunjukkan beban yang lebih berat. Prioritaskan istirahat.',
      actions: [
        'Tidur minimal 7 jam per malam',
        'Kurangi kafein setelah jam 3 sore',
        'Jadwalkan 1 aktivitas yang kamu suka setiap hari',
        'Pertimbangkan sesi dengan psikolog minggu ini',
      ],
    };
  }

  if (avgSeverity >= 2.5) {
    return {
      title: 'Minggu Cukup Stabil',
      description: 'Mood kamu cukup stabil, tapi tetap jaga rutinitas perawatan diri.',
      actions: [
        'Pertahankan rutinitas harian kamu',
        'Coba journaling 5 menit sebelum tidur',
        'Olahraga ringan 20 menit, 3x seminggu',
        'Check-in dengan MinDora kalau mulai kewalahan',
      ],
    };
  }

  return {
    title: 'Minggu yang Positif!',
    description: 'Data menunjukkan kondisi yang lebih ringan minggu ini. Manfaatkan energimu!',
    actions: [
      'Gunakan energi positif untuk mengejar target',
      'Bantu teman atau orang sekitarmu',
      'Coba aktivitas baru yang selama ini ditunda',
      'Tetap check-in untuk jaga konsistensi',
    ],
  };
}
