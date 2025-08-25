import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchMyProfile } from '@/lib/chatApi';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const OAuthCallbackPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const token = query.get('token');
    const error = query.get('error');
    (async () => {
      try {
        if (error) {
          toast({ title: 'Social login failed', description: error, variant: 'destructive' });
          navigate('/login');
          return;
        }
        if (!token) {
          toast({ title: 'Missing token', description: 'No token returned from provider', variant: 'destructive' });
          navigate('/login');
          return;
        }
        // Fetch profile via /api/profile to normalize user state
        let u: any = {};
        try {
          // Temporarily stash token so fetchMyProfile includes it
          localStorage.setItem('sehatkor_token', token);
          const data = await fetchMyProfile();
          u = data?.user || data || {};
        } catch {
          // ignore, will proceed with token-only login
        }
        await login(u?._id || u.id ? { ...u, id: u._id || u.id } : {}, token);
        toast({ title: 'Welcome!', description: 'Signed in successfully.' });
        navigate('/');
      } catch (e: any) {
        toast({ title: 'Login error', description: e?.message || 'Unexpected error', variant: 'destructive' });
        navigate('/login');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-muted-foreground">Finishing sign-in…</div>
    </div>
  );
};

export default OAuthCallbackPage;


