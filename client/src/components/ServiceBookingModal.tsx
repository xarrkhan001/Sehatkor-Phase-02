import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Clock, User, CreditCard } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import { toast } from 'sonner';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    _id: string;
    name: string;
    price: number;
    currency?: string;
    image?: string;
    location?: string;
    phone?: string;
    variants?: Array<{
      label: string;
      price: number;
      timeRange?: string;
    }>;
  };
  provider: {
    _id: string;
    name: string;
    role: string;
  };
  currentUser: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  provider,
  currentUser
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [patientContact, setPatientContact] = useState(currentUser.phone || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPrice = service.variants?.[selectedVariant]?.price || service.price;
  const currentVariant = service.variants?.[selectedVariant];

  const normalizeProviderType = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'doctor': 'doctor',
      'clinic/hospital': 'hospital',
      'laboratory': 'lab',
      'pharmacy': 'pharmacy'
    };
    return roleMap[role] || role;
  };

  const handleBookingSubmit = async (paymentData: { paymentMethod: string; paymentNumber: string }) => {
    setIsLoading(true);
    
    try {
      const bookingData = {
        patientId: currentUser._id,
        patientName: currentUser.name,
        patientContact,
        providerId: provider._id,
        providerName: provider.name,
        providerType: normalizeProviderType(provider.role),
        serviceId: service._id,
        serviceName: service.name,
        price: currentPrice,
        currency: service.currency || 'PKR',
        paymentMethod: paymentData.paymentMethod,
        paymentNumber: paymentData.paymentNumber,
        variantIndex: service.variants ? selectedVariant : undefined,
        variantLabel: currentVariant?.label,
        variantTimeRange: currentVariant?.timeRange,
        image: service.image,
        location: service.location,
        phone: service.phone,
        notes
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Service booked successfully!', {
          description: `Your booking has been confirmed. Transaction ID: ${result.payment.transactionId}`
        });
        
        // Send notification to provider (you can implement this later)
        // await sendProviderNotification(provider._id, result.booking);
        
        onClose();
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error: any) {
      toast.error('Booking failed', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!patientContact.trim()) {
      toast.error('Please enter your contact number');
      return;
    }
    setStep('payment');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-6">
            {/* Service Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {service.image && (
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <User className="w-4 h-4" />
                      {provider.name}
                      <Badge variant="secondary">{provider.role}</Badge>
                    </div>
                    {service.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {service.location}
                      </div>
                    )}
                    {service.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4" />
                        {service.phone}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variant Selection */}
            {service.variants && service.variants.length > 0 && (
              <div className="space-y-3">
                <Label>Select Service Option</Label>
                <div className="grid gap-2">
                  {service.variants.map((variant, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVariant === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVariant(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{variant.label}</div>
                          {variant.timeRange && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {variant.timeRange}
                            </div>
                          )}
                        </div>
                        <div className="font-semibold">
                          {service.currency || 'PKR'} {variant.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Details */}
            <div className="space-y-4">
              <h4 className="font-medium">Patient Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={currentUser.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientContact">Contact Number *</Label>
                  <Input
                    id="patientContact"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={patientContact}
                    onChange={(e) => setPatientContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Price Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Total Amount</div>
                    <div className="text-sm text-muted-foreground">
                      {currentVariant?.label || service.name}
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {service.currency || 'PKR'} {currentPrice.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('details')}
              >
                ← Back to Details
              </Button>
            </div>

            <PaymentMethodSelector
              amount={currentPrice}
              currency={service.currency}
              onPaymentSubmit={handleBookingSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingModal;
