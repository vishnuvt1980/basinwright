import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bot,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  Cloud,
  CloudCog,
  Cloudy,
  Code2,
  Cpu,
  Database,
  Eye,
  Factory,
  FileText,
  Fuel,
  Gavel,
  Globe,
  GraduationCap,
  HeartPulse,
  Headset,
  Landmark,
  Layers,
  LayoutDashboard,
  Library,
  LineChart,
  Lock,
  MessageSquare,
  Microscope,
  Network,
  Radio,
  RadioTower,
  Rocket,
  Scale,
  Search,
  Server,
  Shapes,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Train,
  TrendingUp,
  Truck,
  Umbrella,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/// Explicit map rather than the full lucide barrel — keeps the client bundle
/// to the ~55 glyphs the CMS can actually reference.
const REGISTRY = {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, Bot, Boxes,
  Building2, Check, ChevronRight, CircleDot, Cloud, CloudCog, Cloudy, Code2,
  Cpu, Database, Eye, Factory, FileText, Fuel, Gavel, Globe, GraduationCap,
  HeartPulse, Headset, Landmark, Layers, LayoutDashboard, Library, LineChart,
  Lock, MessageSquare, Microscope, Network, Radio, RadioTower, Rocket, Scale,
  Search, Server, Shapes, Shield, ShieldAlert, ShieldCheck, ShoppingBag,
  ShoppingCart, SlidersHorizontal, Sparkles, Store, Train, TrendingUp, Truck,
  Umbrella, Users, Wrench, Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof REGISTRY;

export const ICON_NAMES = Object.keys(REGISTRY).sort() as IconName[];

export function Icon({
  name,
  className,
  strokeWidth = 1.5,
}: {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const Glyph = (name && REGISTRY[name as IconName]) || CircleDot;
  return <Glyph className={className} strokeWidth={strokeWidth} aria-hidden />;
}
