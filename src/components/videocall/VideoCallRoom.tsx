import React, { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { useEkoz } from '../../context/EkozContext';
import { api } from '../../services/api';
import { ShieldCheck } from 'lucide-react';

export const VideoCallRoom: React.FC = () => {
  const { triggerToast, setActiveTab } = useEkoz();
  const [callInfo, setCallInfo] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    if (callEnded) return;
    api
      .getVideoCallToken()
      .then((data) => setCallInfo(data))
      .catch((err: any) => setError(err.message || 'Não foi possível conectar à sala de vídeo'));
  }, [callEnded]);

  if (callEnded) {
    return (
      <div className="ekoz-card call-ended-card">
        <ShieldCheck size={54} color="#DFC16E" />
        <h2>Videoconferência Finalizada</h2>
        <p>Você saiu da Sala Principal Ekoz.</p>
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

  if (error) {
    return (
      <div className="ekoz-card call-ended-card">
        <p>{error}</p>
        <button onClick={() => setActiveTab('feed')} className="btn btn-secondary mt-4">
          Voltar para a Timeline
        </button>
      </div>
    );
  }

  if (!callInfo) {
    return (
      <div className="ekoz-card call-ended-card">
        <p className="text-muted">Conectando à sala de vídeo...</p>
      </div>
    );
  }

  return (
    <div className="videocall-container">
      <LiveKitRoom
        serverUrl={callInfo.url}
        token={callInfo.token}
        connect
        video
        audio
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={() => {
          setCallInfo(null);
          setCallEnded(true);
          triggerToast({
            title: 'Chamada Encerrada',
            message: 'Você saiu da sala de videoconferência da Ekoz.',
            type: 'info',
          });
        }}
        onError={(err) => {
          setError(err.message || 'Erro na conexão com a sala de vídeo');
        }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
};
