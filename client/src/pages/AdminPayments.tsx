import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminPaymentDashboard from "@/components/AdminPaymentDashboard";

const AdminPayments = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button (header title/subtitle removed as requested) */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/admin'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Button>
      </div>

      {/* Payment Dashboard */}
      <AdminPaymentDashboard />
    </div>
  );
};

export default AdminPayments;
