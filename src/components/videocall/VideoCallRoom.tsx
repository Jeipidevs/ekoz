import React, { useState, useEffect, useRef } from 'react';
import { useEkoz } from '../../context/EkozContext';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  MessageSquare,
  PhoneOff,
  Users,
  ShieldCheck,
  Maximize2,
  Sparkles,
  Send,
} from 'lucide-react';

export const VideoCallRoom: React.FC = () => {
  const { user, triggerToast, setActiveTab } = useEkoz();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [meetingChatText, setMeetingChatText] = useState('');
  const [meetingMessages, setMeetingMessages] = useState<{ user: string; text: string; time: string }[]>([
    {
      user: 'Dra. Camila Vasconcellos',
      text: 'Boa tarde a todos! Pronta para apresentar os números da rodada.',
      time: '17:01',
    },
    {
      user: 'Rodrigo Silveira',
      text: 'Áudio e vídeo perfeitos por aqui!',
      time: '17:02',
    },
  ]);

  const [callEnded, setCallEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt real local camera stream if available, otherwise graceful fallback
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (camOn && !callEnded) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to photo
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camOn, callEnded]);

  const handleEndCall = () => {
    setCallEnded(true);
    triggerToast({
      title: 'Chamada Encerrada',
      message: 'Você saiu da sala de videoconferência da Ekoz.',
      type: 'info',
    });
  };

  const handleSendMeetingMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingChatText.trim()) return;

    setMeetingMessages([
      ...meetingMessages,
      {
        user: user.name,
        text: meetingChatText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMeetingChatText('');
  };

  if (callEnded) {
    return (
      <div className="ekoz-card call-ended-card">
        <ShieldCheck size={54} color="#DFC16E" />
        <h2>Videoconferência Finalizada</h2>
        <p>A gravação e a ata da reunião estarão disponíveis em breve no seu painel.</p>
        <div className="mt-4 flex-gap">
          <button onClick={() => setCallEnded(false)} className="btn btn-gold">
            Entrar Novamente
          </button>
          <button onClick={() => setActiveTab('feed')} className="btn btn-secondary">
            Voltar para a Timeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="videocall-container">
      {/* Top Meeting Info Bar */}
      <div className="meeting-top-bar">
        <div className="meeting-title-group">
          <div className="meeting-live-pulse">
            <span className="pulse-dot"></span>
            <span className="live-text">SALA AO VIVO</span>
          </div>
          <h2 className="meeting-title">Mentoria Executiva & Alinhamento Estratégico</h2>
          <span className="badge badge-moss">Criptografia E2E Ativa</span>
        </div>

        <div className="meeting-top-right">
          <div className="attendee-pill">
            <Users size={15} color="#DFC16E" />
            <span>4 Participantes</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`btn btn-sm ${showChat ? 'btn-gold' : 'btn-secondary'}`}
          >
            <MessageSquare size={15} />
            <span>Chat da Reunião</span>
          </button>
        </div>
      </div>

      {/* Main Video Grid & Side Chat */}
      <div className="meeting-content-grid">
        {/* Video Tiles Grid */}
        <div className={`video-tiles-grid ${showChat ? 'with-chat' : 'full-width'}`}>
          {/* Tile 1: Current User / Ezekiel */}
          <div className="video-tile active-speaker">
            {camOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video-element-stream"
                poster={user.avatar}
              />
            ) : (
              <div className="video-off-placeholder">
                <img src={user.avatar} alt={user.name} className="user-avatar-lg" />
                <span>Câmera Desativada</span>
              </div>
            )}
            <div className="tile-footer">
              <span className="tile-user-name">{user.name} (Você - Anfitrião)</span>
              <div className="tile-icons">
                {!micOn && <MicOff size={14} color="#EF4444" />}
                {!camOn && <VideoOff size={14} color="#EF4444" />}
              </div>
            </div>
            <div className="speaking-indicator-ring"></div>
          </div>

          {/* Tile 2: Dra. Camila */}
          <div className="video-tile">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
              alt="Dra. Camila"
              className="video-element-stream"
            />
            <div className="tile-footer">
              <span className="tile-user-name">Dra. Camila Vasconcellos</span>
              <div className="tile-icons">
                <Mic size={14} color="#4ADE80" />
              </div>
            </div>
          </div>

          {/* Tile 3: Rodrigo Silveira */}
          <div className="video-tile">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80"
              alt="Rodrigo Silveira"
              className="video-element-stream"
            />
            <div className="tile-footer">
              <span className="tile-user-name">Rodrigo Silveira • Vórtex IA</span>
              <div className="tile-icons">
                <Mic size={14} color="#4ADE80" />
              </div>
            </div>
          </div>

          {/* Tile 4: Marcelo Bittencourt */}
          <div className="video-tile">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80"
              alt="Marcelo Bittencourt"
              className="video-element-stream"
            />
            <div className="tile-footer">
              <span className="tile-user-name">Marcelo Bittencourt • Highlands</span>
              <div className="tile-icons">
                <Mic size={14} color="#4ADE80" />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Side Chat */}
        {showChat && (
          <div className="meeting-side-chat ekoz-card">
            <div className="meeting-chat-header">
              <MessageSquare size={16} color="#DFC16E" />
              <h4>Mensagens da Sessão</h4>
            </div>

            <div className="meeting-chat-messages">
              {meetingMessages.map((msg, i) => (
                <div key={i} className="meeting-chat-msg">
                  <div className="msg-header-row">
                    <span className="msg-sender">{msg.user}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <p className="msg-text">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMeetingMessage} className="meeting-chat-form">
              <input
                type="text"
                value={meetingChatText}
                onChange={(e) => setMeetingChatText(e.target.value)}
                placeholder="Enviar comentário na reunião..."
                className="ekoz-input"
              />
              <button type="submit" className="btn btn-gold btn-sm">
                <Send size={13} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Call Controls Bar */}
      <div className="call-controls-bar">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`control-btn ${micOn ? 'active' : 'inactive'}`}
          title={micOn ? 'Mutar Microfone' : 'Ativar Microfone'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={`control-btn ${camOn ? 'active' : 'inactive'}`}
          title={camOn ? 'Desligar Câmera' : 'Ligar Câmera'}
        >
          {camOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={() => {
            setScreenSharing(!screenSharing);
            triggerToast({
              title: screenSharing ? 'Compartilhamento Encerrado' : 'Tela Compartilhada',
              message: screenSharing ? 'Sua tela não está mais visível.' : 'Os membros agora visualizam sua tela.',
              type: 'info',
            });
          }}
          className={`control-btn ${screenSharing ? 'active-gold' : 'inactive'}`}
          title="Compartilhar Tela"
        >
          <MonitorUp size={20} />
        </button>

        <button
          onClick={handleEndCall}
          className="control-btn end-call-btn"
          title="Desconectar da Reunião"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};
