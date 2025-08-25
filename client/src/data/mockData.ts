export interface Service {
  id: string;
  _id?: string;
  name: string;
  price: number;
  rating: number;
  ratingBadge?: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  homeService: boolean;
  image: string;
  description: string;
  provider: string;
  providerType?: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
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
    title: "Pakistan میں ڈیجیٹل ہیلتھ کیئر کا مستقبل",
    excerpt: "جانیں کہ کیسے ڈیجیٹل ٹیکنالوجی پاکستان میں صحت کی سہولات کو بہتر بنا رہی ہے اور مریضوں کو گھر بیٹھے علاج فراہم کر رہی ہے۔",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop",
    author: "Dr. Ahmed Ali",
    date: "2024-01-15",
    category: "Health Tips"
  },
  {
    id: "2",
    title: "شوگر کی بیماری: علامات، علاج اور احتیاط",
    excerpt: "ذیابیطس کی تشخیص، علاج اور روزمرہ زندگی میں احتیاطی تدابیر کے بارے میں تفصیلی معلومات۔ صحیح خوراک اور ورزش کی اہمیت۔",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
    author: "Dr. Fatima Khan",
    date: "2024-01-12",
    category: "Medical"
  },
  {
    id: "3",
    title: "دماغی صحت: پاکستانی معاشرے میں آگاہی",
    excerpt: "ذہنی صحت کے مسائل کو سمجھنا اور ان سے نمٹنے کے طریقے۔ ڈپریشن، اضطراب اور تناؤ کا علاج۔",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop",
    author: "Dr. Hassan Sheikh",
    date: "2024-01-10",
    category: "Mental Health"
  },
  {
    id: "4",
    title: "بچوں کی ویکسینیشن: مکمل شیڈول اور احتیاط",
    excerpt: "پاکستانی بچوں کے لیے ضروری ٹیکوں کا شیڈول اور ان کی اہمیت۔ محفوظ اور مؤثر ویکسینیشن کے فوائد۔",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&h=250&fit=crop",
    author: "Dr. Ayesha Malik",
    date: "2024-01-08",
    category: "Pediatrics"
  },
  {
    id: "5",
    title: "رمضان میں صحت مند روزہ: طبی رہنمائی",
    excerpt: "روزے کے دوران صحت کا خیال رکھنے کے طریقے، سحری اور افطاری کی بہترین خوراک، اور مریضوں کے لیے خصوصی ہدایات۔",
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=250&fit=crop",
    author: "Dr. Muhammad Usman",
    date: "2024-01-05",
    category: "Nutrition"
  },
  {
    id: "6",
    title: "خواتین کی صحت: خصوصی احتیاط اور بچاؤ",
    excerpt: "خواتین کے لیے خصوصی صحت کے مسائل، حمل کی دیکھ بھال، اور مختلف عمر میں ضروری طبی جانچ پڑتال۔",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop",
    author: "Dr. Sana Rashid",
    date: "2024-01-03",
    category: "Health Tips"
  },
  {
    id: "7",
    title: "دل کی بیماریوں سے بچاؤ: جدید علاج",
    excerpt: "دل کی صحت کے لیے ضروری احتیاط، کولیسٹرول کنٹرول، بلڈ پریشر کا انتظام، اور جدید کارڈیک ٹریٹمنٹ۔",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=250&fit=crop",
    author: "Dr. Tariq Mahmood",
    date: "2024-01-01",
    category: "Medical"
  },
  {
    id: "8",
    title: "بزرگوں کی صحت: خصوصی دیکھ بھال",
    excerpt: "بڑھتی عمر میں صحت کے مسائل، ہڈیوں کی کمزوری، یادداشت کی حفاظت، اور گھریلو نگہداشت کے طریقے۔",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop",
    author: "Dr. Rubina Shah",
    date: "2023-12-28",
    category: "Health Tips"
  },
  {
    id: "9",
    title: "موسمی بیماریوں سے بچاؤ اور علاج",
    excerpt: "مختلف موسموں میں عام بیماریاں، فلو، نزلہ زکام، ڈینگی، اور ملیریا سے بچاؤ کے طریقے۔",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=250&fit=crop",
    author: "Dr. Imran Ali",
    date: "2023-12-25",
    category: "Medical"
  },
  {
    id: "10",
    title: "صحت مند غذا: پاکستانی کھانوں میں توازن",
    excerpt: "روایتی پاکستانی کھانوں میں غذائی توازن، صحت مند کھانا پکانے کے طریقے، اور موٹاپے سے بچاؤ۔",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop",
    author: "Dr. Nadia Qureshi",
    date: "2023-12-22",
    category: "Nutrition"
  },
  {
    id: "11",
    title: "آنکھوں کی حفاظت: جدید دور کے چیلنجز",
    excerpt: "موبائل اور کمپیوٹر کے استعمال سے آنکھوں پر اثرات، آنکھوں کی بیماریوں سے بچاؤ، اور بہترین علاج۔",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop",
    author: "Dr. Kamran Hussain",
    date: "2023-12-20",
    category: "Health Tips"
  },
  {
    id: "12",
    title: "کینسر سے بچاؤ: ابتدائی تشخیص کی اہمیت",
    excerpt: "مختلف قسم کے کینسر کی علامات، ابتدائی تشخیص کے فوائد، اور جدید علاج کے طریقے۔",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop",
    author: "Dr. Saima Akhtar",
    date: "2023-12-18",
    category: "Medical"
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