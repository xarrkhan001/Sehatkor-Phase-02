import { Link } from "react-router-dom";
import { useEffect } from "react";

// Define the disease categories and their items
const diseaseCategories = [
  {
    name: "Acupuncture",
    items: [
      "Different Forms Of Chronic Pain",
      "Head Aches Like Migrane",
      "Nausea",
      "Pain In Lumber Region",
      "Head Aches Like Migraine",
      "Pain In Lumbar Region"
    ]
  },
  {
    name: "Anesthesiology",
    items: [
      "Anesthetist",
      "Critical Care And Pain Management",
      "Pain Specialist",
      "End-Stage Diseases",
      "Neuropathic Pain",
      "Post Operative Pain",
      "Cardiothoracic Anesthetist",
      "Anesthesia For Cardio-Thoracic Surgeries"
    ]
  },
  {
    name: "Audiology",
    items: [
      "Audiologist",
      "Autoimmune Inner Ear Disease (Aied)",
      "Cogan's Syndrome",
      "Congenital Aural Atresia & Microtia",
      "Congenital/ Acquired Hearing Loss",
      "Glomus Tumors In The Ear.",
      "Hyperacusis",
      "Labyrinthitis",
      "Misophonia",
      "Noise Induced Hearing Loss",
      "Otosclerosis",
      "Severe Ear Barotrauma",
      "Tinnitus"
    ]
  },
  {
    name: "Cardiology",
    items: [
      "Cardiac Surgeon",
      "Congenital Heart Diseases",
      "Arrhythmia",
      "Arteriosclerosis",
      "Coronary Artery Disease",
      "Heart Block",
      "Heart Valve Disease",
      "Myocardial Infarction",
      "Myxomas",
      "Valve Stenoses & Regurgitation"
    ]
  },
  {
    name: "Dentistry",
    items: [
      "Cavities",
      "Tooth Sensitivity",
      "Tooth Decay",
      "Gingivitis",
      "Cross Bites",
      "Impacted Teeth",
      "Missing Teeth Requiring Implants",
      "Oral Hygiene",
      "Retained Baby Teeth",
      "Smelly Mouth",
      "Extraction Of Diseased / Impacted Teeth",
      "Malocclusion",
      "Temporomandibular Joint Disorders",
      "Crooked Teeth Due To Small Jaw",
      "Excessive Over-Jet",
      "Mis-Aligned Jaw",
      "Open-Bites",
      "Over-Bite",
      "Over-Developed Jaw",
      "Spaces Between Teeth",
      "Under-Bite",
      "Under-Developed Jaw",
      "Under-Jet"
    ]
  },
  {
    name: "Dermatology / Cosmetology",
    items: [
      "Vitiligo",
      "Massive Obesity",
      "Planter Wart",
      "Unaligned Jaw",
      "Wrinkles",
      "Gynecomastia",
      "Aging (Natural Or Accelerated)",
      "DNS",
      "Other Reconstructive Surgeries",
      "Scars From Injury",
      "Third-Degree Burns",
      "Acne",
      "Cellulitis",
      "Psoriasis",
      "Eczema",
      "Fungal Nail Infection",
      "Fungal Skin Problems",
      "Lichen Planus",
      "Shingles",
      "Tinea Versicolor",
      "Warts",
      "Seborrheic Eczema",
      "Keloid",
      "Dandruff",
      "Skin Cancer",
      "Dyshidrotic Eczema",
      "Ingrown Nails",
      "Rosacea",
      "Dermatomyositis",
      "Molluscum Contagiosum",
      "Hemangioma Of Skin",
      "Carbuncle",
      "Cutaneous Candidiasis",
      "Pimples",
      "Ichthyosis Vulgaris",
      "Acrodermatitis",
      "Melasma",
      "Herpes Stomatitis",
      "Hives",
      "Actinic Keratosis",
      "Impetigo",
      "Alopecia",
      "Blister",
      "Body Lice",
      "Erysipelas",
      "Hypohidrosis",
      "Lupus",
      "Moles",
      "Necrotizing Fasciitis",
      "Pemphigoid",
      "Rubeola",
      "Seborrheic Dermatitis And Crib Cap",
      "Seborrheic Keratosis",
      "Sunstroke"
    ]
  },
  {
    name: "Dietetics",
    items: [
      "Atherosclerosis",
      "Bipolar Disorder",
      "Celiac Disease",
      "Crohn's Disease",
      "Gall Stones",
      "Grave's Disease",
      "High Grade Obesity",
      "Kidney Stones",
      "Metabolic Resistance",
      "Metabolic Syndrome",
      "Neuropathy",
      "Pakinson's Disease",
      "Parkinson's Disease",
      "Poor Performance In Bed",
      "Sleep Disorders",
      "Stomach Ulcers",
      "Stunted Growth"
    ]
  },
  {
    name: "Endocrinology",
    items: [
      "Diabetes",
      "Endocrine Disorders",
      "Thyroid Gland Diseases",
      "Growth Disorders",
      "Endocrine Cancers",
      "Hormonal Imbalances",
      "Hormone Deficiencies/Imbalance",
      "Pancreatitis",
      "Parathyroid Gland Diseases",
      "Pituitary Gland Disorders",
      "Hypothyroidism",
      "Goiter"
    ]
  },
  {
    name: "ENT (Ear, Nose, and Throat)",
    items: [
      "Deviated Nasal Septum (DNS)",
      "Diphtheria",
      "Dysphagia",
      "Ear Infection",
      "Epistaxis",
      "Follicular Adenoma",
      "Hyperthyroidism",
      "Influenza",
      "Laryngeal Stenosis",
      "Nasal Polyps",
      "Nasal Valve Collapse",
      "Neoplasms In Arotid/Submandibular Glands",
      "Ruptured Ear Drum",
      "Severe Ear Infection",
      "Severe Tonsillitis",
      "Sore Throat",
      "Thyroid Cancer"
    ]
  },
  {
    name: "Eye Care",
    items: [
      "Weakening Of Eye Sight",
      "Eye Swelling",
      "Eye Infection",
      "Cataract",
      "Squint",
      "Keratoconus",
      "Chalazion",
      "Conjunctivitis",
      "Diplopia",
      "Foreign Body In The Eyes",
      "Glaucoma",
      "Long-Sightedness",
      "Nystagmus",
      "Proptosis",
      "Retinopathies",
      "Short-Sightedness",
      "Uveitis",
      "Eye Problem",
      "Eye Strain"
    ]
  },
  {
    name: "Gastroenterology",
    items: [
      "Gastric Ulcer",
      "Gastritis",
      "Diarrhea",
      "Mouth Ulcers",
      "Acidity",
      "Heartburn",
      "Dysentry",
      "Abdominal Pain",
      "Bloating",
      "Constipation",
      "Flatulence",
      "Helicobacter Pylori Infection",
      "Hepatitis",
      "Inflammatory Bowel Disease",
      "Irritable Bowel Syndrome",
      "Lactose Intolerance",
      "Nausea",
      "Ulcer"
    ]
  },
  {
    name: "General Medicine",
    items: [
      "Typhoid Fever",
      "Meningitis",
      "Pneumonia",
      "Bukhar",
      "Chicken Pox",
      "Asthma",
      "Blood Pressure",
      "Syphilis",
      "Hantavirus Pulmonary Syndrome",
      "Jaundice",
      "Dengue Fever",
      "Malaria",
      "Food Poisoning",
      "Tetanus",
      "AIDS",
      "Headache",
      "Cholera",
      "Cold Sore",
      "Canker Sore",
      "Hypertension",
      "Hepatitis B And C",
      "Anemia",
      "Allergies",
      "Heat Stroke",
      "Rabies",
      "Whooping Cough",
      "Cough",
      "Infectious Diseases",
      "Yellow Fever",
      "Burns",
      "Vitamin D Deficiency",
      "Hiccups",
      "Flu",
      "Plague",
      "Diabetes Endocrine Diseases",
      "Babesiosis",
      "Bacillus Anthracis",
      "Blastomycosis",
      "Botulism",
      "Buries",
      "Bursitis",
      "Chikungunya",
      "Cold",
      "Coronavirus",
      "Creutzfeldt-Jakob Disease",
      "Fever",
      "Hypotension",
      "Hypothyroidism",
      "Illdefined Intestinal Infection",
      "Influenza",
      "Measles",
      "Myalgia",
      "Norovirus",
      "Pleurisy",
      "Sleep Disturbances",
      "Small Pox"
    ]
  },
  {
    name: "General Surgery",
    items: [
      "Piles",
      "Hernia",
      "Appendicitis",
      "Pilonidal Cyst",
      "Intestinal Obstruction",
      "Accidental Injuries",
      "Anal Fissure/Fistula",
      "Gall Stones",
      "Heart Diseases",
      "Ingrown Toe Nail",
      "Lipomas/ Sebaceous Cyst/Ganglion",
      "Pancreatic Cyst"
    ]
  },
  {
    name: "Internal Medicine",
    items: [
      "Hepatitis B And C",
      "Asthma",
      "Cerebrovascular Accidents",
      "Chronic Kidney Diseases",
      "Chronic Liver Disease",
      "Chronic Obstructive Pulmonary Disorder",
      "Coronary Artery Disease",
      "Diabetes",
      "Gastric Ulcers",
      "Hepatitis",
      "Hypertension",
      "Inflammatory Bowel Disease",
      "Ischemic Heart Disease",
      "Meningitis",
      "Upper Gi Bleed"
    ]
  },
  {
    name: "Vascular Surgery",
    items: [
      "Acute Venous Thrombosis",
      "Aortic Aneurysm (Abdominal, Thoracic)",
      "Carotid Artery Disease",
      "Cerebro Vascular Accidents",
      "Coronary Artery Disease",
      "Frostbite",
      "Gangrenous Limbs",
      "Major Blood Vessel Severed",
      "Thrombotic Vessels",
      "Varicose Veins"
    ]
  },
  {
    name: "Laparoscopic Surgery",
    items: [
      "Whipple For Pancreatic Cancer",
      "Appendicitis",
      "Bowel Cancer",
      "Cholelithiasis",
      "Gastric Cancer",
      "Hernia",
      "Pancreatic Cancer"
    ]
  },
  {
    name: "Infectious Diseases",
    items: [
      "Anthrax",
      "Chickenpox",
      "Congo Virus",
      "Diphtheria",
      "E. Coli Infections",
      "Ebola Virus",
      "Measles And Mumps",
      "Severe Influenza",
      "Tetanus",
      "Tuberculosis",
      "Variants Of Covid Infections"
    ]
  },
  {
    name: "Rehabilitation Medicine",
    items: [
      "Gangrenous/Diabetic Leg/Foot"
    ]
  },
  {
    name: "Diabetology",
    items: [
      "Diabetes Type 1",
      "Diabetes Type 1 & 2",
      "Diabetic Foot Syndrome",
      "Diabetic Polyneuropathy",
      "Gestational Diabetes Mellitus",
      "Hypoglycemia"
    ]
  },
  {
    name: "Kidney Transplant",
    items: [
      "Renal Trauma (Blunt Or Penetrating)"
    ]
  },
  {
    name: "Liver Transplant",
    items: [
      "Hepatocellular Carcinoma"
    ]
  },
  {
    name: "Bariatric / Weight Loss Surgery",
    items: [
      "Food Obesity",
      "Inactivity Obesity"
    ]
  },
  {
    name: "Vaccine Specialization",
    items: [
      "Bacterial Infections",
      "Effects Of Immunosuppressive Drugs",
      "Fungal Infections",
      "Low Immunity",
      "Viral Infections"
    ]
  },
  {
    name: "Genetics",
    items: [
      "Cystic Fibrosis",
      "Down's Syndrome/Asperger's Syndrome",
      "Early Onset Diabetes",
      "Genetic Haemophilia",
      "Genetic Hemophilia",
      "Red Green Color Blindness",
      "Sickle-Cell Anemia",
      "Thalassemia",
      "Turner's Syndrome/Klinefelter Syndrome"
    ]
  },
  {
    name: "Gynecology",
    items: [
      "Abortion",
      "Antenatal And Postnatal Care",
      "Gestational Diabetes",
      "Infertility",
      "Intra Uterine Death",
      "Placenta Previa",
      "Postpartum Hemorrhage",
      "Preeclampsia",
      "Premature Labor",
      "Subchorionic Bleeding",
      "Vaginal Discharge",
      "Endometriosis",
      "Fibroids",
      "Genital Warts",
      "Gynecomastia",
      "Sexually Transmitted Disease",
      "Adenomyosis",
      "Uterine Prolapse",
      "Hormone Disorder",
      "Abnormal Uterine Bleeding",
      "Vaginitis",
      "Ovarian Cysts",
      "Amenorrhea",
      "Premenstrual Dysphoric Disorder",
      "Endometrial Hyperplasia",
      "Vulvodynia",
      "Ectopic Pregnancy",
      "Polycystic Ovary Syndrome",
      "Bacterial Vaginosis",
      "Cervicitis",
      "Dysmenorrhea",
      "Dysplasia",
      "Endometritis",
      "Female Infertility",
      "Genital Herpes",
      "Gynecological Malignancies",
      "Interstitial Cystitis",
      "Menopause",
      "Menorrhagia",
      "Menstrual Cramps",
      "Ovarian Polyps",
      "Ovarian Tumors",
      "Postpartum Complications",
      "Pregnancy",
      "Salpingitis",
      "Vaginal Infection",
      "Vulvitis"
    ]
  },
  {
    name: "Hematology",
    items: [
      "Leukemia",
      "Anemia",
      "Antiphospholipid Antibody Syndrome",
      "Blood Cancer",
      "Blood Clot",
      "Disseminated Intravascular Coagulation",
      "DVT",
      "Hemophilia",
      "Hodgkins Lymphoma",
      "Immune Thrombocytopenia",
      "Irritable Bowel Syndrome",
      "Multiple Types Of Congenital Anemia",
      "Myeloma",
      "Non-Hodgkins Lymphoma",
      "Sickle Cell Disease",
      "Thalassemia",
      "Thrombosis",
      "Thrombotic Thrombocytopenic Purpura",
      "Aplastic Anemia",
      "Hodgkin Lymphoma",
      "Myeloproliferative Disorder",
      "Non-Hodgkin Lymphoma"
    ]
  },
  {
    name: "Hepatology",
    items: [
      "Hepatitis",
      "Cirrhosis",
      "Gall Bladder Cancer",
      "Hepatobiliary Liver Cancer",
      "Hepatitis B And C",
      "Chronic Liver Disease",
      "Acute Hepatitis",
      "Alcohol Hepatitis",
      "Autoimmune Hepatitis",
      "Hepatic Encephalopathy",
      "Hepatitis B",
      "Liver Cancer"
    ]
  },
  {
    name: "Hijama Therapy",
    items: [
      "Chronic Pain",
      "Delusions Of Pain, Grandeur Etc.",
      "Demonic Possession",
      "Hypertension",
      "Loss Of Speech",
      "Ocd",
      "Paranoia Or A Similar State",
      "Perpetual Drowsiness",
      "Persistent Fever",
      "Possibility Of WitchCraft",
      "Pressured Speech"
    ]
  },
  {
    name: "Homeopathy",
    items: [
      "Asthma",
      "Burning Feet Syndrome",
      "Depression And Anxiety",
      "Diabetes",
      "Ear Infections",
      "High Blood Pressure",
      "Impotence",
      "Urinary Tract Infections (UTIs)"
    ]
  },
  {
    name: "Immunology",
    items: [
      "Bronchial Asthma",
      "Food Allergies",
      "Insect Allergies",
      "Pet Allergies",
      "Seasonal Allergies",
      "Aids Acquired Later In Life",
      "Aids Passed From The Mother To The Child",
      "Congenital Neutropenia Syndromes",
      "Hyper Immunoglobulin M Syndromes",
      "Hypersensitivity Reactions",
      "Inflammation"
    ]
  },
  {
    name: "Nephrology",
    items: [
      "Bed-Wetting",
      "Hydronephrosis",
      "Infantile Polycystic Kidney Disease",
      "Overflow Incontinence",
      "Puj Stricture",
      "Ureteric Stricture/Obstruction",
      "UTIs",
      "Wilm's Tumor",
      "Kidney Infection",
      "Chronic Kidney Disease",
      "Complications Related To Dialysis",
      "Kidney Failure",
      "High Blood Pressure",
      "Glomerulonephritis",
      "Hydronephrosis",
      "Nephritis"
    ]
  },
  {
    name: "Neurology",
    items: [
      "Occipital Neuralgia",
      "Brain Abscess",
      "Brain Haemorrhage",
      "Brain Tumor",
      "Cerebrovascular Accidents",
      "Craniopharyngiomas",
      "Disc Slip",
      "Space Occupying Lesions",
      "Traumatic Lesions",
      "Migraine",
      "Facial Palsy",
      "Paralysis",
      "Epilepsy",
      "Alzheimers Disease",
      "Parkinson",
      "Headache",
      "Cerebral Palsy",
      "Bells Palsy",
      "Multiple Sclerosis",
      "Neuromuscular Diseases",
      "Seizures",
      "Fits",
      "Apraxia",
      "Bacterial Meningitis",
      "Cluster Headache",
      "Meningitis",
      "Neurodegenerative Diseases",
      "Neuropathic Pains",
      "Sciatica",
      "Seizure",
      "Trigeminal Neuralgia",
      "West Nile Encephalitis",
      "Alzheimer's Disease",
      "Amyotrophic Lateral Sclerosis (Als)",
      "Autism",
      "Concussion",
      "Mood Disorders",
      "Schizophrenia",
      "Sleep Disorders",
      "Stroke"
    ]
  },
  {
    name: "Oncology",
    items: [
      "Bladder Cancer",
      "Cervical Cancer",
      "Kidney Cancer",
      "Penile Cancers",
      "Prostatic Carcinoma",
      "Testis Cancer",
      "Ureteric Cancer",
      "Breast Cancer",
      "Prostate Cancer",
      "Colorectal Cancer",
      "Liver Cancer",
      "Ovarian Cancer",
      "Uterine Cancer",
      "Anal Cancer",
      "Hodgkin Lymphoma",
      "Oral Cavity Cancer",
      "Carcinoid Tumor",
      "Lung Cancer",
      "Lymphoma",
      "Pheochromocytoma",
      "Pituitary Tumor",
      "Sarcoma",
      "Ewing Sarcoma",
      "Vulvar Cancer",
      "Astrocytomas",
      "Basal Cell Carcinoma",
      "Bladder Cancer",
      "Bronchial Adenoma",
      "Burkitt Lymphoma",
      "Cholangiocarcinoma",
      "Chordoma",
      "Chronic Lymphocytic Leukemia",
      "Chronic Myeloid Leukemia",
      "Colon Cancer",
      "Craniopharyngioma",
      "Embryonal Tumors",
      "Esophageal Cancer",
      "Extracranial",
      "Extracranial Tumors",
      "Extragonadal",
      "Extragonadal Cancer",
      "Gallbladder Cancer",
      "Gastric Cancer",
      "Gastrointestinal Stromal Tumors",
      "Germ Cell Tumors",
      "Gestational Trophoblastic Disease",
      "Gliomas",
      "Hairy Cell Leukemia",
      "Head And Neck Tumors",
      "Heart Tumors",
      "Hypopharyngeal Cancer",
      "Intraocular Melanoma",
      "Kaposi Sarcoma",
      "Lymphomas",
      "Melanoma And Other Skin Cancers",
      "Mesothelioma",
      "Multiple Myeloma",
      "Mycosis Fungoides",
      "Myelodysplasia",
      "Neuroblastoma",
      "Osteosarcoma",
      "Pancreatic Cancer",
      "Paraganglioma",
      "Parathyroid Cancer",
      "Pharyngeal Cancer",
      "Pleural Cancer",
      "Post Chemotherapy Disorders",
      "Primary Cns Lymphoma",
      "Rectal Cancer",
      "Renal Cancer Kidney Cancer",
      "Retinoblastoma",
      "Rhabdoid Tumor",
      "Rhabdomyosarcoma",
      "Thyroid Cancer",
      "Urethral Cancer",
      "Uterine Sarcoma",
      "Vaginal Cancer",
      "Wilms Tumor",
      "Bowel Cancer",
      "Brain Tumors",
      "Leukemia",
      "Skin Cancer"
    ]
  },
  {
    name: "Orthopedics",
    items: [
      "Plantar Fasciitis",
      "Bone Fracture",
      "Disc Degeneration",
      "Arthritis And Other Kinds Of Joint Pains",
      "Bone Cell Tumors",
      "Cartilaginous Tumors",
      "Dislocated Joints",
      "Disproportionate Limbs",
      "Knee Deformities",
      "Muscle And Tendon Tears",
      "Osteoarthritis",
      "Osteoporosis",
      "Sprains And Strains",
      "Cervicogenic Pain",
      "Leg Length Discrepancy",
      "Muscular Spasms",
      "Sciatica",
      "Whiplash Injury",
      "Birth Defects (Eg Missing Limbs)",
      "Compromised Locomotive Ability.",
      "Damaged Limbs Or Joints",
      "Severed Limbs",
      "Degenerative Disc Diseases",
      "Kyphosis",
      "Severe Neck Pain",
      "Spinal Cord Compression",
      "Spinal Deformities",
      "Vertebral Fractures",
      "Dislocated Vertebrae",
      "Scoliosis",
      "Slipped Disc"
    ]
  },
  {
    name: "Pediatrics",
    items: [
      "Mumps",
      "Hydrocephalus",
      "Acute Poliomyelitis",
      "Infectious Diseases",
      "Malnutrition",
      "Meningitis",
      "Mumps/Polio Etc.",
      "Pediatric Cancers",
      "Stunted Growth Disorders",
      "Appendicitis",
      "Bowel Cancer",
      "Brain Tumors",
      "Childhood Cancer",
      "Cyanotic/Acyanotic Heart Diseases",
      "Damaged Or Ruptured Viscera",
      "Different Benign Tumors",
      "Enteric Perforation",
      "Lap Assisted Operation For Hirschsprung Disease",
      "Juvenile Rheumatoid Arthritis",
      "Limb Deformities",
      "Pediatric Fractures",
      "Pediatric Hip Conditions",
      "Atrial Septal Defect",
      "Coarctation Of The Aorta",
      "Fontan Fenestration",
      "Tricuspid Atresia",
      "Ventricular Septal Defect",
      "Cerebral Palsy",
      "Erb's Palsy",
      "Hand Drop/Foot Drop",
      "Klumpke's Paralysis",
      "Meningitis (In Neonates)",
      "Poliomyelitis",
      "Hemophilia",
      "Kaposi Sarcoma",
      "Leukemia",
      "Multiple Types Of Congenital Anemia",
      "Neuroblastoma",
      "Retinoblastoma",
      "Rhabdomyosarcoma",
      "Sickle Cell Disease",
      "Thalassemia",
      "Birth Defects",
      "Birth Trauma",
      "Cyanotic Heart Disease",
      "Low Birth Weight",
      "Neonatal Infections",
      "Neonatal Jaundice",
      "Bedwetting",
      "Dysuria",
      "Hematuria",
      "Incontinence",
      "Nephrolithiasis/Urolithiasis",
      "Strictures",
      "UTIs",
      "Vesicoureteral Reflux",
      "Hyper/Hypo-Thyroidism",
      "Rickets"
    ]
  },
  {
    name: "Physiotherapy",
    items: [
      "Lymphoedema",
      "Spondylosis",
      "Avulsion Fracture",
      "Back And Neck Pain",
      "Chronic Pain",
      "Fallen Arches",
      "Frozen Shoulder",
      "Hip Pain",
      "Meniscal Injuries",
      "Musculoskeletal Disorders",
      "Perthes Disease"
    ]
  },
  {
    name: "Occupational Therapy",
    items: [
      "Allergic Reactions",
      "Anthracosis",
      "Bladder Cancer",
      "Carbon-Monoxide Poisoning",
      "Conjunctivitis",
      "Lung Cancer",
      "Occupational Accidents",
      "Occupational Hearing And Vision Loss.",
      "Pneumoconiosis",
      "Radiation Poisoning",
      "Skin Cancer"
    ]
  },
  {
    name: "Psychiatry",
    items: [
      "Bipolar Disorder",
      "Anxiety Disorder",
      "Mood Disorders",
      "Depression",
      "Obsessive Compulsive Disorder",
      "Attention Deficit Hyperactivity Disorder (Adhd)",
      "Insomnia",
      "Epilepsy",
      "Hallucinations",
      "Psychoses (Schizophrenia Etc.)",
      "Schizo-Effective Disorder",
      "Somatoform Disorders",
      "Anxiety Disorders",
      "Clinical Depression"
    ]
  },
  {
    name: "Psychology",
    items: [
      "Anti-Social Personality Disorder",
      "Panic Disorder",
      "Anxiety Disorder",
      "Stress Disorder",
      "Agoraphobia",
      "Conversion Disorder",
      "Anorexia",
      "Bulimia Nervosa",
      "Dementia",
      "Drug Abuse",
      "Psychoses (Schizophrenia Etc.)",
      "Stress Disorders"
    ]
  },
  {
    name: "Counseling",
    items: [
      "Emotional Distress",
      "Lack Of Motivation And Procrastination.",
      "Loneliness And Trauma",
      "Poor Mental Health In General.",
      "Poor Self-Esteem.",
      "Poor Stress And Time Management"
    ]
  },
  {
    name: "Pulmonology",
    items: [
      "Bronchitis",
      "Tuberculosis",
      "Spinal Tuberculosis",
      "Chronic Obstructive Pulmonary",
      "Asbestosis",
      "Bird Flu",
      "Bronchiectasis",
      "Bronchiolitis",
      "Chronic Obstructive Pulmonary Disorder",
      "Copd",
      "Emphysema",
      "Hypoxia",
      "Idiopathic Pulmonary Fibrosis",
      "Interstitial Fibrosis",
      "Interstitial Lung Disease",
      "Lung Cancers",
      "Obesity-Related Lung Disease",
      "Occupational Lung Diseases",
      "Pneumonia",
      "Pulmonary Function Disease",
      "Pulmonary Oedema",
      "Lung Cancer",
      "Pleural Effusion",
      "Pneumothorax",
      "Pulmonary Injuries",
      "Severe Pneumonia"
    ]
  },
  {
    name: "Radiology",
    items: [
      "Hirschprung's Disease",
      "Patent Foramen Ovale",
      "Unusual Lump(S) (May Be A Tumor)",
      "Alzheimer's Disease",
      "Appendicitis",
      "Bone Fractures",
      "Certain Cardiac Diseases",
      "Cholelithiasis",
      "Cirrhosis",
      "Concussion",
      "Cortical Thrombosis",
      "Cysts",
      "Deep Venous Thrombosis",
      "Dementia",
      "Epilepsy",
      "Lymphomas",
      "Renal Stones",
      "Ruptured Organs/ Internal Bleeding",
      "Aneurysms",
      "Arterial Diseases Like Limb Ischemia",
      "Certain Cancers And Tumors"
    ]
  },
  {
    name: "Rheumatology",
    items: [
      "Rheumatoid Arthritis",
      "Pelvic Congestion Syndrome",
      "Pelvic Inflammatory Disease",
      "Pelvic Pain",
      "Ankylosing Spondylitis",
      "Arthritis",
      "Fibromyalgia",
      "Juvenile Arthritis",
      "Osgood Schlatters",
      "Osteoporosis",
      "Behcet's Disease",
      "Enteropathic Arthritis",
      "Reactive Arthritis",
      "Systemic Lupus Erythematosus Sle",
      "Systemic Sclerosis",
      "Fibromyalgia Syndrome",
      "Pseudogout",
      "Polymyositis",
      "Psoriatic Arthritis",
      "Gout",
      "Juvenile Rheumatoid Arthritis",
      "Septic Arthritis",
      "Chronic Fatigue Syndrome"
    ]
  },
  {
    name: "Speech Therapy",
    items: [
      "Expressive Language Disorder",
      "Articulation Disorders",
      "Receptive Language Disorder",
      "Orofacial Myofunctional Disorders",
      "Aphasia",
      "Dysarthria"
    ]
  },
  {
    name: "Urology",
    items: [
      "Premature Ejaculation",
      "Male Sexual Dysfunction",
      "Sexual Disorders",
      "Dissatisfaction With Partner",
      "Gonadal Dysgenesis",
      "Hydrocele",
      "Poor Performance In Bed",
      "Unhealthy And Problematic Sex Life.",
      "Urinary Tract Infection",
      "Testicular Cancers",
      "Urinary Incontinence",
      "Bladder Prolapse",
      "Adult Polycystic Kidney Disease",
      "Benign Prostatic Hyperplasia",
      "Bladder Divertivulae",
      "Cystitis",
      "Kidney Tumors",
      "Nephrolithiasis",
      "Orchitis",
      "Prostatic Carcinoma",
      "Renal Cancers",
      "Urethral Injuries",
      "Kidney Stones",
      "Scar Tissues (May Result In Spasms)",
      "Strictures In The Urinary Tract",
      "Dyspareunia",
      "Fertility Issues In Men",
      "Gynaecomastia",
      "Hypogonadism",
      "Impotence",
      "Klinefelter's Syndrome"
    ]
  }
];

const AllDiseasesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {diseaseCategories.map(({ name: category, items }) => (
          <section key={category} aria-labelledby={`heading-${category}`} className="space-y-4">
            <h2 id={`heading-${category}`} className="text-xl md:text-2xl font-semibold text-center">
              {category}
            </h2>
            <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from(new Set(items)) // Remove duplicates
                .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
                .map((disease) => {
                  const target = `/doctors?disease=${encodeURIComponent(disease)}`;
                  return (
                    <li key={disease} className="list-none">
                      <Link
                        to={target}
                        className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="text-sm font-medium text-gray-900">{disease}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AllDiseasesPage;
