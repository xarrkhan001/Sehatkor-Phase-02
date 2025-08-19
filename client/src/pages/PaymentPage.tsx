import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CreditCard, Smartphone, ArrowLeft, Stethoscope, MapPin, Phone, Clock, DollarSign, CheckCircle, User, Mail, ShieldCheck, Lock } from 'lucide-react';

interface ServiceData {
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor' | 'hospital' | 'lab' | 'pharmacy';
  price?: number;
  location?: string;
  phone?: string;
  duration?: string;
  image?: string;
}

const PaymentPage = () => {
  const { user, mode } = useAuth();
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
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const response = await fetch(apiUrl('/api/bookings'), {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 rounded-xl px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>

        {/* Header: Title + Secure Badge + Steps */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Confirm Booking</h1>
              <p className="text-gray-500 text-sm">Complete your service booking securely</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              Secure checkout
            </div>
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              <span className="font-medium text-gray-800">Details</span>
              <span className="mx-2">→</span>
              <span className="font-semibold text-blue-600">Payment</span>
              <span className="mx-2">→</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Side - Payment Form */}
            <div className="lg:col-span-2 p-8 space-y-8">
              {/* Accepted Methods + Security */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Easypaisa</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">JazzCash</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>256-bit SSL encrypted</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-xl text-gray-800">Select Payment Method</h3>
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'easypaisa' | 'jazzcash') => setPaymentMethod(value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Label htmlFor="easypaisa" className={`group flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${paymentMethod === 'easypaisa' ? 'border-green-500 bg-green-50 shadow-lg scale-105' : 'border-gray-200 hover:border-green-300'}`}>
                    <RadioGroupItem value="easypaisa" id="easypaisa" className="sr-only" />
                    <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${paymentMethod === 'easypaisa' ? 'bg-green-500' : 'bg-green-100 group-hover:bg-green-200'}`}>
                      <Smartphone className={`w-8 h-8 ${paymentMethod === 'easypaisa' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">Easypaisa</span>
                    <span className="text-sm text-gray-500 mt-1">Mobile Wallet</span>
                  </Label>
                  <Label htmlFor="jazzcash" className={`group flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${paymentMethod === 'jazzcash' ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' : 'border-gray-200 hover:border-purple-300'}`}>
                    <RadioGroupItem value="jazzcash" id="jazzcash" className="sr-only" />
                    <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${paymentMethod === 'jazzcash' ? 'bg-purple-500' : 'bg-purple-100 group-hover:bg-purple-200'}`}>
                      <CreditCard className={`w-8 h-8 ${paymentMethod === 'jazzcash' ? 'text-white' : 'text-purple-600'}`} />
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">JazzCash</span>
                    <span className="text-sm text-gray-500 mt-1">Mobile Wallet</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label htmlFor="paymentNumber" className="text-gray-700 font-medium flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Account Number</span>
                </Label>
                <Input
                  id="paymentNumber"
                  type="tel"
                  placeholder="e.g., 03XXXXXXXXX"
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="text-lg py-4 px-4 border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all duration-300"
                  aria-describedby="paymentNumberHelp"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p id="paymentNumberHelp" className="text-xs text-gray-500">
                    Enter your mobile wallet number (Pakistani format).
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isLoading || !paymentNumber}
                className="w-full text-lg py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirm & Pay {serviceData.price ? `Rs. ${serviceData.price}` : 'Securely'}</span>
                  </div>
                )}
              </Button>

              {/* Help & Trust */}
              <div className="pt-2 text-xs text-gray-500">
                By confirming, you agree to our Terms and Refund Policy. Having issues? Contact support at
                <span className="font-medium text-gray-700"> support@sehatkor.com</span>.
              </div>
            </div>

            {/* Right Side - Booking Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 border-l border-gray-100">
              <div className="lg:sticky lg:top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  Booking Summary
                </h2>
                
                <div className="space-y-6">
                  {/* Service Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    {serviceData.image && (
                      <div className="mb-4">
                        <img src={serviceData.image} alt={serviceData.serviceName} className="w-full h-32 object-cover rounded-xl" />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{serviceData.serviceName}</h3>
                          <p className="text-gray-600 text-sm">{serviceData.providerName}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {serviceData.providerType}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Service Details */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        {serviceData.location && (
                          <div className="flex items-center space-x-3 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{serviceData.location}</span>
                          </div>
                        )}
                        {serviceData.phone && (
                          <div className="flex items-center space-x-3 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{serviceData.phone}</span>
                          </div>
                        )}
                        {serviceData.duration && (
                          <div className="flex items-center space-x-3 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{serviceData.duration}</span>
                          </div>
                        )}
                        {serviceData.price && (
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-gray-600 font-medium">Total Amount:</span>
                            <span className="text-2xl font-bold text-green-600">Rs. {serviceData.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Patient Info */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Patient Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">Patient Name</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">Contact Email</p>
                        </div>
                      </div>
                    </div>
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
