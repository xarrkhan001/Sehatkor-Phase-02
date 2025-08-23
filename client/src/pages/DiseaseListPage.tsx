import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { diseases } from "@/data/diseases";
import { useEffect } from "react";

const DiseaseListPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Diseases & Symptoms</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse common diseases in Pakistan, see symptoms and causes. Click any disease to view more details.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {diseases.map((disease) => {
          const Icon = disease.icon;
          return (
            <Link key={disease.slug} to={`/all-diseases`}>
              <Card className="group border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className={`w-8 h-8 ${disease.colorClass}`} />
                  </div>
                  <div className="font-medium text-sm sm:text-base">{disease.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{disease.category}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DiseaseListPage;



