import {

  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Battery,
  BookOpen,
  Box,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  CreditCard,
  Droplet,
  Flame,
  Gift,
  Headphones,
  Heart,
  HelpCircle,
  Layers,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Tag,
  ThumbsUp,
  Truck,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons a merchant may pick from in the admin. Kept as an explicit allowlist so
 * settings only ever reference icons that are actually bundled — a free-text
 * icon name would either bloat the bundle or render nothing.
 *
 * Per AGENTS.md, AI-style "sparkle" icons are deliberately excluded.
 */
export const ICON_REGISTRY = {

  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Battery,
  BookOpen,
  Box,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  CreditCard,
  Droplet,
  Flame,
  Gift,
  Headphones,
  Heart,
  HelpCircle,
  Layers,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Tag,
  ThumbsUp,
  Truck,
  Users,
  Wallet,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

export const ICON_NAMES = Object.keys(ICON_REGISTRY) as IconName[];

/** Resolve a stored icon name, falling back to a neutral icon if it's stale. */
export function resolveIcon(name: string | undefined): LucideIcon {
  if (name && name in ICON_REGISTRY) {
    return ICON_REGISTRY[name as IconName];
  }
  return BadgeCheck;
}
