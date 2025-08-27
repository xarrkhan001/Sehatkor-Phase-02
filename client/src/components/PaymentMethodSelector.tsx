import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodSelectorProps {
  onPaymentSubmit: (paymentData: {
    paymentMethod: string;
    paymentNumber: string;
  }) => void;
  isLoading?: boolean;
  amount: number;
  currency?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onPaymentSubmit,
  isLoading = false,
  amount,
  currency = 'PKR'
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentNumber, setPaymentNumber] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const paymentMethods = [
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: <Smartphone className="w-5 h-5" />,
      placeholder: '03XX-XXXXXXX',
      description: 'Pay using your EasyPaisa account'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: <CreditCard className="w-5 h-5" />,
      placeholder: '03XX-XXXXXXX',
      description: 'Pay using your JazzCash account'
    }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (!paymentNumber) {
      newErrors.paymentNumber = 'Please enter your payment number';
    } else if (paymentNumber.length < 8 || paymentNumber.length > 20) {
      newErrors.paymentNumber = 'Payment number must be between 8-20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onPaymentSubmit({
        paymentMethod,
        paymentNumber
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Amount: <span className="font-semibold">{currency} {amount.toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment will be processed securely. Your money goes directly to our admin account for safe processing.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    {method.icon}
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNumber">
              {paymentMethod === 'easypaisa' ? 'EasyPaisa Number' : 
               paymentMethod === 'jazzcash' ? 'JazzCash Number' : 'Payment Number'}
            </Label>
            <Input
              id="paymentNumber"
              type="tel"
              placeholder={
                paymentMethods.find(m => m.id === paymentMethod)?.placeholder || 
                'Enter your payment number'
              }
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              className={errors.paymentNumber ? 'border-destructive' : ''}
            />
            {errors.paymentNumber && (
              <p className="text-sm text-destructive">{errors.paymentNumber}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString()}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
