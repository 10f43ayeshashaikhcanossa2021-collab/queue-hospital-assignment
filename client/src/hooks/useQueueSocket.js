import { useEffect } from 'react';
import getSocket from '../lib/socket';

function useQueueSocket(queryClient) {
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['current-queue'] });
    };

    socket.on('queue-updated', refresh);
    socket.on('token-called', refresh);
    socket.on('consultation-update', refresh);
    socket.on('wait-time-recalculated', refresh);
    socket.on('analytics-updated', refresh);

    return () => {
      socket.off('queue-updated', refresh);
      socket.off('token-called', refresh);
      socket.off('consultation-update', refresh);
      socket.off('wait-time-recalculated', refresh);
      socket.off('analytics-updated', refresh);
    };
  }, [queryClient]);
}

export default useQueueSocket;