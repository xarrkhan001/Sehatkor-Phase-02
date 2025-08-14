import { type LucideIcon, Virus, Bug, Thermometer, Syringe, Droplet, Biohazard, Heart, Zap, Activity, Shield, AlertTriangle } from "lucide-react";

export type Disease = {
  slug: string;
  name: string;
  category: "Viral" | "Bacterial" | "Parasitic" | "Chronic" | "Other";
  icon: LucideIcon;
  colorClass: string; // tailwind text color class for icon
  bgClass: string; // background/gradient class for circle
  ringClass?: string; // optional ring color class
  description: string;
  symptoms: string[];
  causes: string[];
  prevention?: string[];
};

export const diseases: Disease[] = [
  {
    slug: "dengue",
    name: "Dengue",
    category: "Viral",
    icon: Zap,
    colorClass: "text-red-500",
    bgClass: "bg-gradient-to-br from-rose-50 to-rose-100",
    ringClass: "ring-rose-200",
    description:
      "Dengue is a mosquito-borne viral infection causing high fever, severe headache, pain behind the eyes, muscle and joint pains, and rash.",
    symptoms: [
      "High fever",
      "Severe headache",
      "Pain behind the eyes",
      "Joint and muscle pain",
      "Nausea and vomiting",
      "Skin rash"
    ],
    causes: [
      "Infection by dengue virus transmitted by Aedes mosquitoes",
      "Mosquito bites in stagnant water areas"
    ],
    prevention: [
      "Avoid mosquito bites",
      "Use insect repellent",
      "Remove standing water",
      "Wear long sleeves and pants"
    ]
  },
  {
    slug: "influenza",
    name: "Influenza (Flu)",
    category: "Viral",
    icon: Activity,
    colorClass: "text-blue-500",
    bgClass: "bg-gradient-to-br from-sky-50 to-sky-100",
    ringClass: "ring-sky-200",
    description:
      "Influenza is a contagious respiratory illness caused by influenza viruses, leading to fever, cough, sore throat, and body aches.",
    symptoms: ["Fever", "Cough", "Sore throat", "Runny or stuffy nose", "Body aches", "Fatigue"],
    causes: ["Influenza virus spread through droplets when people cough, sneeze, or talk"],
    prevention: ["Annual flu vaccination", "Hand hygiene", "Avoid close contact with sick people"]
  },
  {
    slug: "malaria",
    name: "Malaria",
    category: "Parasitic",
    icon: Shield,
    colorClass: "text-green-600",
    bgClass: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    ringClass: "ring-emerald-200",
    description:
      "Malaria is a life-threatening disease caused by parasites transmitted through the bites of infected Anopheles mosquitoes.",
    symptoms: ["Fever", "Chills", "Headache", "Nausea", "Vomiting", "Muscle pain"],
    causes: ["Plasmodium parasites transmitted via mosquito bite"],
    prevention: ["Use bed nets", "Insect repellents", "Indoor residual spraying"]
  },
  {
    slug: "covid-19",
    name: "COVID-19",
    category: "Viral",
    icon: AlertTriangle,
    colorClass: "text-rose-600",
    bgClass: "bg-gradient-to-br from-pink-50 to-pink-100",
    ringClass: "ring-pink-200",
    description:
      "COVID-19 is a respiratory illness caused by SARS-CoV-2, with symptoms ranging from mild to severe.",
    symptoms: ["Fever", "Dry cough", "Shortness of breath", "Loss of taste or smell", "Fatigue"],
    causes: ["SARS-CoV-2 virus transmitted via respiratory droplets and aerosols"],
    prevention: ["Vaccination", "Masking in crowded spaces", "Hand hygiene", "Ventilation"]
  },
  {
    slug: "hepatitis-a",
    name: "Hepatitis A",
    category: "Viral",
    icon: Droplet,
    colorClass: "text-amber-600",
    bgClass: "bg-gradient-to-br from-amber-50 to-yellow-100",
    ringClass: "ring-amber-200",
    description:
      "Hepatitis A is a liver infection caused by the hepatitis A virus, often spread through contaminated food or water.",
    symptoms: ["Fatigue", "Nausea", "Abdominal pain", "Loss of appetite", "Jaundice"],
    causes: ["Hepatitis A virus spread via fecal-oral route"],
    prevention: ["Vaccination", "Safe food and water", "Hand washing"]
  },
  {
    slug: "typhoid",
    name: "Typhoid Fever",
    category: "Bacterial",
    icon: Biohazard,
    colorClass: "text-orange-600",
    bgClass: "bg-gradient-to-br from-orange-50 to-orange-100",
    ringClass: "ring-orange-200",
    description:
      "Typhoid is a bacterial infection caused by Salmonella Typhi, leading to prolonged fever, weakness, stomach pain, and constipation or diarrhea.",
    symptoms: ["Prolonged fever", "Headache", "Weakness", "Stomach pain", "Diarrhea or constipation"],
    causes: ["Contaminated food or water with Salmonella Typhi"],
    prevention: ["Vaccination", "Safe drinking water", "Food hygiene"]
  },
  {
    slug: "diabetes",
    name: "Diabetes",
    category: "Chronic",
    icon: Syringe,
    colorClass: "text-purple-600",
    bgClass: "bg-gradient-to-br from-violet-50 to-violet-100",
    ringClass: "ring-violet-200",
    description:
      "Diabetes is a chronic condition affecting how the body turns food into energy, leading to high blood sugar levels.",
    symptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision", "Slow-healing sores"],
    causes: ["Insulin resistance or lack of insulin production"],
    prevention: ["Healthy diet", "Regular exercise", "Weight management"]
  },
  {
    slug: "hypertension",
    name: "Hypertension",
    category: "Chronic",
    icon: Heart,
    colorClass: "text-red-600",
    bgClass: "bg-gradient-to-br from-red-50 to-red-100",
    ringClass: "ring-red-200",
    description:
      "Hypertension (high blood pressure) increases the risk of heart disease, stroke, and other complications.",
    symptoms: ["Often asymptomatic", "Headaches", "Shortness of breath", "Nosebleeds (sometimes)"],
    causes: ["Genetics", "Unhealthy diet", "Physical inactivity", "Stress"],
    prevention: ["Low-salt diet", "Regular exercise", "Stress management"]
  }
];

export function getDiseaseBySlug(slug: string) {
  return diseases.find((d) => d.slug === slug);
}

export const popularDiseases = diseases.slice(0, 8);


