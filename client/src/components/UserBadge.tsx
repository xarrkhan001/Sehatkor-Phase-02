import { Badge } from "@/components/ui/badge";

const roleLabelMap: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  'clinic/hospital': 'Clinic/Hospital',
  laboratory: 'Lab',
  pharmacy: 'Pharmacy',
};

export default function UserBadge({ role }: { role: string }) {
  const label = roleLabelMap[role] || role;
  return <Badge variant="destructive" className="text-[10px] bg-red-100 text-red-700 border-red-200">{label}</Badge>;
}




