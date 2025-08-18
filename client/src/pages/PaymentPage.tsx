import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createBooking, CreateBookingPayload } from '@/lib/bookingApi';
import { Service } from '@/data/mockData';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Landmark, Smartphone, User, Building, Stethoscope, FlaskConical, Pill, Shield, CheckCircle, Clock } from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { service } = location.state as { service: Service & { providerId: any, _providerId: any, _providerType: string } };

  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank'>('EasyPaisa');
  const [selectedBank, setSelectedBank] = useState('Meezan Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Invalid Service</h1>
        <p>No service details were provided. Please go back and select a service.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    try {
      const payload: CreateBookingPayload = {
        providerId: service.providerId._id,
        serviceId: service.id,
        serviceModel: service._providerType === 'clinic/hospital' ? 'ClinicService' : service._providerType === 'doctor' ? 'DoctorService' : service._providerType === 'laboratory' ? 'LaboratoryTest' : 'Medicine',
        paymentMethod,
        serviceSnapshot: {
          name: service.name,
          price: service.price,
          description: service.description,
        },
      };

      const newBooking = await createBooking(payload);

      toast({
        title: 'Booking Successful!',
        description: 'Your booking has been confirmed. You can view it in your dashboard.',
        variant: 'success',
      });

      navigate(`/booking/${newBooking._id}`);
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProviderIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="w-6 h-6 text-blue-600" />;
      case 'clinic':
      case 'hospital': return <Building className="w-6 h-6 text-green-600" />;
      case 'laboratory': return <FlaskConical className="w-6 h-6 text-purple-600" />;
      case 'pharmacy': return <Pill className="w-6 h-6 text-red-600" />;
      default: return <User className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'JazzCash': return 'text-red-600 bg-red-50';
      case 'EasyPaisa': return 'text-green-600 bg-green-50';
      case 'Card': return 'text-blue-600 bg-blue-50';
      case 'Bank': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Secure <span className="text-blue-600">Checkout</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your healthcare booking with our secure payment system. Your information is protected with industry-standard encryption.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Order Summary
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Review your booking details below
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Service Details */}
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center shadow-md">
                    {getProviderIcon(service.providerId.role)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Instant Booking
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Provider Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    {getProviderIcon(service.providerId.role)}
                    Provider Details
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{service.providerId.name}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900">Price Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">PKR {service.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-b-lg">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">PKR {service.price.toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Payment Method - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-fit sticky top-8">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Payment Method</CardTitle>
                <CardDescription className="text-purple-100">
                  Choose your preferred payment option
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} className="space-y-4">
                  <Label 
                    htmlFor="EasyPaisa" 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      paymentMethod === 'EasyPaisa' 
                        ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getPaymentMethodColor('EasyPaisa')}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">EasyPaisa</span>
                      <p className="text-sm text-gray-500">Mobile wallet</p>
                    </div>
                    <RadioGroupItem value="EasyPaisa" id="EasyPaisa" className="sr-only" />
                  </Label>

                  <Label 
                    htmlFor="JazzCash" 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      paymentMethod === 'JazzCash' 
                        ? 'border-red-500 bg-red-50 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getPaymentMethodColor('JazzCash')}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">JazzCash</span>
                      <p className="text-sm text-gray-500">Mobile wallet</p>
                    </div>
                    <RadioGroupItem value="JazzCash" id="JazzCash" className="sr-only" />
                  </Label>

                  <Label 
                    htmlFor="Bank" 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      paymentMethod === 'Bank' 
                        ? 'border-purple-500 bg-purple-50 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getPaymentMethodColor('Bank')}`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Bank Transfer</span>
                      <p className="text-sm text-gray-500">Direct bank transfer</p>
                    </div>
                    <RadioGroupItem value="Bank" id="Bank" className="sr-only" />
                  </Label>
                </RadioGroup>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  {paymentMethod === 'EasyPaisa' && (
                    <div className="space-y-3 animate-in fade-in">
                      <h4 className="font-semibold text-lg text-gray-800">EasyPaisa Account Details</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-600">Account Title: <span className="font-bold text-gray-900 block">Sehat Kor</span></p>
                        <p className="text-sm text-gray-600">Account Number: <span className="font-bold text-gray-900 block">03451234567</span></p>
                      </div>
                      <p className="text-xs text-gray-500">Please transfer the total amount to this account and then confirm your booking.</p>
                    </div>
                  )}
                  {paymentMethod === 'JazzCash' && (
                    <div className="space-y-3 animate-in fade-in">
                      <h4 className="font-semibold text-lg text-gray-800">JazzCash Account Details</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-600">Account Title: <span className="font-bold text-gray-900 block">Sehat Kor</span></p>
                        <p className="text-sm text-gray-600">Account Number: <span className="font-bold text-gray-900 block">03001234567</span></p>
                      </div>
                      <p className="text-xs text-gray-500">Please transfer the total amount to this account and then confirm your booking.</p>
                    </div>
                  )}
                  {paymentMethod === 'Bank' && (
                    <div className="space-y-3 animate-in fade-in">
                      <h4 className="font-semibold text-lg text-gray-800">Bank Account Details</h4>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Meezan Bank">Meezan Bank</SelectItem>
                          <SelectItem value="HBL">HBL</SelectItem>
                          <SelectItem value="MCB">MCB</SelectItem>
                          <SelectItem value="UBL">UBL</SelectItem>
                          <SelectItem value="Bank Alfalah">Bank Alfalah</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2 mt-2">
                        <p className="text-sm text-gray-600">Bank Name: <span className="font-bold text-gray-900 block">{selectedBank}</span></p>
                        <p className="text-sm text-gray-600">Account Title: <span className="font-bold text-gray-900 block">Sehat Kor Pvt. Ltd.</span></p>
                        <p className="text-sm text-gray-600">IBAN: <span className="font-bold text-gray-900 block">PK12ABCD0001234567890123</span></p>
                      </div>
                      <p className="text-xs text-gray-500">Please transfer the total amount to this account and then confirm your booking.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6">
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={isProcessing} 
                  className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Secure Pay PKR {service.price.toLocaleString()}
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                256-bit SSL Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;