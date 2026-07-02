import {
  SiInstagram, SiFacebook, SiTiktok, SiLinkedin, SiX,
  SiSnapchat, SiYoutube, SiPinterest, SiGoogle,
} from "react-icons/si";
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
  instagram: { icon: SiInstagram, color: "#E4405F" },
  facebook:  { icon: SiFacebook,  color: "#1877F2" },
  tiktok:    { icon: SiTiktok,    color: "#000000" },
  linkedin:  { icon: SiLinkedin,  color: "#0A66C2" },
  x:         { icon: SiX,         color: "#000000" },
  twitter:   { icon: SiX,         color: "#000000" },
  snapchat:  { icon: SiSnapchat,  color: "#FFFC00" },
  snap:      { icon: SiSnapchat,  color: "#FFFC00" },
  youtube:   { icon: SiYoutube,   color: "#FF0000" },
  pinterest: { icon: SiPinterest, color: "#BD081C" },
  google:    { icon: SiGoogle,    color: "#4285F4" },
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
  // Snapchat yellow needs a dark outline; keep it on a chip elsewhere.
  return (
    <Icon
      className={className}
      style={brandColor ? { color: def.color === "#FFFC00" ? "#E4B000" : def.color } : undefined}
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
