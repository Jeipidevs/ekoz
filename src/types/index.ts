export type UserRole = 'CEO' | 'Mentor' | 'Admin' | 'Member' | 'Black Member';

export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  headline: string;
  company: string;
  avatar: string;
  bio: string;
  verified: boolean;
  skills: string[];
  location: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  plan: string;
  active?: boolean;
}

export interface AdminMemberSubscription {
  plan: string;
  status: string;
  expiresAt: string | null;
}

export interface AdminSubscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  paymentMethod: string | null;
  caktoOrderId: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface AdminMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: string;
  active: boolean;
  whatsapp: string | null;
  createdAt: string;
  subscriptions: AdminMemberSubscription[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  pinned?: boolean;
  category: 'Avisos Oficiais' | 'Negócios' | 'Insights & Estratégia' | 'Oportunidades';
  mediaUrl?: string;
  likesCount: number;
  userLiked?: boolean;
  comments: Comment[];
}

export interface ThematicCore {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  count: number;
}

export interface MarketplaceBusiness {
  id: string;
  name: string;
  coreId: string;
  headline: string;
  description: string;
  founder: string;
  founderRole: string;
  avatar: string;
  coverImage?: string;
  tags: string[];
  whatsapp: string;
  website?: string;
  location: string;
  verified: boolean;
  featured?: boolean;
}

export interface LessonResource {
  name: string;
  type: 'PDF' | 'Planilha' | 'Link' | 'Resumo';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  completed: boolean;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  coverImage: string;
  backdropImage?: string;
  category: 'Alta Performance' | 'Gestão & Escala' | 'Liderança & Inteligência' | 'Lifestyle & Network';
  duration: string;
  lessonsCount: number;
  description: string;
  modules: CourseModule[];
  progress: number;
  isFeatured?: boolean;
  tags?: string[];
  learnersCount?: number;
}

export interface EventItem {
  id: string;
  title: string;
  type: 'Presencial' | 'Online' | 'Masterclass Exclusiva' | 'Jantar Executivo';
  date: string;
  time: string;
  location: string;
  speaker: string;
  speakerRole: string;
  description: string;
  image: string;
  spotsLeft: number;
  totalSpots?: number;
  isRegistered?: boolean;
}

export interface ExperienceItem {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  dates: string;
  coverImage: string;
  gallery: string[];
  highlights: string[];
  description: string;
  status: 'Vagas Abertas' | 'Últimas Vagas' | 'Exclusivo Black';
  investment: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'whatsapp' | 'lesson' | 'announcement' | 'connection';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type ActiveTab = 'feed' | 'academy' | 'marketplace' | 'events' | 'experiences' | 'videocall' | 'admin';
