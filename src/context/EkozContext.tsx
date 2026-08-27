import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Post,
  ThematicCore,
  MarketplaceBusiness,
  Course,
  Lesson,
  EventItem,
  ExperienceItem,
  ChatMessage,
  NotificationItem,
  ActiveTab,
} from '../types';
import {
  currentUser as initialCurrentUser,
  initialPosts,
  thematicCores as initialThematicCores,
  marketplaceBusinesses as initialBusinesses,
  coursesList as initialCourses,
  eventsList as initialEvents,
  experiencesList as initialExperiences,
  initialNotifications,
  membersList,
} from '../data/mockData';
import confetti from 'canvas-confetti';

interface ToastData {
  title: string;
  message: string;
  type?: 'whatsapp' | 'success' | 'info';
}

interface EkozContextType {
  user: User;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  posts: Post[];
  addPost: (content: string, category: Post['category'], mediaUrl?: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  thematicCores: ThematicCore[];
  selectedCore: string;
  setSelectedCore: (coreId: string) => void;
  businesses: MarketplaceBusiness[];
  addBusiness: (newBiz: Omit<MarketplaceBusiness, 'id' | 'verified'>) => void;
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson | null) => void;
  toggleLessonComplete: (courseId: string, lessonId: string) => void;
  events: EventItem[];
  toggleEventRegistration: (eventId: string) => void;
  experiences: ExperienceItem[];
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatRecipient: User | null;
  openChatWith: (targetUser: User) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  whatsappPushOpen: boolean;
  setWhatsappPushOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  selectedPlanForCheckout: string;
  setSelectedPlanForCheckout: (plan: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  triggerToast: (toast: ToastData) => void;
  activeToast: ToastData | null;
  dismissToast: () => void;
}

const EkozContext = createContext<EkozContextType | undefined>(undefined);

export const EkozProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>(initialCurrentUser);
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  const migrateAvatar = <T,>(data: T): T => {
    try {
      const str = JSON.stringify(data);
      const updated = str.replaceAll(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        '/ezekiel.jpg'
      );
      return JSON.parse(updated);
    } catch {
      return data;
    }
  };

  // Posts State with LocalStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('ekoz_posts');
    return saved ? migrateAvatar(JSON.parse(saved)) : initialPosts;
  });

  useEffect(() => {
    localStorage.setItem('ekoz_posts', JSON.stringify(posts));
  }, [posts]);

  // Marketplace State with LocalStorage
  const [selectedCore, setSelectedCore] = useState<string>('all');
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>(() => {
    const saved = localStorage.getItem('ekoz_businesses');
    return saved ? migrateAvatar(JSON.parse(saved)) : initialBusinesses;
  });

  useEffect(() => {
    localStorage.setItem('ekoz_businesses', JSON.stringify(businesses));
  }, [businesses]);

  // Courses State with LocalStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ekoz_courses');
    return saved ? migrateAvatar(JSON.parse(saved)) : initialCourses;
  });

  useEffect(() => {
    localStorage.setItem('ekoz_courses', JSON.stringify(courses));
  }, [courses]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Events State
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('ekoz_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  useEffect(() => {
    localStorage.setItem('ekoz_events', JSON.stringify(events));
  }, [events]);

  const [experiences] = useState<ExperienceItem[]>(initialExperiences);

  // Direct Messages & Chat
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatRecipient, setChatRecipient] = useState<User | null>(membersList[1]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      senderId: 'user-2',
      senderName: 'Dra. Camila Vasconcellos',
      senderAvatar: membersList[1].avatar,
      text: 'Olá Ezekiel! Tudo excelente? Gostaria de alinhar nossa proposta para a holding patrimonial dos membros Ekoz.',
      timestamp: '14:20',
      isMe: false,
    },
    {
      id: 'm-2',
      senderId: 'user-ezekiel',
      senderName: "Ezekiel Dall'Bello",
      senderAvatar: initialCurrentUser.avatar,
      text: 'Perfeito, Camila! Vamos marcar uma videoconferência aqui mesmo na plataforma hoje às 17h. O que acha?',
      timestamp: '14:25',
      isMe: true,
    },
  ]);

  // Notifications & Push Simulator
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [whatsappPushOpen, setWhatsappPushOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string>('Ekoz Black Membership');
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  const triggerToast = (toast: ToastData) => {
    setActiveToast(toast);
    setTimeout(() => {
      setActiveToast((curr) => (curr?.title === toast.title ? null : curr));
    }, 5500);
  };

  const dismissToast = () => setActiveToast(null);

  // Action: Add Post
  const addPost = (content: string, category: Post['category'], mediaUrl?: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      content,
      category,
      mediaUrl: mediaUrl || undefined,
      timestamp: 'Agora mesmo',
      likesCount: 0,
      userLiked: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    triggerToast({
      title: 'Publicado na Timeline',
      message: 'Sua mensagem foi compartilhada com todo o ecossistema Ekoz.',
      type: 'success',
    });
  };

  // Action: Like Post
  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return {
            ...p,
            userLiked,
            likesCount: userLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Action: Add Comment
  const addComment = (postId: string, content: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: user,
      content,
      timestamp: 'Agora mesmo',
    };
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
  };

  // Action: Add Business to Marketplace
  const addBusiness = (newBiz: Omit<MarketplaceBusiness, 'id' | 'verified'>) => {
    const createdBiz: MarketplaceBusiness = {
      ...newBiz,
      id: `biz-${Date.now()}`,
      verified: true,
      featured: false,
    };
    setBusinesses([createdBiz, ...businesses]);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DFC16E', '#CBA548', '#2E5643', '#FFFFFF'],
      });
    } catch {
      // safe fallback if confetti fails
    }
    triggerToast({
      title: 'Negócio Cadastrado no Marketplace!',
      message: `${createdBiz.name} agora está visível para todos os membros Ekoz.`,
      type: 'success',
    });
  };

  // Action: Mark Lesson Completed
  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === courseId) {
          let completedCount = 0;
          let totalLessons = 0;
          const updatedModules = c.modules.map((m) => {
            const updatedLessons = m.lessons.map((l) => {
              totalLessons++;
              if (l.id === lessonId) {
                const newCompleted = !l.completed;
                if (newCompleted) completedCount++;
                return { ...l, completed: newCompleted };
              }
              if (l.completed) completedCount++;
              return l;
            });
            return { ...m, lessons: updatedLessons };
          });

          const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
          return {
            ...c,
            modules: updatedModules,
            progress,
          };
        }
        return c;
      })
    );
  };

  // Action: Register Event
  const toggleEventRegistration = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const isRegistered = !ev.isRegistered;
          if (isRegistered) {
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#DFC16E', '#CBA548', '#FFFFFF'],
              });
            } catch {
              // fallback
            }
            triggerToast({
              title: 'Presença Confirmada!',
              message: `Seu credenciamento para ${ev.title} foi reservado.`,
              type: 'success',
            });
          }
          return {
            ...ev,
            isRegistered,
            spotsLeft: isRegistered ? Math.max(0, ev.spotsLeft - 1) : ev.spotsLeft + 1,
          };
        }
        return ev;
      })
    );
  };

  // Action: Open chat with specific member
  const openChatWith = (targetUser: User) => {
    setChatRecipient(targetUser);
    setChatOpen(true);
  };

  // Action: Send chat message
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setChatMessages((prev) => [...prev, msg]);

    // Simulated reply after 2.5 seconds
    setTimeout(() => {
      if (chatRecipient) {
        const reply: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          senderId: chatRecipient.id,
          senderName: chatRecipient.name,
          senderAvatar: chatRecipient.avatar,
          text: `Combinado, Ezekiel! Recebi sua mensagem. Vamos avançar com excelência! 🚀`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        };
        setChatMessages((prev) => [...prev, reply]);
        triggerToast({
          title: `WhatsApp / Chat: Nova mensagem de ${chatRecipient.name}`,
          message: reply.text,
          type: 'whatsapp',
        });
      }
    }, 2500);
  };

  // Action: Mark notification read
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <EkozContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        posts,
        addPost,
        toggleLikePost,
        addComment,
        thematicCores: initialThematicCores,
        selectedCore,
        setSelectedCore,
        businesses,
        addBusiness,
        courses,
        selectedCourse,
        setSelectedCourse,
        activeLesson,
        setActiveLesson,
        toggleLessonComplete,
        events,
        toggleEventRegistration,
        experiences,
        chatOpen,
        setChatOpen,
        chatRecipient,
        openChatWith,
        chatMessages,
        sendChatMessage,
        whatsappPushOpen,
        setWhatsappPushOpen,
        checkoutOpen,
        setCheckoutOpen,
        selectedPlanForCheckout,
        setSelectedPlanForCheckout,
        notifications,
        markNotificationRead,
        triggerToast,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </EkozContext.Provider>
  );
};

export const useEkoz = () => {
  const context = useContext(EkozContext);
  if (!context) throw new Error('useEkoz must be used within an EkozProvider');
  return context;
};
