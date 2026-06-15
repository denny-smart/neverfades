// ─── Dynamic message emoji picker ────────────────────────────────────────────
// Scores the message against weighted keyword lists for several emotional
// categories, then returns the emoji that best matches the content.
// Falls back to ❤️ when no category clears the threshold.

type Category = {
  emoji: string;
  keywords: RegExp[];
  weight: number; // each keyword match contributes this score
};

const CATEGORIES: Category[] = [
  {
    emoji: '🌹',
    weight: 3,
    keywords: [
      /\b(rose|roses|flower|flowers|bloom|blossom|petal|petals)\b/i,
      /\b(garden|bouquet|floral)\b/i,
    ],
  },
  {
    emoji: '✨',
    weight: 3,
    keywords: [
      /\b(magic|magical|sparkle|glow|shimmer|light|shine|bright|radiant|illuminate)\b/i,
      /\b(star|stars|galaxy|universe|cosmos|celestial|heavenly)\b/i,
      /\b(dream|dreaming|fantasy|wonder|wonderful|surreal)\b/i,
    ],
  },
  {
    emoji: '🌙',
    weight: 3,
    keywords: [
      /\b(moon|moonlight|night|midnight|dusk|twilight|stars?|galaxy)\b/i,
      /\b(dark|darkness|shadow|quiet|silence|still|hush)\b/i,
      /\b(sleep|rest|dream|slumber)\b/i,
    ],
  },
  {
    emoji: '🔥',
    weight: 3,
    keywords: [
      /\b(fire|flame|burn|burning|ignite|passion|intense|desire|heat|hot)\b/i,
      /\b(wild|fierce|electric|explosive|unstoppable|powerful|fearless)\b/i,
    ],
  },
  {
    emoji: '💫',
    weight: 3,
    keywords: [
      /\b(forever|always|eternal|infinity|endless|timeless|everlasting)\b/i,
      /\b(destiny|fate|meant|soul\s*mate|soulmate|one\s*and\s*only)\b/i,
    ],
  },
  {
    emoji: '🌊',
    weight: 3,
    keywords: [
      /\b(ocean|sea|wave|waves|water|deep|depths|shore|drift|flow)\b/i,
      /\b(peaceful|peace|calm|serene|gentle|soft)\b/i,
    ],
  },
  {
    emoji: '💌',
    weight: 2,
    keywords: [
      /\b(letter|write|wrote|pen|words?|message|note|lines?)\b/i,
      /\b(read|tell|told|say|said|speak|spoken|express|express(ion|ed)?)\b/i,
    ],
  },
  {
    emoji: '🥺',
    weight: 3,
    keywords: [
      /\b(miss|missing|apart|away|distance|far|longing|yearn|ache|lonely)\b/i,
      /\b(cry|crying|tear|tears|sob|heart\s*break|heartbreak|broken)\b/i,
    ],
  },
  {
    emoji: '🫂',
    weight: 3,
    keywords: [
      /\b(hug|hold|held|embrace|arms|close|near|together|beside|next\s*to)\b/i,
      /\b(safe|safety|comfort|home|belong|warmth|warm)\b/i,
    ],
  },
  {
    emoji: '😊',
    weight: 2,
    keywords: [
      /\b(smile|laugh|happy|happiness|joy|joyful|fun|silly|cute|sweet)\b/i,
      /\b(bright|sunshine|cheerful|light\s*up|giddy|delight)\b/i,
    ],
  },
  {
    emoji: '💖',
    weight: 2,
    keywords: [
      /\b(love|loving|loved|heart|adore|adoring|care|caring|cherish|treasure)\b/i,
      /\b(beautiful|beauty|pretty|gorgeous|stunning|perfect)\b/i,
      /\b(my\s*everything|my\s*world|my\s*life|made\s*for|meant\s*for)\b/i,
    ],
  },
  {
    emoji: '🌸',
    weight: 3,
    keywords: [
      /\b(spring|sakura|cherry|pink|gentle|delicate|soft|tender|grace|graceful)\b/i,
    ],
  },
  {
    emoji: '⚡',
    weight: 3,
    keywords: [
      /\b(electric|lightning|charge|rush|thrill|alive|energy|power|force)\b/i,
    ],
  },
];

const FALLBACK_EMOJI = '❤️';
const SCORE_THRESHOLD = 2; // minimum score to use a category emoji

/**
 * Analyses `message` (and optionally `senderName`) and returns the most
 * contextually appropriate emoji for the sender signature.
 */
export function getMessageEmoji(message: string, senderName?: string): string {
  const text = [message, senderName ?? ''].join(' ');

  let bestEmoji = FALLBACK_EMOJI;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    let score = 0;
    for (const pattern of category.keywords) {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) score += matches.length * category.weight;
    }
    if (score > bestScore) {
      bestScore = score;
      bestEmoji = category.emoji;
    }
  }

  return bestScore >= SCORE_THRESHOLD ? bestEmoji : FALLBACK_EMOJI;
}
