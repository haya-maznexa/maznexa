import {
  FaInstagram, FaFacebook, FaTiktok, FaLinkedin, FaXTwitter,
  FaSnapchat, FaYoutube, FaPinterest, FaGoogle,
} from "react-icons/fa6";
import {
  Globe, Building2, Share2, Palette, Video, Search,
  Users, Megaphone, Wrench, type LucideIcon,
} from "lucide-react";

// ─── Platform brand marks ─────────────────────────────────────────────────────
// Official brand colours for each platform's logo.

interface PlatformDef {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const PLATFORMS: Record<string, PlatformDef> = {
  instagram: { icon: FaInstagram, color: "#E4405F" },
  facebook:  { icon: FaFacebook,  color: "#1877F2" },
  tiktok:    { icon: FaTiktok,    color: "#000000" },
  linkedin:  { icon: FaLinkedin,  color: "#0A66C2" },
  x:         { icon: FaXTwitter,  color: "#000000" },
  twitter:   { icon: FaXTwitter,  color: "#000000" },
  snapchat:  { icon: FaSnapchat,  color: "#FFFC00" },
  snap:      { icon: FaSnapchat,  color: "#FFFC00" },
  youtube:   { icon: FaYoutube,   color: "#FF0000" },
  pinterest: { icon: FaPinterest, color: "#BD081C" },
  google:    { icon: FaGoogle,    color: "#4285F4" },
  offline:   { icon: Building2,   color: "#64748B" },
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim();
}

export function PlatformIcon({
  platform,
  className = "w-4 h-4",
  brandColor = true,
}: {
  platform: string;
  className?: string;
  brandColor?: boolean;
}) {
  const key = normalize(platform);
  const def = PLATFORMS[key];
  if (!def) {
    return <Globe className={className} style={{ color: "#5053C8" }} />;
  }
  const Icon = def.icon;
  // Black brand marks (X, TikTok) and bright yellow (Snapchat) need theme-safe colours.
  let color = def.color;
  if (color === "#000000") color = "hsl(var(--foreground))";
  else if (color === "#FFFC00") color = "#E4B000";
  return (
    <Icon
      className={className}
      style={brandColor ? { color } : undefined}
    />
  );
}

export function hasPlatformIcon(platform: string): boolean {
  return normalize(platform) in PLATFORMS;
}

// ─── Service icons ────────────────────────────────────────────────────────────

const SERVICES: Record<string, { icon: LucideIcon; color: string }> = {
  "social media managment": { icon: Share2, color: "#5053C8" },
  "social media management": { icon: Share2, color: "#5053C8" },
  "design": { icon: Palette, color: "#BE98FF" },
  "video\\photo session": { icon: Video, color: "#7B6FE0" },
  "video/photo session": { icon: Video, color: "#7B6FE0" },
  "seo": { icon: Search, color: "#6366F1" },
  "crm": { icon: Users, color: "#8B5CF6" },
  "campigns": { icon: Megaphone, color: "#4F46E5" },
  "campaigns": { icon: Megaphone, color: "#4F46E5" },
  "campaign post design": { icon: Palette, color: "#818CF8" },
};

export function ServiceIcon({
  service,
  className = "w-4 h-4",
}: {
  service: string;
  className?: string;
}) {
  const def = SERVICES[service.toLowerCase().trim()];
  const Icon = def?.icon ?? Wrench;
  return <Icon className={className} style={{ color: def?.color ?? "#5053C8" }} />;
}
