// Cookie-based session deduplication
// Prevents refresh from counting as a new view

const COOKIE_PREFIX = 'nf_viewed_';
const COOKIE_TTL_HOURS = 24;

export const hasViewedMoment = (slug: string): boolean => {
  if (typeof document === 'undefined') return false;
  const cookies = document.cookie.split(';');
  return cookies.some((c) => c.trim().startsWith(`${COOKIE_PREFIX}${slug}=`));
};

export const markMomentViewed = (slug: string): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setHours(expires.getHours() + COOKIE_TTL_HOURS);
  document.cookie = `${COOKIE_PREFIX}${slug}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};
