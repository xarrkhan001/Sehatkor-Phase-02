import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CreditCard, Smartphone, ArrowLeft, Stethoscope } from 'lucide-react';

interface ServiceData {
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor' | 'hospital' | 'lab' | 'pharmacy';
}

const PaymentPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const serviceData = location.state as ServiceData;

  useEffect(() => {
    if (!serviceData) {
      toast.error('Service information missing');
      navigate('/');
    }
  }, [serviceData, navigate]);

  if (!user) {
    toast.error('Please login to continue');
    navigate('/login');
    return null;
  }

  if (!serviceData) {
    return null;
  }

  const handlePayment = async () => {
    if (!paymentNumber || paymentNumber.length < 8) {
      toast.error('Please enter a valid payment number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({
          patientId: user.id,
          patientName: user.name,
          providerId: serviceData.providerId,
          providerName: serviceData.providerName,
          providerType: serviceData.providerType,
          serviceId: serviceData.serviceId,
          serviceName: serviceData.serviceName,
          paymentMethod,
          paymentNumber,
        }),
      });

      if (response.ok) {
        toast.success('Booking confirmed successfully!');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Payment Form */}
            <div className="p-8 space-y-8">
              <div className="flex items-center space-x-3">
                <img src="/placeholder.svg" alt="SehatKor Logo" className="h-10 w-10" />
                <h1 className="text-3xl font-bold text-gray-800">Confirm Booking</h1>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700">Select Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'easypaisa' | 'jazzcash') => setPaymentMethod(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label htmlFor="easypaisa" className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'easypaisa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <RadioGroupItem value="easypaisa" id="easypaisa" className="sr-only" />
                    <Smartphone className="w-8 h-8 mb-2 text-green-600" />
                    <span className="font-medium text-gray-800">Easypaisa</span>
                  </Label>
                  <Label htmlFor="jazzcash" className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'jazzcash' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                    <RadioGroupItem value="jazzcash" id="jazzcash" className="sr-only" />
                    <CreditCard className="w-8 h-8 mb-2 text-purple-600" />
                    <span className="font-medium text-gray-800">JazzCash</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNumber" className="text-gray-600">
                  {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Account Number
                </Label>
                <Input
                  id="paymentNumber"
                  type="tel"
                  placeholder="e.g., 03123456789"
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="text-lg py-6 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button
                onClick={handlePayment}
                disabled={isLoading || !paymentNumber}
                className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-transform transform hover:scale-105"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Confirm & Pay Securely'}
              </Button>
            </div>

            {/* Right Side - Booking Summary */}
            <div className="bg-gray-50 p-8 border-l border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>
              <div className="space-y-6">
                {/* Service Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-700 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-blue-500" />
                    Service Details
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-7">
                    <p><span className="font-medium text-gray-800">Service:</span> {serviceData.serviceName}</p>
                    <p><span className="font-medium text-gray-800">Provider:</span> {serviceData.providerName}</p>
                    <p><span className="font-medium text-gray-800">Type:</span> <span className="capitalize">{serviceData.providerType}</span></p>
                  </div>
                </div>
                <div className="border-t border-gray-200"></div>
                {/* Patient Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-700">Patient Information</h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-7">
                    <p><span className="font-medium text-gray-800">Name:</span> {user.name}</p>
                    <p><span className="font-medium text-gray-800">Email:</span> {user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
