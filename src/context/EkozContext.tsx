import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { ConfirmDialog, ConfirmOptions } from '../components/layout/ConfirmDialog';
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
  setUser: (user: User) => void;
  members: User[];
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
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  logout: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  triggerToast: (toast: ToastData) => void;
  activeToast: ToastData | null;
  dismissToast: () => void;
}

const EkozContext = createContext<EkozContextType | undefined>(undefined);

export const EkozProvider: React.FC<{ children: ReactNode; initialUser: User }> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User>(initialUser);

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [members, setMembers] = useState<User[]>([]);

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);

  // Marketplace State
  const [thematicCores, setThematicCores] = useState<ThematicCore[]>([]);
  const [selectedCore, setSelectedCore] = useState<string>('all');
  const [businesses, setBusinesses] = useState<MarketplaceBusiness[]>([]);

  // Courses State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Events & Experiences
  const [events, setEvents] = useState<EventItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  // Direct Messages & Chat
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatRecipient, setChatRecipient] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Notifications & Checkout
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [whatsappPushOpen, setWhatsappPushOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // Confirmação on-brand (substitui window.confirm). confirm() devolve uma
  // Promise que resolve quando o usuário escolhe no modal.
  const [confirmData, setConfirmData] = useState<ConfirmOptions | null>(null);
  const confirmResolver = useRef<((v: boolean) => void) | null>(null);
  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        confirmResolver.current = resolve;
        setConfirmData(opts);
      }),
    [],
  );
  const resolveConfirm = (result: boolean) => {
    confirmResolver.current?.(result);
    confirmResolver.current = null;
    setConfirmData(null);
  };
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  const triggerToast = useCallback((toast: ToastData) => {
    setActiveToast(toast);
    setTimeout(() => {
      setActiveToast((curr) => (curr?.title === toast.title ? null : curr));
    }, 5500);
  }, []);

  const dismissToast = () => setActiveToast(null);

  // Sync state with backend API on mount — dado real, sem fallback pra
  // conteúdo fake: lista vazia significa "ainda não há nada", não "usa o mock".
  useEffect(() => {
    const loadBackendData = async () => {
      const [
        remotePosts, remoteCores, remoteBiz, remoteCourses,
        remoteEvents, remoteExp, remoteNotifs, remoteMembers,
      ] = await Promise.all([
        api.listPosts().catch(() => []),
        api.listCores().catch(() => []),
        api.listBusinesses().catch(() => []),
        api.listCourses().catch(() => []),
        api.listEvents().catch(() => []),
        api.listExperiences().catch(() => []),
        api.listNotifications().catch(() => []),
        api.listMembers().catch(() => []),
      ]);

      setPosts(remotePosts);
      setThematicCores(remoteCores);
      setBusinesses(remoteBiz);
      setCourses(remoteCourses);
      setEvents(remoteEvents);
      setExperiences(remoteExp);
      setNotifications(remoteNotifs);
      setMembers(remoteMembers);
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
        senderAvatar: msg.sender?.avatar || '/default-avatar.svg',
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
  }, [triggerToast]);

  // Action: Add Post
  const addPost = async (content: string, category: Post['category'], mediaUrl?: string) => {
    try {
      const createdPost = await api.createPost(content, category, mediaUrl);
      setPosts((prev) => [createdPost, ...prev.filter((p) => p.id !== createdPost.id)]);
      triggerToast({
        title: 'Publicado na Timeline',
        message: 'Sua mensagem foi compartilhada com todo o ecossistema Ekoz.',
        type: 'success',
      });
    } catch (err: any) {
      triggerToast({
        title: 'Erro ao publicar',
        message: err.message || 'Não foi possível publicar agora. Tente novamente.',
        type: 'info',
      });
    }
  };

  // Action: Like Post
  const toggleLikePost = async (postId: string) => {
    const applyToggle = (p: Post): Post => {
      const userLiked = !p.userLiked;
      return {
        ...p,
        userLiked,
        likesCount: userLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      };
    };

    // Atualização otimista
    setPosts((prev) => prev.map((p) => (p.id === postId ? applyToggle(p) : p)));

    try {
      await api.toggleLikePost(postId);
    } catch (err: any) {
      // Reverte a atualização otimista e avisa o usuário
      setPosts((prev) => prev.map((p) => (p.id === postId ? applyToggle(p) : p)));
      triggerToast({
        title: 'Não foi possível registrar sua curtida',
        message: err.message || 'Verifique sua conexão e tente novamente.',
        type: 'info',
      });
    }
  };

  // Action: Add Comment
  const addComment = async (postId: string, content: string) => {
    const tempId = `c-${Date.now()}`;
    const tempComment = {
      id: tempId,
      author: user,
      content,
      timestamp: 'Agora mesmo',
    };

    // Inserção otimista
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, tempComment] } : p
      )
    );

    try {
      await api.addComment(postId, content);
    } catch (err: any) {
      // Remove o comentário otimista que não chegou a ser salvo e avisa o usuário
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== tempId) }
            : p
        )
      );
      triggerToast({
        title: 'Comentário não enviado',
        message: err.message || 'Verifique sua conexão e tente novamente.',
        type: 'info',
      });
    }
  };

  // Action: Add Business to Marketplace
  const addBusiness = async (newBiz: Omit<MarketplaceBusiness, 'id' | 'verified'>) => {
    try {
      const createdBiz = await api.registerBusiness(newBiz);
      setBusinesses([createdBiz, ...businesses]);

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
    } catch (err: any) {
      triggerToast({
        title: 'Erro ao cadastrar negócio',
        message: err.message || 'Não foi possível cadastrar agora. Tente novamente.',
        type: 'info',
      });
    }
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
    await api.applyForExperience(experienceId, notes);

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
    setChatMessages([]);

    try {
      const messages = await api.getMessages(targetUser.id);
      setChatMessages(messages || []);
    } catch {
      setChatMessages([]);
    }
  };

  // Action: Send chat message — a resposta real chega via socket
  // ('chat:new_message', escutado no useEffect acima), não é simulada aqui.
  const sendChatMessage = (text: string) => {
    if (!text.trim() || !chatRecipient) return;
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
    socketClient.sendMessage(chatRecipient.id, text);
  };

  // Action: Logout — limpa sessão e recarrega pra voltar ao gate de login em App.tsx
  const logout = () => {
    api.logout();
    window.location.reload();
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
        setUser,
        members,
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
        profileOpen,
        setProfileOpen,
        confirm,
        logout,
        notifications,
        markNotificationRead,
        triggerToast,
        activeToast,
        dismissToast,
      }}
    >
      {children}
      <ConfirmDialog data={confirmData} onResolve={resolveConfirm} />
    </EkozContext.Provider>
  );
};

export const useEkoz = () => {
  const context = useContext(EkozContext);
  if (!context) throw new Error('useEkoz must be used within an EkozProvider');
  return context;
};
