import { useAuth } from '@/contexts/AuthContext';
import PatientDashboard from './dashboards/PatientDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import ClinicDashboard from './dashboards/ClinicDashboard';
import HospitalDashboard from './dashboards/HospitalDashboard';
import LaboratoryDashboard from './dashboards/LaboratoryDashboard';
import PharmacyDashboard from './dashboards/PharmacyDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to access dashboard</h2>
          <p className="text-muted-foreground">You need to be logged in to view this content.</p>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'clinic/hospital':
      return <ClinicDashboard />;
    case 'laboratory':
      return <LaboratoryDashboard />;
    case 'pharmacy':
      return <PharmacyDashboard />;
    default:
      return <PatientDashboard />;
  }
};

export default RoleBasedDashboard;