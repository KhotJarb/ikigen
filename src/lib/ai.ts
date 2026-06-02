/**
 * AI Service — Gemini Integration for IkiGen
 *
 * Server-side only. Handles:
 * - Gemini API calls with structured JSON output
 * - Robust JSON extraction from LLM responses
 * - Quiz generation & Ikigai analysis prompts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  pillar: 'love' | 'good' | 'need' | 'paid';
  question: string;
  options: string[];
  allow_other: boolean;
}

export interface GeneratedQuizData {
  questions: QuizQuestion[];
}

export interface PillarScore {
  pillar: 'love' | 'good' | 'need' | 'paid';
  label: string;
  score: number;
  max_score: number;
  description: string;
}

export interface SummaryCard {
  title: string;
  content: string;
  emoji: string;
  gradient: string;
}

export interface IkigaiResultData {
  archetype: string;
  archetype_description: string;
  pillar_scores: PillarScore[];
  strengths: string[];
  growth_areas: string[];
  guidance: string;
  action_steps: string[];
  summary_cards: SummaryCard[];
}

// ---------------------------------------------------------------------------
// JSON Extraction (handles LLM quirks)
// ---------------------------------------------------------------------------

function extractJSON(text: string): Record<string, unknown> {
  if (!text?.trim()) {
    throw new Error('Empty response from AI provider.');
  }

  const cleaned = text.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Remove markdown code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Find the first balanced { ... } block
  const braceStart = cleaned.indexOf('{');
  if (braceStart !== -1) {
    let depth = 0;
    for (let i = braceStart; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(braceStart, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }

  throw new Error(
    `Could not extract valid JSON from AI response. Preview: ${cleaned.slice(0, 200)}...`
  );
}

// ---------------------------------------------------------------------------
// Gemini Client
// ---------------------------------------------------------------------------

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(apiKey);
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  // Retry up to 3 times with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();

      if (!text) {
        throw new Error('Empty response from Gemini.');
      }

      return extractJSON(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) {
        // Exponential backoff: 2s, 4s
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Gemini API call failed after 3 attempts.');
}

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

function getQuizGenerationPrompt(locale: string): string {
  const localeInstruction: Record<string, string> = {
    en: 'Generate all questions and options in English.',
    ja: 'Generate all questions and options in Japanese (日本語).',
    th: 'Generate all questions and options in Thai (ภาษาไทย).',
  };

  const instruction = localeInstruction[locale] || localeInstruction.en;

  return `You are IkiGen, an expert life coach and psychologist specializing in the Japanese philosophy of Ikigai (生き甲斐) — "a reason for being."

## YOUR TASK
Analyze the user's input about their life, interests, and dreams. Then generate a deeply personalized questionnaire that evaluates their alignment across the **4 pillars of Ikigai**:

1. **love** — What You Love (Passion): Activities, topics, and experiences that bring joy and fulfillment.
2. **good** — What You're Good At (Vocation): Skills, talents, and competencies they possess or can develop.
3. **need** — What the World Needs (Mission): Ways they can contribute to society, solve problems, or help others.
4. **paid** — What You Can Be Paid For (Profession): Marketable skills, career paths, and income-generating activities.

## RULES
- Generate between **10 to 15 questions** for deep profiling. Bias towards MORE questions.
- Distribute questions across all 4 pillars. Each pillar must have **at least 2 questions**.
- Each question must have **3 to 4 specific, context-aware answer options** tailored to the user's input.
- Options should NOT be generic. They must reflect the user's stated interests, profession, or dreams.
- Questions should progress from exploratory (surface-level) to introspective (deep psychological).
- Set \`allow_other\` to \`true\` for every question so users can type custom answers.
- ${instruction}

## OUTPUT FORMAT
You MUST respond with ONLY valid JSON. No markdown, no code fences, no explanation text.
The JSON must match this exact schema:

{
  "questions": [
    {
      "id": "q1",
      "pillar": "love",
      "question": "Your personalized question here?",
      "options": [
        "Specific option A based on user input",
        "Specific option B based on user input",
        "Specific option C based on user input"
      ],
      "allow_other": true
    }
  ]
}

## FIELD RULES
- \`id\`: Sequential string "q1", "q2", "q3", etc.
- \`pillar\`: Must be exactly one of: "love", "good", "need", "paid"
- \`question\`: 10-500 characters, thoughtful and specific
- \`options\`: Array of 3-4 strings, each contextually relevant to the user
- \`allow_other\`: Always \`true\`

## EXAMPLE
If the user says "I'm a software engineer who loves painting", a good question would be:
{
  "id": "q3",
  "pillar": "love",
  "question": "When you paint, what aspect brings you the most satisfaction?",
  "options": [
    "The meditative process of mixing colors and applying brushstrokes",
    "Expressing emotions or stories that I can't put into words",
    "The challenge of mastering new techniques and styles",
    "Sharing my art with others and seeing their reactions"
  ],
  "allow_other": true
}

Remember: Output ONLY the JSON object. Nothing else.`;
}

function getAnalysisPrompt(locale: string): string {
  const localeInstruction: Record<string, string> = {
    en: 'Write all analysis text, guidance, and card content in English.',
    ja: 'Write all analysis text, guidance, and card content in Japanese (日本語).',
    th: 'Write all analysis text, guidance, and card content in Thai (ภาษาไทย).',
  };

  const instruction = localeInstruction[locale] || localeInstruction.en;

  return `You are IkiGen, a world-class life coach, psychologist, and Ikigai specialist. You have deep expertise in career counseling, positive psychology, and Japanese philosophy.

## YOUR TASK
Analyze the user's quiz answers to produce a comprehensive, empathetic, and actionable Ikigai profile. Your analysis must be:
- **Deeply personal** — Reference their specific answers, not generic advice
- **Psychologically grounded** — Draw on established frameworks (Maslow, flow state, self-determination theory)
- **Actionable** — Provide concrete next steps they can take this week
- **Encouraging** — Be warm, supportive, and validating while being honest about growth areas

## THE 4 PILLARS
Score each pillar from 0-100 based on the user's answers:
1. **love** (What You Love): Passion alignment — how connected they are to activities that bring joy
2. **good** (What You're Good At): Skill awareness — how well they recognize and leverage their strengths
3. **need** (What the World Needs): Purpose clarity — how clearly they see their contribution to the world
4. **paid** (What You Can Be Paid For): Practical alignment — how viable their passions are as income sources

## ${instruction}

## OUTPUT FORMAT
You MUST respond with ONLY valid JSON. No markdown, no code fences, no explanation text.

{
  "archetype": "The [Adjective] [Noun]",
  "archetype_description": "A 2-3 sentence vivid description of this Ikigai archetype and what makes it special.",
  "pillar_scores": [
    {
      "pillar": "love",
      "label": "What You Love",
      "score": 85,
      "max_score": 100,
      "description": "2-3 sentence analysis of their passion alignment based on their specific answers."
    },
    {
      "pillar": "good",
      "label": "What You're Good At",
      "score": 72,
      "max_score": 100,
      "description": "2-3 sentence analysis of their skill awareness."
    },
    {
      "pillar": "need",
      "label": "What the World Needs",
      "score": 68,
      "max_score": 100,
      "description": "2-3 sentence analysis of their purpose clarity."
    },
    {
      "pillar": "paid",
      "label": "What You Can Be Paid For",
      "score": 55,
      "max_score": 100,
      "description": "2-3 sentence analysis of their practical alignment."
    }
  ],
  "strengths": [
    "Specific strength 1 based on their answers",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "growth_areas": [
    "Specific area for growth 1",
    "Specific area for growth 2"
  ],
  "guidance": "A thoughtful, empathetic paragraph (minimum 50 characters) providing deep life guidance based on their unique Ikigai profile. Reference their specific answers and archetype. Be warm but honest.",
  "action_steps": [
    "Concrete action step 1 they can take this week",
    "Concrete action step 2",
    "Concrete action step 3",
    "Concrete action step 4",
    "Concrete action step 5"
  ],
  "summary_cards": [
    {
      "title": "Your Core Drive",
      "content": "A compelling 1-2 sentence insight about what fundamentally drives them.",
      "emoji": "🔥",
      "gradient": "linear-gradient(135deg, #f472b6, #818cf8)"
    },
    {
      "title": "Your Hidden Talent",
      "content": "An insight about a strength they may not fully recognize.",
      "emoji": "💎",
      "gradient": "linear-gradient(135deg, #818cf8, #34d399)"
    },
    {
      "title": "Your Impact Zone",
      "content": "How they can make their biggest contribution to the world.",
      "emoji": "🌍",
      "gradient": "linear-gradient(135deg, #34d399, #fbbf24)"
    },
    {
      "title": "Your Next Chapter",
      "content": "A forward-looking vision of their Ikigai journey.",
      "emoji": "✨",
      "gradient": "linear-gradient(135deg, #fbbf24, #f472b6)"
    }
  ]
}

## FIELD RULES
- \`archetype\`: Creative, memorable name (e.g., "The Visionary Craftsman", "The Empathetic Innovator")
- \`pillar_scores\`: Exactly 4 entries, one per pillar. Scores 0-100. Be honest, not inflated.
- \`strengths\`: 3-5 specific strengths derived from their answers
- \`growth_areas\`: 2-4 honest but encouraging growth areas
- \`guidance\`: Minimum 50 characters, deeply personal paragraph
- \`action_steps\`: 3-7 concrete, specific steps (not vague platitudes)
- \`summary_cards\`: 3-6 insight cards with emoji and CSS gradients

Remember: Output ONLY the JSON object. Nothing else.`;
}

function buildAnalysisUserPrompt(
  quizData: GeneratedQuizData,
  answers: Record<string, string>
): string {
  const qaPairs = quizData.questions.map((q) => {
    const answer = answers[q.id] || 'No answer provided';
    return `[${q.pillar.toUpperCase()}] Q: ${q.question}\n   A: ${answer}`;
  });

  return `Here are the user's quiz questions and their answers:

${qaPairs.join('\n\n')}

Based on these answers, provide a comprehensive Ikigai analysis. Remember to:
1. Score each of the 4 pillars (love, good, need, paid) from 0-100
2. Identify their Ikigai archetype based on the score pattern
3. Provide deeply personal, actionable guidance referencing their specific answers
4. Create compelling insight summary cards
5. Output ONLY valid JSON matching the specified schema`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateQuiz(
  prompt: string,
  locale: string = 'en'
): Promise<GeneratedQuizData> {
  const systemPrompt = getQuizGenerationPrompt(locale);
  const userPrompt = `Here is what the user shared about their life, interests, and dreams:

"${prompt}"

Based on this input, generate a personalized Ikigai assessment questionnaire. Remember to:
1. Create 10-15 questions distributed across all 4 Ikigai pillars
2. Make each question's options specific to their stated interests
3. Progress from exploratory to deeply introspective questions
4. Output ONLY valid JSON matching the specified schema`;

  const data = await callGemini(systemPrompt, userPrompt);

  // Validate basic structure
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid quiz data: missing questions array.');
  }

  return data as unknown as GeneratedQuizData;
}

export async function analyzeIkigai(
  quizData: GeneratedQuizData,
  answers: Record<string, string>,
  locale: string = 'en'
): Promise<IkigaiResultData> {
  const systemPrompt = getAnalysisPrompt(locale);
  const userPrompt = buildAnalysisUserPrompt(quizData, answers);

  const data = await callGemini(systemPrompt, userPrompt);

  // Validate basic structure
  if (!data.archetype || !data.pillar_scores) {
    throw new Error('Invalid analysis data: missing required fields.');
  }

  return data as unknown as IkigaiResultData;
}
