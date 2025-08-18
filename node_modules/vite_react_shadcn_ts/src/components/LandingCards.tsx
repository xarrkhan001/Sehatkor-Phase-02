import React from "react";
import {
  Video,
  Building2,
  Zap,
  Activity,
  FlaskRound,
  Pill,
  Hospital,
  HeartPulse
} from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor?: string;
}

const Card: React.FC<CardProps> = ({ title, description, icon, bgColor }) => {
  return (
    <div
      className={`flex flex-col items-start p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${bgColor || "bg-white"}`}
    >
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

const LandingCards: React.FC = () => {
  const cards = [
    {
      title: "Video Consultation",
      description: "PMC Verified Doctors",
      icon: <Video className="w-8 h-8" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "In-clinic Visit",
      description: "Book Appointment",
      icon: <Building2 className="w-8 h-8" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "Instant Doctor",
      description: "Get Instant Relief in a Click",
      icon: <Zap className="w-8 h-8" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Weight Loss Clinic",
      description: "Healthy Lifestyle",
      icon: <Activity className="w-8 h-8" />,
      bgColor: "bg-yellow-50",
    },
    {
      title: "Labs",
      description: "Medical Tests",
      icon: <FlaskRound className="w-8 h-8" />,
    },
    {
      title: "Medicines",
      description: "Order Online",
      icon: <Pill className="w-8 h-8" />,
    },
    {
      title: "Hospitals",
      description: "Find Nearby",
      icon: <Hospital className="w-8 h-8" />,
    },
    {
      title: "Surgeries",
      description: "Specialized Procedures",
      icon: <HeartPulse className="w-8 h-8" />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">How can we help you today?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
            bgColor={card.bgColor}
          />
        ))}
      </div>
    </section>
  );
};

export default LandingCards;
