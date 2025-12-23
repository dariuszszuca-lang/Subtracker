import { Category, Cycle, Currency } from '../types';

export interface ServiceTemplate {
  name: string;
  logo: string; // emoji lub URL
  category: Category;
  defaultAmount: number;
  defaultCurrency: Currency;
  defaultCycle: Cycle;
  cancelUrl?: string;
  website?: string;
}

export const POPULAR_SERVICES: ServiceTemplate[] = [
  // === STREAMING VIDEO ===
  { name: 'Netflix', logo: '🎬', category: 'entertainment', defaultAmount: 43, defaultCurrency: 'PLN', defaultCycle: 'monthly', cancelUrl: 'https://www.netflix.com/cancelplan', website: 'netflix.com' },
  { name: 'HBO Max', logo: '🎭', category: 'entertainment', defaultAmount: 29.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', cancelUrl: 'https://www.hbomax.com/account', website: 'hbomax.com' },
  { name: 'Disney+', logo: '🏰', category: 'entertainment', defaultAmount: 37.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', cancelUrl: 'https://www.disneyplus.com/account', website: 'disneyplus.com' },
  { name: 'Amazon Prime Video', logo: '📦', category: 'entertainment', defaultAmount: 49, defaultCurrency: 'PLN', defaultCycle: 'yearly', cancelUrl: 'https://www.amazon.com/gp/primecentral', website: 'primevideo.com' },
  { name: 'Apple TV+', logo: '🍎', category: 'entertainment', defaultAmount: 34.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'tv.apple.com' },
  { name: 'YouTube Premium', logo: '▶️', category: 'entertainment', defaultAmount: 26.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', cancelUrl: 'https://www.youtube.com/paid_memberships', website: 'youtube.com' },
  { name: 'Twitch', logo: '💜', category: 'entertainment', defaultAmount: 4.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'twitch.tv' },
  { name: 'Crunchyroll', logo: '🍥', category: 'entertainment', defaultAmount: 7.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'crunchyroll.com' },
  { name: 'Player.pl', logo: '📺', category: 'entertainment', defaultAmount: 25, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'player.pl' },
  { name: 'Canal+', logo: '📡', category: 'entertainment', defaultAmount: 45, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'canalplus.com' },
  { name: 'Polsat Box Go', logo: '📺', category: 'entertainment', defaultAmount: 30, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'polsatboxgo.pl' },
  { name: 'SkyShowtime', logo: '🌤️', category: 'entertainment', defaultAmount: 24.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'skyshowtime.com' },

  // === MUZYKA ===
  { name: 'Spotify', logo: '🎵', category: 'entertainment', defaultAmount: 19.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', cancelUrl: 'https://www.spotify.com/account/subscription', website: 'spotify.com' },
  { name: 'Spotify Family', logo: '🎵', category: 'entertainment', defaultAmount: 29.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'spotify.com' },
  { name: 'Spotify Duo', logo: '🎵', category: 'entertainment', defaultAmount: 24.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'spotify.com' },
  { name: 'Apple Music', logo: '🎧', category: 'entertainment', defaultAmount: 21.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'music.apple.com' },
  { name: 'Tidal', logo: '🌊', category: 'entertainment', defaultAmount: 19.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'tidal.com' },
  { name: 'Deezer', logo: '🎶', category: 'entertainment', defaultAmount: 19.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'deezer.com' },
  { name: 'Amazon Music', logo: '🎵', category: 'entertainment', defaultAmount: 17.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'music.amazon.com' },
  { name: 'YouTube Music', logo: '🎵', category: 'entertainment', defaultAmount: 21.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'music.youtube.com' },
  { name: 'Audible', logo: '🎧', category: 'education', defaultAmount: 34.90, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'audible.com' },

  // === GRY ===
  { name: 'Xbox Game Pass', logo: '🎮', category: 'entertainment', defaultAmount: 54.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'xbox.com/gamepass' },
  { name: 'PlayStation Plus', logo: '🎮', category: 'entertainment', defaultAmount: 60, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'playstation.com' },
  { name: 'Nintendo Switch Online', logo: '🕹️', category: 'entertainment', defaultAmount: 80, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'nintendo.com' },
  { name: 'EA Play', logo: '⚽', category: 'entertainment', defaultAmount: 14.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'ea.com' },
  { name: 'GeForce Now', logo: '💚', category: 'entertainment', defaultAmount: 44.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'nvidia.com/geforce-now' },
  { name: 'World of Warcraft', logo: '⚔️', category: 'entertainment', defaultAmount: 12.99, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'worldofwarcraft.com' },

  // === PRACA / NARZĘDZIA ===
  { name: 'ChatGPT Plus', logo: '🤖', category: 'work', defaultAmount: 20, defaultCurrency: 'USD', defaultCycle: 'monthly', cancelUrl: 'https://chat.openai.com/settings', website: 'chat.openai.com' },
  { name: 'Claude Pro', logo: '🧠', category: 'work', defaultAmount: 20, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'claude.ai' },
  { name: 'Notion', logo: '📝', category: 'work', defaultAmount: 10, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'notion.so' },
  { name: 'Slack', logo: '💬', category: 'work', defaultAmount: 8.75, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'slack.com' },
  { name: 'Zoom', logo: '📹', category: 'work', defaultAmount: 15.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'zoom.us' },
  { name: 'Microsoft 365', logo: '📊', category: 'work', defaultAmount: 299, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'microsoft365.com' },
  { name: 'Google Workspace', logo: '📧', category: 'work', defaultAmount: 5.20, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'workspace.google.com' },
  { name: 'Dropbox', logo: '📦', category: 'cloud', defaultAmount: 11.99, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'dropbox.com' },
  { name: 'Google One', logo: '☁️', category: 'cloud', defaultAmount: 8.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'one.google.com' },
  { name: 'iCloud+', logo: '☁️', category: 'cloud', defaultAmount: 4.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'icloud.com' },
  { name: 'OneDrive', logo: '☁️', category: 'cloud', defaultAmount: 8.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'onedrive.com' },
  { name: 'Trello', logo: '📋', category: 'work', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'trello.com' },
  { name: 'Asana', logo: '📋', category: 'work', defaultAmount: 10.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'asana.com' },
  { name: 'Monday.com', logo: '📅', category: 'work', defaultAmount: 9, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'monday.com' },
  { name: 'Jira', logo: '🎯', category: 'work', defaultAmount: 7.75, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'atlassian.com/jira' },
  { name: 'Linear', logo: '📐', category: 'work', defaultAmount: 8, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'linear.app' },
  { name: 'Miro', logo: '🎨', category: 'work', defaultAmount: 8, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'miro.com' },
  { name: 'Figma', logo: '🎨', category: 'work', defaultAmount: 12, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'figma.com' },
  { name: 'Canva Pro', logo: '🖼️', category: 'work', defaultAmount: 54.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'canva.com' },
  { name: 'Adobe Creative Cloud', logo: '🎨', category: 'work', defaultAmount: 61.49, defaultCurrency: 'EUR', defaultCycle: 'monthly', cancelUrl: 'https://account.adobe.com/plans', website: 'adobe.com' },
  { name: 'Adobe Photoshop', logo: '🖌️', category: 'work', defaultAmount: 24.99, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'adobe.com/photoshop' },
  { name: 'Adobe Illustrator', logo: '✏️', category: 'work', defaultAmount: 24.99, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'adobe.com/illustrator' },
  { name: 'Midjourney', logo: '🎨', category: 'work', defaultAmount: 10, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'midjourney.com' },
  { name: 'Grammarly', logo: '✍️', category: 'work', defaultAmount: 12, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'grammarly.com' },
  { name: '1Password', logo: '🔐', category: 'work', defaultAmount: 2.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: '1password.com' },
  { name: 'LastPass', logo: '🔒', category: 'work', defaultAmount: 3, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'lastpass.com' },
  { name: 'Bitwarden', logo: '🔐', category: 'work', defaultAmount: 10, defaultCurrency: 'USD', defaultCycle: 'yearly', website: 'bitwarden.com' },
  { name: 'NordVPN', logo: '🛡️', category: 'work', defaultAmount: 12.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'nordvpn.com' },
  { name: 'ExpressVPN', logo: '🔒', category: 'work', defaultAmount: 12.95, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'expressvpn.com' },
  { name: 'Surfshark', logo: '🦈', category: 'work', defaultAmount: 12.95, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'surfshark.com' },

  // === PROGRAMOWANIE / HOSTING ===
  { name: 'GitHub Pro', logo: '🐙', category: 'work', defaultAmount: 4, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'github.com' },
  { name: 'GitHub Copilot', logo: '🤖', category: 'work', defaultAmount: 10, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'github.com/copilot' },
  { name: 'JetBrains All Products', logo: '💻', category: 'work', defaultAmount: 28.90, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'jetbrains.com' },
  { name: 'Vercel Pro', logo: '▲', category: 'cloud', defaultAmount: 20, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'vercel.com' },
  { name: 'Netlify', logo: '🌐', category: 'cloud', defaultAmount: 19, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'netlify.com' },
  { name: 'Heroku', logo: '💜', category: 'cloud', defaultAmount: 7, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'heroku.com' },
  { name: 'DigitalOcean', logo: '🌊', category: 'cloud', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'digitalocean.com' },
  { name: 'AWS', logo: '☁️', category: 'cloud', defaultAmount: 50, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'aws.amazon.com' },
  { name: 'Google Cloud', logo: '☁️', category: 'cloud', defaultAmount: 50, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'cloud.google.com' },
  { name: 'Azure', logo: '☁️', category: 'cloud', defaultAmount: 50, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'azure.microsoft.com' },
  { name: 'Cloudflare', logo: '🔶', category: 'cloud', defaultAmount: 20, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'cloudflare.com' },
  { name: 'Firebase', logo: '🔥', category: 'cloud', defaultAmount: 25, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'firebase.google.com' },
  { name: 'Supabase', logo: '⚡', category: 'cloud', defaultAmount: 25, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'supabase.com' },
  { name: 'MongoDB Atlas', logo: '🍃', category: 'cloud', defaultAmount: 57, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'mongodb.com/atlas' },
  { name: 'Railway', logo: '🚂', category: 'cloud', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'railway.app' },
  { name: 'Render', logo: '🎯', category: 'cloud', defaultAmount: 7, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'render.com' },

  // === DOMENY / HOSTING WWW ===
  { name: 'Domena .pl', logo: '🌐', category: 'domains', defaultAmount: 49, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'dns.pl' },
  { name: 'Domena .com', logo: '🌐', category: 'domains', defaultAmount: 55, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'namecheap.com' },
  { name: 'Domena .eu', logo: '🇪🇺', category: 'domains', defaultAmount: 40, defaultCurrency: 'PLN', defaultCycle: 'yearly' },
  { name: 'Domena .io', logo: '🌐', category: 'domains', defaultAmount: 200, defaultCurrency: 'PLN', defaultCycle: 'yearly' },
  { name: 'Domena .dev', logo: '💻', category: 'domains', defaultAmount: 70, defaultCurrency: 'PLN', defaultCycle: 'yearly' },
  { name: 'Domena .app', logo: '📱', category: 'domains', defaultAmount: 80, defaultCurrency: 'PLN', defaultCycle: 'yearly' },
  { name: 'OVH Hosting', logo: '🖥️', category: 'cloud', defaultAmount: 25, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'ovh.pl' },
  { name: 'home.pl Hosting', logo: '🏠', category: 'cloud', defaultAmount: 30, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'home.pl' },
  { name: 'nazwa.pl', logo: '🌐', category: 'cloud', defaultAmount: 25, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'nazwa.pl' },
  { name: 'cyber_Folks', logo: '👥', category: 'cloud', defaultAmount: 20, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'cyberfolks.pl' },
  { name: 'Namecheap', logo: '🏷️', category: 'domains', defaultAmount: 50, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'namecheap.com' },
  { name: 'GoDaddy', logo: '🌐', category: 'domains', defaultAmount: 60, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'godaddy.com' },
  { name: 'Porkbun', logo: '🐷', category: 'domains', defaultAmount: 35, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'porkbun.com' },

  // === ZDROWIE / FITNESS ===
  { name: 'Multisport', logo: '🏃', category: 'health', defaultAmount: 150, defaultCurrency: 'PLN', defaultCycle: 'monthly' },
  { name: 'FitProfit', logo: '💪', category: 'health', defaultAmount: 120, defaultCurrency: 'PLN', defaultCycle: 'monthly' },
  { name: 'Medicover Sport', logo: '🏋️', category: 'health', defaultAmount: 100, defaultCurrency: 'PLN', defaultCycle: 'monthly' },
  { name: 'Siłownia / Fitness Club', logo: '🏋️', category: 'health', defaultAmount: 120, defaultCurrency: 'PLN', defaultCycle: 'monthly' },
  { name: 'Calm', logo: '🧘', category: 'health', defaultAmount: 14.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'calm.com' },
  { name: 'Headspace', logo: '🧠', category: 'health', defaultAmount: 12.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'headspace.com' },
  { name: 'Strava', logo: '🚴', category: 'health', defaultAmount: 11.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'strava.com' },
  { name: 'Fitbit Premium', logo: '⌚', category: 'health', defaultAmount: 9.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'fitbit.com' },
  { name: 'Nike Training Club', logo: '👟', category: 'health', defaultAmount: 14.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'nike.com' },
  { name: 'MyFitnessPal', logo: '🍎', category: 'health', defaultAmount: 9.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'myfitnesspal.com' },
  { name: 'Noom', logo: '🥗', category: 'health', defaultAmount: 199, defaultCurrency: 'USD', defaultCycle: 'yearly', website: 'noom.com' },
  { name: 'Medicover', logo: '🏥', category: 'health', defaultAmount: 180, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'medicover.pl' },
  { name: 'LuxMed', logo: '🏥', category: 'health', defaultAmount: 200, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'luxmed.pl' },
  { name: 'PZU Zdrowie', logo: '🏥', category: 'health', defaultAmount: 150, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'pzu.pl' },
  { name: 'Enel-Med', logo: '🏥', category: 'health', defaultAmount: 170, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'enel.pl' },

  // === EDUKACJA ===
  { name: 'Duolingo Plus', logo: '🦉', category: 'education', defaultAmount: 49.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'duolingo.com' },
  { name: 'Babbel', logo: '🗣️', category: 'education', defaultAmount: 44.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'babbel.com' },
  { name: 'Coursera Plus', logo: '🎓', category: 'education', defaultAmount: 59, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'coursera.org' },
  { name: 'Udemy', logo: '📚', category: 'education', defaultAmount: 50, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'udemy.com' },
  { name: 'Skillshare', logo: '🎨', category: 'education', defaultAmount: 13.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'skillshare.com' },
  { name: 'MasterClass', logo: '🎬', category: 'education', defaultAmount: 15, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'masterclass.com' },
  { name: 'LinkedIn Learning', logo: '💼', category: 'education', defaultAmount: 29.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'linkedin.com/learning' },
  { name: 'Pluralsight', logo: '💻', category: 'education', defaultAmount: 29, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'pluralsight.com' },
  { name: 'Frontend Masters', logo: '👨‍💻', category: 'education', defaultAmount: 39, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'frontendmasters.com' },
  { name: 'egghead.io', logo: '🥚', category: 'education', defaultAmount: 25, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'egghead.io' },
  { name: 'Wes Bos Courses', logo: '🔥', category: 'education', defaultAmount: 50, defaultCurrency: 'USD', defaultCycle: 'yearly', website: 'wesbos.com' },
  { name: 'Legimi', logo: '📖', category: 'education', defaultAmount: 34.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'legimi.pl' },
  { name: 'Empik Go', logo: '📚', category: 'education', defaultAmount: 39.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'empik.com' },
  { name: 'Kindle Unlimited', logo: '📱', category: 'education', defaultAmount: 39.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'amazon.com/kindle-unlimited' },
  { name: 'Blinkist', logo: '📖', category: 'education', defaultAmount: 12.99, defaultCurrency: 'EUR', defaultCycle: 'monthly', website: 'blinkist.com' },

  // === INNE ===
  { name: 'Amazon Prime', logo: '📦', category: 'other', defaultAmount: 49, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'amazon.pl' },
  { name: 'Allegro Smart', logo: '🛒', category: 'other', defaultAmount: 59, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'allegro.pl' },
  { name: 'Uber One', logo: '🚗', category: 'other', defaultAmount: 24.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'uber.com' },
  { name: 'Glovo Prime', logo: '🛵', category: 'other', defaultAmount: 19.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'glovoapp.com' },
  { name: 'Wolt+', logo: '🍔', category: 'other', defaultAmount: 29.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'wolt.com' },
  { name: 'Pyszne.pl Premium', logo: '🍕', category: 'other', defaultAmount: 24.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'pyszne.pl' },
  { name: 'Empik Premium', logo: '🛍️', category: 'other', defaultAmount: 49.99, defaultCurrency: 'PLN', defaultCycle: 'yearly', website: 'empik.com' },
  { name: 'Żabka Jush', logo: '🐸', category: 'other', defaultAmount: 9.99, defaultCurrency: 'PLN', defaultCycle: 'monthly', website: 'zabka.pl' },
  { name: 'Patreon', logo: '🎨', category: 'other', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'patreon.com' },
  { name: 'Ko-fi', logo: '☕', category: 'other', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'ko-fi.com' },
  { name: 'Buy Me a Coffee', logo: '☕', category: 'other', defaultAmount: 5, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'buymeacoffee.com' },
  { name: 'Setapp', logo: '📱', category: 'work', defaultAmount: 9.99, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'setapp.com' },
  { name: 'Superhuman', logo: '✉️', category: 'work', defaultAmount: 30, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'superhuman.com' },
  { name: 'Raycast Pro', logo: '⚡', category: 'work', defaultAmount: 8, defaultCurrency: 'USD', defaultCycle: 'monthly', website: 'raycast.com' },
];

// Funkcja wyszukiwania serwisów
export const searchServices = (query: string): ServiceTemplate[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return POPULAR_SERVICES.slice(0, 10);

  return POPULAR_SERVICES.filter(service =>
    service.name.toLowerCase().includes(normalizedQuery) ||
    service.website?.toLowerCase().includes(normalizedQuery)
  ).slice(0, 10);
};

// Pobierz serwis po nazwie
export const getServiceByName = (name: string): ServiceTemplate | undefined => {
  return POPULAR_SERVICES.find(
    service => service.name.toLowerCase() === name.toLowerCase()
  );
};
