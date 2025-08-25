import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceType: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  serviceName: string;
}

type RatingOption = "Excellent" | "Good" | "Fair";

const RatingModal = ({ 
  isOpen, 
  onClose, 
  serviceId, 
  serviceType, 
  serviceName, 
}: RatingModalProps) => {
  const [rating, setRating] = useState<RatingOption | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { socket } = useSocket();
  const { user } = useAuth();

  const handleSubmit = (selected?: RatingOption) => {
    const chosen = selected || rating;
    if (!chosen) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!socket) {
      toast({
        title: "Connection Error",
        description: "Not connected to the server. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const lowerChosen = String(chosen).toLowerCase();
    const ratingKey = lowerChosen; // direct mapping for backend
    const selectedStars = starsFor(chosen as RatingOption);
    const payload = { serviceId, serviceType, rating: ratingKey, stars: selectedStars } as const;
    console.log('Sending rating payload:', payload); // Debug log
    socket.emit("submit_rating", payload, (response: { success: boolean; error?: string }) => {
      setIsSubmitting(false);
      if (response.success) {
        toast({
          title: "Rating Submitted",
          description: "Thank you for your feedback!",
        });
        // Derive user's own badge from selection and broadcast for optimistic UI
        const yourBadge = (ratingKey === 'excellent' ? 'excellent' : ratingKey === 'good' ? 'good' : 'fair') as 'excellent'|'good'|'fair';

        // Persist to localStorage so it survives refresh
        try {
          const uid = (user as any)?.id ?? (user as any)?._id ?? 'anon';
          const key = `myRating:${uid}:${serviceType}:${serviceId}`;
          localStorage.setItem(key, yourBadge);
        } catch {}

        window.dispatchEvent(
          new CustomEvent('my_rating_updated', {
            detail: { serviceId, serviceType, yourBadge }
          })
        );
        handleClose();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to submit rating",
          variant: "destructive",
        });
      }
    });
  };

  const handleClose = () => {
    setRating("");
    onClose();
  };

  const ratingOptions: RatingOption[] = ["Excellent", "Good", "Fair"];

  const colorFor = (opt: RatingOption) => {
    switch (opt) {
      case 'Excellent':
        return {
          wrap: 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-amber-200',
          icon: 'text-amber-500',
          hover: 'hover:from-yellow-100 hover:via-amber-100 hover:to-yellow-100',
        };
      case 'Good':
        return {
          wrap: 'bg-emerald-50 border-emerald-200',
          icon: 'text-emerald-500',
          hover: 'hover:bg-emerald-100',
        };
      case 'Fair':
        return {
          wrap: 'bg-violet-50 border-violet-200',
          icon: 'text-violet-500',
          hover: 'hover:bg-violet-100',
        };
    }
  };

  const starsFor = (opt: RatingOption) => {
    switch (opt) {
      case 'Excellent':
        return 5;
      case 'Good':
        return 4;
      case 'Fair':
        return 3;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate Service</DialogTitle>
          <DialogDescription>
            Share your experience and help others make informed decisions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{serviceName}</h3>
            <p className="text-gray-600 text-sm">How would you rate this service?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ratingOptions.map((option) => {
              const colors = colorFor(option);
              const selected = rating === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRating(option)}
                  className={`text-left w-full border rounded-lg p-4 transition ${colors.wrap} ${colors.hover} ${selected ? 'ring-2 ring-offset-2 ring-amber-400' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{option}</span>
                    <div className={`flex items-center gap-1 ${colors.icon}`}>
                      {Array.from({ length: starsFor(option) }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {option === 'Excellent' && 'Outstanding experience'}
                    {option === 'Good' && 'Very satisfied'}
                    {option === 'Fair' && 'Average / acceptable'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              className="flex-1"
              disabled={isSubmitting || !rating}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
