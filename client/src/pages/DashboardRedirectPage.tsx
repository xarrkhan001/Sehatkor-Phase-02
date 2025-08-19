import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRedirectPage = () => {
  const { user, mode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'patient' || mode === 'patient') {
      navigate('/dashboard/patient');
    } else {
      switch (user.role) {
        case 'doctor':
          navigate('/dashboard/doctor');
          break;
        case 'clinic/hospital':
          navigate('/dashboard/clinic');
          break;
        case 'laboratory':
          navigate('/dashboard/laboratory');
          break;
        case 'pharmacy':
          navigate('/dashboard/pharmacy');
          break;
        default:
          navigate('/'); // Fallback to home
      }
    }
  }, [user, mode, navigate]);

  return null; // This component doesn't render anything
};

export default DashboardRedirectPage;
