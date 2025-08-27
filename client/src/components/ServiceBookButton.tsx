import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CreditCard } from 'lucide-react';
import ServiceBookingModal from './ServiceBookingModal';
import { toast } from 'sonner';

interface ServiceBookButtonProps {
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
  currentUser?: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
  } | null;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const ServiceBookButton: React.FC<ServiceBookButtonProps> = ({
  service,
  provider,
  currentUser,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = () => {
    if (!currentUser) {
      toast.error('Please login to book services', {
        description: 'You need to be logged in to book and pay for services'
      });
      return;
    }

    setIsModalOpen(true);
  };

  const displayPrice = service.variants && service.variants.length > 0 
    ? `From ${service.currency || 'PKR'} ${Math.min(...service.variants.map(v => v.price)).toLocaleString()}`
    : `${service.currency || 'PKR'} ${service.price.toLocaleString()}`;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
        onClick={handleBookClick}
      >
        <ShoppingCart className="w-4 h-4" />
        Book Now - {displayPrice}
      </Button>

      {currentUser && (
        <ServiceBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
          provider={provider}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default ServiceBookButton;
