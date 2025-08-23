import { Link } from "react-router-dom";
import { diseases } from "@/data/diseases";
import { useEffect, useMemo } from "react";

const AllDiseasesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof diseases>();
    for (const d of diseases) {
      const list = map.get(d.category) || [];
      list.push(d);
      map.set(d.category, list);
    }
    // Sort each group's items alphabetically
    for (const [k, list] of map) list.sort((a, b) => a.name.localeCompare(b.name));
    // Return entries sorted by category name
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">All Diseases</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse diseases and click to view doctors related to that condition.
        </p>
      </header>

      <div className="space-y-12">
        {/* Custom Dentistry section */}
        <section aria-labelledby={`heading-dentistry`} className="space-y-4">
          <h2 id={`heading-dentistry`} className="text-xl md:text-2xl font-semibold text-center">Dentistry</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Cavities',
              'Tooth Sensitivity',
              'Tooth Decay',
              'Gingivitis',
              'Cross Bites',
              'Gingivitis',
              'Impacted Teeth',
              'Missing Teeth Requiring Implants',
              'Oral Hygiene',
              'Oral Hygine',
              'Retained Baby Teeth',
              'Smelly Mouth',
              'Tooth Sensitivity',
              'Extraction Of Diseased / Impacted Teeth',
              'Malocclusion',
              'Temporomandibular Joint Disorders',
              'Crooked Teeth Due To Small Jaw',
              'Cross-Bites',
              'Excessive Over-Jet',
              'Mis-Aligned Jaw',
              'Open-Bites',
              'Over-Bite',
              'Over-Developed Jaw',
              'Spaces Between Teeth',
              'Under-Bite',
              'Under-Developed Jaw',
              'Under-Jet',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom Dermatology / Cosmetology section */}
        <section aria-labelledby={`heading-dermatology`} className="space-y-4">
          <h2 id={`heading-dermatology`} className="text-xl md:text-2xl font-semibold text-center">Dermatology / Cosmetology</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Vitiligo',
              'Massive Obesity',
              'Planter Wart',
              'Unaligned Jaw',
              'Wrinkles',
              'Plastic Surgeon',
              'Gynecomastia',
              'Aging (Natural Or Accelerated)',
              'DNS',
              'Other Reconstructive Surgeries',
              'Scars From Injury',
              'Third-Degree Burns',
              'Acne',
              'Cellulitis',
              'Psoriasis',
              'Eczema',
              'Fungal Nail Infection',
              'Fungal Skin Problems',
              'Lichen Planus',
              'Shingles',
              'Tinea Versicolor',
              'Warts',
              'Seborrheic Eczema',
              'Keloid',
              'Dandruff',
              'Skin Cancer',
              'Dyshidrotic Eczema',
              'Ingrown Nails',
              'Skin Diseases',
              'Rosacea',
              'Dermatomyositis',
              'Molluscum Contagiosum',
              'Hemangioma Of Skin',
              'Carbuncle',
              'Cutaneous Candidiasis',
              'Pimples',
              'Ichthyosis Vulgaris',
              'Acrodermatitis',
              'Melasma',
              'Herpes Stomatitis',
              'Hives',
              'Actinic Keratosis',
              'Impetigo',
              'Alopecia',
              'Blister',
              'Body Lice',
              'Erysipelas',
              'Hypohidrosis',
              'Lupus',
              'Moles',
              'Necrotizing Fasciitis',
              'Pemphigoid',
              'Rubeola',
              'Seborrheic Dermatitis And Crib Cap',
              'Seborrheic Keratosis',
              'Sunstroke',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom Dietetics section */}
        <section aria-labelledby={`heading-dietetics`} className="space-y-4">
          <h2 id={`heading-dietetics`} className="text-xl md:text-2xl font-semibold text-center">Dietetics</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Atherosclerosis',
              'Bipolar Disorder',
              "Celiac Disease",
              "Crohn's Disease",
              'Gall Stones',
              "Grave's Disease",
              'High Grade Obesity',
              'Kidney Stones',
              'Metabolic Resistance',
              'Metabolic Syndrome',
              'Neuropathy',
              "Pakinson's Disease",
              "Parkinson's Disease",
              'Poor Performance In Bed',
              'Sleep Disorders',
              'Stomach Ulcers',
              'Stunted Growth',
              'Clinical Nutritionist',
              'Anemia',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom Endocrinologist section */}
        <section aria-labelledby={`heading-endocrinologist`} className="space-y-4">
          <h2 id={`heading-endocrinologist`} className="text-xl md:text-2xl font-semibold text-center">Endocrinologist</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Diabetes',
              'Endocrine Disorders',
              'Thyroid Gland Diseases',
              'Growth Disorders',
              'Endocrine Cancers',
              'Hormonal Imbalances',
              'Hormone Deficiencies/Imbalance',
              'Pancreatitis',
              'Parathyroid Gland Diseases',
              'Pituitary Gland Disorders',
              'Hypothyroidism',
              'Goiter',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom ENT section */}
        <section aria-labelledby={`heading-ent`} className="space-y-4">
          <h2 id={`heading-ent`} className="text-xl md:text-2xl font-semibold text-center">ENT</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Deviated Nasal Septum (DNS)',
              'Diphtheria',
              'Dysphagia',
              'Ear Infection',
              'Epistaxis',
              'Follicular Adenoma',
              'Hyperthyroidism',
              'Influenza',
              'Laryngeal Stenosis',
              'Nasal Polyps',
              'Nasal Valve Collapse',
              'Neoplasms In Arotid/Submandibular Glands',
              'Ruptured Ear Drum',
              'Severe Ear Infection',
              'Severe Tonsillitis',
              'Sore Throat',
              'Thyroid Cancer',
              'Ent Specialist',
              'Diphtheria',
              'Ear Infection',
              'Obstructive Sleep Apnea',
              'Sore Throat',
              'Dysphagia',
              'Cleaning Painful Wax From Ears.',
              'Epistaxis',
              'Hay Fever',
              'Influenza',
              'Nasal Polyps',
              'Nosebleed',
              'Pollinosis',
              'Sinusitis',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Custom Eye section */}
        <section aria-labelledby={`heading-eye`} className="space-y-4">
          <h2 id={`heading-eye`} className="text-xl md:text-2xl font-semibold text-center">Eye</h2>
          <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              'Weakening Of Eye Sight',
              'Eye Swelling',
              'Eye Infection',
              'Cataract',
              'Squint',
              'Keratoconus',
              'Chalazion',
              'Conjunctivitis',
              'Diplopia',
              'Foreign Body In The Eyes',
              'Glaucoma',
              'Long-Sightedness',
              'Nystagmus',
              'Proptosis',
              'Retinopathies',
              'Short-Sightedness',
              'Uveitis',
              'Eye Surgeon',
              'Eye Problem',
              'Optometrist',
              'Eye Strain',
              'Long-Sightedness',
              'Short-Sightedness',
            ].map((name) => {
              const target = `/doctors?disease=${encodeURIComponent(name)}`;
              return (
                <li key={name} className="list-none">
                  <Link
                    to={target}
                    className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {grouped.map(([category, items]) => {
          const isBacterial = category === 'Bacterial';
          const isChronic = category === 'Chronic';
          const isParasitic = category === 'Parasitic';
          const isViral = category === 'Viral';
          const headingLabel = isBacterial
            ? 'Acupuncture'
            : isChronic
            ? 'Anesthesiology'
            : isParasitic
            ? 'Audiology'
            : isViral
            ? 'Cardiology'
            : category;
          const acupunctureItems = [
            'Different Forms Of Chronic Pain',
            'Head Aches Like Migrane',
            'Nausea',
            'Pain In Lumber Region',
            'Head Aches Like Migraine',
            'Pain In Lumbar Region',
          ];
          const anesthesiologyItems = [
            'Anesthetist',
            'Critical Care And Pain Management',
            'Pain Specialist',
            'End-Stage Diseases',
            'Neuropathic Pain',
            'Post Operative Pain',
            'Cardiothoracic Anesthetist',
            'Anesthesia For Cardio-Thoracic Surgeries',
          ];
          const audiologyItems = [
            "Autoimmune Inner Ear Disease (Aied)",
            "Cogan's Syndrome",
            'Congenital Aural Atresia & Microtia',
            'Congenital/ Acquired Hearing Loss',
            'Glomus Tumors In The Ear.',
            'Hyperacusis',
            'Labyrinthitis',
            'Labyrinthitis',
            'Misophonia',
            'Noise Induced Hearing Loss',
            'Otosclerosis',
            'Severe Ear Barotrauma',
            'Tinnitus',
          ];
          const cardiologyItems = [
            'Congenital Heart Diseases',
            'Arrhythmia',
            'Arrhythmia',
            'Arteriosclerosis',
            'Coronary Artery Disease',
            'Heart Block',
            'Heart Valve Disease',
            'Myocardial Infarction',
            'Myocardial Infarction',
            'Myxomas',
            'Valve Stenoses & Regurgitation',
            'Abnormal Heart Rhythms',
            'Angina',
            'Cardiac Arrest',
            'Heart Attack',
            'Acyanotic Heart Disease',
            'Heart Failure',
            'Arteriolosclerosis',
            'Hypertension',
            'Pulmonary Hypertension',
            'Cardiomyopathies',
            'Congenital Diseases',
            'Cyanotic Heart Disease',
            'Endocarditis',
            'Palpitations',
            'Pericarditis',
            'Rheumatic Heart Disease',
            'Valvular Diseases',
            // Added as requested
            'Atrial Fibrillation',
            'Coronary Artery Disease',
            'Heart Attack',
            'Peripheral Vascular Disease',
            'Valvular Heart Disease',
            // Newly added
            'Atrial Septal Defect',
            'Coarctation Of The Aorta',
            'Cyanotic/Acyanotic Heart Diseases',
            'Fontan Fenestration',
            'Tricuspid Atresia',
          ];

          return (
            <section key={category} aria-labelledby={`heading-${category}`} className="space-y-4">
              <h2 id={`heading-${category}`} className="text-xl md:text-2xl font-semibold text-center">
                {headingLabel}
              </h2>

              {/* For 'Bacterial' (Acupuncture) */}
              {isBacterial ? (
                <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {acupunctureItems.map((name) => {
                    const target = `/doctors?disease=${encodeURIComponent(name)}`;
                    return (
                      <li key={name} className="list-none">
                        <Link
                          to={target}
                          className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : isChronic ? (
                // For 'Chronic' (Anesthesiology)
                <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {anesthesiologyItems.map((name) => {
                    const target = `/doctors?disease=${encodeURIComponent(name)}`;
                    return (
                      <li key={name} className="list-none">
                        <Link
                          to={target}
                          className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : isParasitic ? (
                // For 'Parasitic' (Audiology)
                <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {audiologyItems.map((name) => {
                    const target = `/doctors?disease=${encodeURIComponent(name)}`;
                    return (
                      <li key={name} className="list-none">
                        <Link
                          to={target}
                          className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : isParasitic ? (
                // For 'Parasitic' (Audiology)
                <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {audiologyItems.map((name) => {
                    const target = `/doctors?disease=${encodeURIComponent(name)}`;
                    return (
                      <li key={name} className="list-none">
                        <Link
                          to={target}
                          className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : isViral ? (
                // For 'Viral' (Cardiology)
                <ul className="grid-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {cardiologyItems.map((name) => {
                    const target = `/doctors?disease=${encodeURIComponent(name)}`;
                    return (
                      <li key={name} className="list-none">
                        <Link
                          to={target}
                          className="block rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-gray-900">{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="grid-list grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {items.map((disease) => {
                    const Icon = disease.icon;
                    const target = `/doctors?disease=${encodeURIComponent(disease.name)}`;
                    return (
                      <li key={disease.slug} className="list-none">
                        <Link
                          to={target}
                          className="group block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${disease.bgClass} ring-1 ${disease.ringClass || ''}`}>
                              <Icon className={`h-5 w-5 ${disease.colorClass}`} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900">{disease.name}</p>
                              <p className="text-xs text-gray-500">View doctors</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default AllDiseasesPage;
