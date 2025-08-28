import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import AdminPaymentDashboard from "@/components/AdminPaymentDashboard";

const AdminPayments = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/admin'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Payment Management
          </h1>
          <p className="text-muted-foreground">Manage service payments, releases, and view payment analytics</p>
        </div>
      </div>

      {/* Payment Dashboard */}
      <AdminPaymentDashboard />
    </div>
  );
};

export default AdminPayments;
