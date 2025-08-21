import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceType: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  serviceName: string;
}

type RatingOption = "Excellent" | "Very Good" | "Good";

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

  const handleSubmit = () => {
    if (!rating) {
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
    
    socket.emit("submit_rating", { serviceId, serviceType, rating }, (response: { success: boolean; error?: string }) => {
      setIsSubmitting(false);
      if (response.success) {
        toast({
          title: "Rating Submitted",
          description: "Thank you for your feedback!",
        });
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

  const ratingOptions: RatingOption[] = ["Excellent", "Very Good", "Good"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Service</DialogTitle>
          <DialogDescription>
            Share your experience and help others make informed decisions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{serviceName}</h3>
            <p className="text-gray-600 text-sm">How would you rate this service?</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {ratingOptions.map((option) => (
              <Button
                key={option}
                variant={rating === option ? "default" : "outline"}
                onClick={() => setRating(option)}
                className="w-full"
              >
                {option}
              </Button>
            ))}
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
              onClick={handleSubmit}
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
