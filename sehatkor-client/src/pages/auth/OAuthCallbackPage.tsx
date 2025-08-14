import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
        // Optionally fetch profile via /api/user/me to normalize user state
        const res = await fetch('http://localhost:4000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          await login({ ...user, id: user._id }, token);
        } else {
          // Fallback: store token only
          await login({}, token);
        }
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


