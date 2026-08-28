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
import { api } from '../services/api';
import { socketClient } from '../services/socket';
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
  addPost: (content: string, category: Post['category'], mediaUrl?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  thematicCores: ThematicCore[];
  selectedCore: string;
  setSelectedCore: (coreId: string) => void;
  businesses: MarketplaceBusiness[];
  addBusiness: (newBiz: Omit<MarketplaceBusiness, 'id' | 'verified'>) => Promise<void>;
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson | null) => void;
  toggleLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  events: EventItem[];
  toggleEventRegistration: (eventId: string) => Promise<void>;
  experiences: ExperienceItem[];
  applyForExperience: (experienceId: string, notes?: string) => Promise<void>;
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
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerUser: (payload: any) => Promise<void>;
  switchUser: (targetUser: User) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  triggerToast: (toast: ToastData) => void;
  activeToast: ToastData | null;
  dismissToast: () => void;
}

const EkozContext = createContext<EkozContextType | undefined>(undefined);

export const EkozProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ekoz_user');
    return saved ? JSON.parse(saved) : initialCurrentUser;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('ekoz_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  // Marketplace State
  const [thematicCores, setThematicCores] = useState<ThematicCore[]>(initialThematicCores);
  const [selectedCore, setSelectedCore] = useState<string>('all');
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>(() => {
    const saved = localStorage.getItem('ekoz_businesses');
    return saved ? JSON.parse(saved) : initialBusinesses;
  });

  // Courses State
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ekoz_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Events & Experiences
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('ekoz_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExperiences);

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
      senderAvatar: '/ezekiel.jpg',
      text: 'Perfeito, Camila! Vamos marcar uma videoconferência aqui mesmo na plataforma hoje às 17h. O que acha?',
      timestamp: '14:25',
      isMe: true,
    },
  ]);

  // Notifications & Checkout
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

  // Sync state with backend API on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        // Check current auth
        const token = api.getToken();
        if (token) {
          try {
            const meRes = await api.getMe();
            if (meRes.user) {
              setUser(meRes.user);
              localStorage.setItem('ekoz_user', JSON.stringify(meRes.user));
            }
          } catch {
            // token expired
          }
        }

        // Fetch Posts
        const remotePosts = await api.listPosts();
        if (remotePosts && remotePosts.length > 0) {
          setPosts(remotePosts);
          localStorage.setItem('ekoz_posts', JSON.stringify(remotePosts));
        }

        // Fetch Cores & Businesses
        const [remoteCores, remoteBiz] = await Promise.all([
          api.listCores().catch(() => null),
          api.listBusinesses().catch(() => null),
        ]);
        if (remoteCores && remoteCores.length > 0) setThematicCores(remoteCores);
        if (remoteBiz && remoteBiz.length > 0) {
          setBusinesses(remoteBiz);
          localStorage.setItem('ekoz_businesses', JSON.stringify(remoteBiz));
        }

        // Fetch Courses
        const remoteCourses = await api.listCourses().catch(() => null);
        if (remoteCourses && remoteCourses.length > 0) {
          setCourses(remoteCourses);
          localStorage.setItem('ekoz_courses', JSON.stringify(remoteCourses));
        }

        // Fetch Events & Experiences
        const [remoteEvents, remoteExp] = await Promise.all([
          api.listEvents().catch(() => null),
          api.listExperiences().catch(() => null),
        ]);
        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(remoteEvents);
          localStorage.setItem('ekoz_events', JSON.stringify(remoteEvents));
        }
        if (remoteExp && remoteExp.length > 0) setExperiences(remoteExp);

        // Fetch Notifications if authenticated
        if (token) {
          const remoteNotifs = await api.listNotifications().catch(() => null);
          if (remoteNotifs && remoteNotifs.length > 0) setNotifications(remoteNotifs);
        }
      } catch (err) {
        console.log('⚡ Backend syncing mode: working seamlessly with local state');
      }
    };

    loadBackendData();
  }, []);

  // Connect Socket.IO for real-time events
  useEffect(() => {
    const socket = socketClient.connect();

    socket.on('feed:new_post', (newPost: Post) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
    });

    socket.on('chat:new_message', (msg: any) => {
      const formatted: ChatMessage = {
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.sender?.name || 'Membro',
        senderAvatar: msg.sender?.avatar || '/ezekiel.jpg',
        text: msg.text,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setChatMessages((prev) => [...prev, formatted]);
      triggerToast({
        title: `Nova mensagem de ${formatted.senderName}`,
        message: formatted.text,
        type: 'whatsapp',
      });
    });

    socket.on('notification:new', (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
      triggerToast({
        title: notif.title,
        message: notif.description,
        type: notif.type === 'whatsapp' ? 'whatsapp' : 'info',
      });
    });

    return () => {
      // Keep connection alive across component life-cycle
    };
  }, []);

  // Action: Add Post
  const addPost = async (content: string, category: Post['category'], mediaUrl?: string) => {
    try {
      const createdPost = await api.createPost(content, category, mediaUrl);
      setPosts((prev) => [createdPost, ...prev.filter((p) => p.id !== createdPost.id)]);
      localStorage.setItem('ekoz_posts', JSON.stringify([createdPost, ...posts]));
    } catch {
      // Local fallback
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
      localStorage.setItem('ekoz_posts', JSON.stringify([newPost, ...posts]));
    }

    triggerToast({
      title: 'Publicado na Timeline',
      message: 'Sua mensagem foi compartilhada com todo o ecossistema Ekoz.',
      type: 'success',
    });
  };

  // Action: Like Post
  const toggleLikePost = async (postId: string) => {
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

    try {
      await api.toggleLikePost(postId);
    } catch {
      // offline silent fallback
    }
  };

  // Action: Add Comment
  const addComment = async (postId: string, content: string) => {
    const tempComment = {
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
            comments: [...p.comments, tempComment],
          };
        }
        return p;
      })
    );

    try {
      await api.addComment(postId, content);
    } catch {
      // offline silent fallback
    }
  };

  // Action: Add Business to Marketplace
  const addBusiness = async (newBiz: Omit<MarketplaceBusiness, 'id' | 'verified'>) => {
    try {
      const createdBiz = await api.registerBusiness(newBiz);
      setBusinesses([createdBiz, ...businesses]);
      localStorage.setItem('ekoz_businesses', JSON.stringify([createdBiz, ...businesses]));
    } catch {
      const fallbackBiz: MarketplaceBusiness = {
        ...newBiz,
        id: `biz-${Date.now()}`,
        verified: true,
        featured: false,
      };
      setBusinesses([fallbackBiz, ...businesses]);
      localStorage.setItem('ekoz_businesses', JSON.stringify([fallbackBiz, ...businesses]));
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DFC16E', '#CBA548', '#2E5643', '#FFFFFF'],
      });
    } catch {}

    triggerToast({
      title: 'Negócio Cadastrado no Marketplace!',
      message: `${newBiz.name} agora está visível para todos os membros Ekoz.`,
      type: 'success',
    });
  };

  // Action: Mark Lesson Completed
  const toggleLessonComplete = async (courseId: string, lessonId: string) => {
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

    try {
      await api.toggleLessonProgress(lessonId);
    } catch {
      // silent fallback
    }
  };

  // Action: Register Event
  const toggleEventRegistration = async (eventId: string) => {
    let nowRegistered = false;
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const isRegistered = !ev.isRegistered;
          nowRegistered = isRegistered;
          return {
            ...ev,
            isRegistered,
            spotsLeft: isRegistered ? Math.max(0, ev.spotsLeft - 1) : ev.spotsLeft + 1,
          };
        }
        return ev;
      })
    );

    if (nowRegistered) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#DFC16E', '#CBA548', '#FFFFFF'],
        });
      } catch {}
      triggerToast({
        title: 'Presença Confirmada!',
        message: 'Seu credenciamento para o evento foi reservado com sucesso.',
        type: 'success',
      });
    }

    try {
      await api.toggleEventRegistration(eventId);
    } catch {
      // silent fallback
    }
  };

  // Action: Apply for Experience
  const applyForExperience = async (experienceId: string, notes?: string) => {
    try {
      await api.applyForExperience(experienceId, notes);
    } catch {}

    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#CB9827', '#DFC16E', '#2E5643'],
      });
    } catch {}

    triggerToast({
      title: 'Candidatura Enviada!',
      message: 'Sua solicitação para a expedição exclusiva foi recebida pela comissão executiva Ekoz.',
      type: 'success',
    });
  };

  // Action: Open chat with specific member
  const openChatWith = async (targetUser: User) => {
    setChatRecipient(targetUser);
    setChatOpen(true);

    try {
      const messages = await api.getMessages(targetUser.id);
      if (messages && messages.length > 0) {
        setChatMessages(messages);
      }
    } catch {
      // keep simulated messages
    }
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

    if (chatRecipient) {
      socketClient.sendMessage(chatRecipient.id, text);

      // Simulated auto-reply
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          senderId: chatRecipient.id,
          senderName: chatRecipient.name,
          senderAvatar: chatRecipient.avatar,
          text: `Excelente ponto, ${user.name.split(' ')[0]}! Mensagem recebida. Vamos avançar com força total! 🚀`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        };
        setChatMessages((prev) => [...prev, reply]);
        triggerToast({
          title: `WhatsApp / Chat: Mensagem de ${chatRecipient.name}`,
          message: reply.text,
          type: 'whatsapp',
        });
      }, 2500);
    }
  };

  // Action: Auth Login
  const loginWithCredentials = async (email: string, pass: string) => {
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      localStorage.setItem('ekoz_user', JSON.stringify(res.user));
      socketClient.connect(res.token);

      triggerToast({
        title: `Bem-vindo, ${res.user.name}!`,
        message: `Sessão executiva iniciada como ${res.user.role} (${res.user.plan}).`,
        type: 'success',
      });
    } catch (err: any) {
      // Fallback for offline demo
      const matched = membersList.find((m) => m.name.toLowerCase().includes(email.split('@')[0].toLowerCase())) || initialCurrentUser;
      setUser(matched);
      localStorage.setItem('ekoz_user', JSON.stringify(matched));
      triggerToast({
        title: `Sessão Alternada: ${matched.name}`,
        message: `Conectado como ${matched.role}.`,
        type: 'info',
      });
    }
  };

  // Action: Register User
  const registerUser = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
    localStorage.setItem('ekoz_user', JSON.stringify(res.user));
    socketClient.connect(res.token);

    triggerToast({
      title: 'Credenciamento Concluído!',
      message: `Bem-vindo ao ecossistema Ekoz, ${res.user.name}.`,
      type: 'success',
    });
  };

  // Action: Switch User
  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem('ekoz_user', JSON.stringify(targetUser));
    triggerToast({
      title: `Perfil Ativo: ${targetUser.name}`,
      message: `Navegando no ecossistema como ${targetUser.role}.`,
      type: 'info',
    });
  };

  // Action: Mark notification read
  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await api.markNotificationRead(id);
    } catch {}
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
        thematicCores,
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
        applyForExperience,
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
        authModalOpen,
        setAuthModalOpen,
        loginWithCredentials,
        registerUser,
        switchUser,
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
