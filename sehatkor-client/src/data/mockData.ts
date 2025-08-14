export interface Service {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  homeService: boolean;
  image: string;
  description: string;
  provider: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Patient" | "Doctor" | "Clinic" | "Lab" | "Pharmacy";
  isVerified: boolean;
}

export const mockServices: Service[] = [
  {
    id: "1",
    name: "General Checkup",
    price: 1500,
    rating: 4.8,
    location: "Karachi",
    type: "Treatment",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Comprehensive health checkup with experienced doctors",
    provider: "City Hospital"
  },
  {
    id: "2",
    name: "Blood Test Complete",
    price: 800,
    rating: 4.9,
    location: "Lahore",
    type: "Test",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Complete blood count and chemistry panel",
    provider: "Excel Labs"
  },
  {
    id: "3",
    name: "Dental Cleaning",
    price: 2000,
    rating: 4.7,
    location: "Islamabad",
    type: "Treatment",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Professional teeth cleaning and oral examination",
    provider: "Smile Dental Clinic"
  },
  {
    id: "4",
    name: "Paracetamol 500mg",
    price: 50,
    rating: 4.5,
    location: "Karachi",
    type: "Medicine",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Pain relief and fever reducer medication",
    provider: "HealthPlus Pharmacy"
  },
  {
    id: "5",
    name: "Cataract Surgery",
    price: 45000,
    rating: 4.9,
    location: "Lahore",
    type: "Surgery",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Advanced cataract removal with IOL implantation",
    provider: "Vision Eye Hospital"
  },
  {
    id: "6",
    name: "X-Ray Chest",
    price: 1200,
    rating: 4.6,
    location: "Islamabad",
    type: "Test",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Digital chest X-ray imaging",
    provider: "Advanced Imaging Center"
  },
  // New Doctor services
  {
    id: "7",
    name: "Cardiology Consultation",
    price: 2500,
    rating: 4.9,
    location: "Lahore",
    type: "Treatment",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Consultation with experienced cardiologist for heart health.",
    provider: "Heart Care Clinic"
  },
  {
    id: "8",
    name: "Pediatric Checkup",
    price: 1800,
    rating: 4.8,
    location: "Karachi",
    type: "Treatment",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Routine health checkup for children by pediatric specialist.",
    provider: "Children's Hospital"
  },
  // New Hospital services
  {
    id: "9",
    name: "Emergency Care",
    price: 5000,
    rating: 4.7,
    location: "Islamabad",
    type: "Treatment",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "24/7 emergency care for all medical conditions.",
    provider: "Capital City Hospital"
  },
  {
    id: "10",
    name: "Orthopedic Surgery",
    price: 60000,
    rating: 4.8,
    location: "Lahore",
    type: "Surgery",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Advanced orthopedic surgery for bone and joint issues.",
    provider: "Punjab General Hospital"
  },
  // New Lab services
  {
    id: "11",
    name: "COVID-19 PCR Test",
    price: 2500,
    rating: 4.9,
    location: "Karachi",
    type: "Test",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Accurate COVID-19 PCR testing with quick results.",
    provider: "Reliable Labs"
  },
  {
    id: "12",
    name: "Liver Function Test",
    price: 1800,
    rating: 4.7,
    location: "Islamabad",
    type: "Test",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Comprehensive liver function analysis.",
    provider: "Excel Labs"
  },
  // New Pharmacy services
  {
    id: "13",
    name: "Ibuprofen 400mg",
    price: 80,
    rating: 4.6,
    location: "Lahore",
    type: "Medicine",
    homeService: true,
    image: "/api/placeholder/300/200",
    description: "Pain relief and anti-inflammatory medication.",
    provider: "City Pharmacy"
  },
  {
    id: "14",
    name: "Insulin Injection",
    price: 1200,
    rating: 4.8,
    location: "Karachi",
    type: "Medicine",
    homeService: false,
    image: "/api/placeholder/300/200",
    description: "Insulin for diabetes management, available at pharmacy.",
    provider: "HealthPlus Pharmacy"
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Tips for Maintaining Good Health",
    excerpt: "Discover essential tips for maintaining optimal health and wellness in your daily life.",
    image: "/api/placeholder/400/250",
    author: "Dr. Ahmed Ali",
    date: "2024-01-15",
    category: "Health Tips"
  },
  {
    id: "2",
    title: "Understanding Diabetes Management",
    excerpt: "A comprehensive guide to managing diabetes effectively with diet, exercise, and medication.",
    image: "/api/placeholder/400/250",
    author: "Dr. Fatima Khan",
    date: "2024-01-12",
    category: "Medical"
  },
  {
    id: "3",
    title: "Mental Health Awareness in Pakistan",
    excerpt: "Breaking the stigma around mental health and promoting awareness in Pakistani society.",
    image: "/api/placeholder/400/250",
    author: "Dr. Hassan Sheikh",
    date: "2024-01-10",
    category: "Mental Health"
  },
  {
    id: "4",
    title: "Vaccination Schedule for Children",
    excerpt: "Complete vaccination schedule and important immunizations for Pakistani children.",
    image: "/api/placeholder/400/250",
    author: "Dr. Ayesha Malik",
    date: "2024-01-08",
    category: "Pediatrics"
  }
];

export const mockBookings = [
  {
    id: "1",
    serviceName: "General Checkup",
    provider: "City Hospital",
    date: "2024-01-20",
    time: "10:00 AM",
    status: "Confirmed",
    amount: 1500
  },
  {
    id: "2",
    serviceName: "Blood Test Complete",
    provider: "Excel Labs",
    date: "2024-01-18",
    time: "9:00 AM",
    status: "Completed",
    amount: 800
  }
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Dr. Sarah Ahmed",
    email: "sarah@example.com",
    phone: "+923001234567",
    role: "Doctor",
    isVerified: false
  },
  {
    id: "2",
    name: "HealthPlus Pharmacy",
    email: "info@healthplus.com",
    phone: "+923009876543",
    role: "Pharmacy",
    isVerified: true
  },
  {
    id: "3",
    name: "Excel Labs",
    email: "contact@excellabs.com",
    phone: "+923005555555",
    role: "Lab",
    isVerified: false
  }
];

// Add a helper to generate unique ids for new users
export function generateUserId() {
  return Math.random().toString(36).substr(2, 9);
}