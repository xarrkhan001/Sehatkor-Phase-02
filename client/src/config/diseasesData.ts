// Shared diseases data for selection and listing
// Export both hierarchical categories and a flattened unique list for multi-selects

export type DiseaseCategory = {
  name: string;
  items: string[];
};

// NOTE: Keep this in sync with AllDiseasesPage content.
// For now, we define a minimal subset; you can expand this list as needed.
export const diseaseCategories: DiseaseCategory[] = [
  {
    name: "Acupuncture",
    items: [
      "Different Forms Of Chronic Pain",
      "Head Aches Like Migraine",
      "Nausea",
      "Pain In Lumbar Region",
    ],
  },
  {
    name: "Anesthesiology",
    items: [
      "Anesthetist",
      "Critical Care And Pain Management",
      "Pain Specialist",
      "Neuropathic Pain",
      "Post Operative Pain",
    ],
  },
  {
    name: "Audiology",
    items: [
      "Audiologist",
      "Congenital/ Acquired Hearing Loss",
      "Hyperacusis",
      "Labyrinthitis",
      "Tinnitus",
    ],
  },
  {
    name: "Cardiology",
    items: [
      "Arrhythmia",
      "Coronary Artery Disease",
      "Heart Failure",
      "Hypertension",
      "Valvular Heart Disease",
    ],
  },
  {
    name: "Dermatology / Cosmetology",
    items: [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Fungal Skin Problems",
      "Vitiligo",
    ],
  },
  {
    name: "ENT",
    items: [
      "Deviated Nasal Septum (DNS)",
      "Ear Infection",
      "Severe Tonsillitis",
      "Nasal Polyps",
      "Sinusitis",
    ],
  },
  {
    name: "Eye",
    items: [
      "Weakening Of Eye Sight",
      "Eye Infection",
      "Cataract",
      "Glaucoma",
      "Uveitis",
    ],
  },
  {
    name: "Gastroenterology",
    items: [
      "Gastric Ulcer",
      "Gastritis",
      "Diarrhea",
      "Hepatitis",
      "Irritable Bowel Syndrome",
    ],
  },
];

export const DISEASE_OPTIONS: string[] = Array.from(
  new Set(
    diseaseCategories
      .flatMap((c) => c.items)
      .map((s) => s.trim())
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b));
