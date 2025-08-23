import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDiseaseBySlug } from "@/data/diseases";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const DiseaseDetailPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { slug } = useParams();
  const disease = slug ? getDiseaseBySlug(slug) : undefined;

  if (!disease) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Disease not found</h1>
        <Button asChild>
          <Link to="/all-diseases">Back to Diseases</Link>
        </Button>
      </div>
    );
  }

  const Icon = disease.icon;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <Icon className={`w-8 h-8 ${disease.colorClass}`} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{disease.name}</h1>
          <div className="mt-2">
            <Badge variant="secondary">{disease.category}</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{disease.description}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm"><span className="font-medium">Category:</span> {disease.category}</div>
            <div className="text-sm"><span className="font-medium">Common in:</span> Pakistan (varies by region)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {disease.symptoms.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {disease.causes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {disease.prevention && (
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Prevention</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {disease.prevention.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link to="/all-diseases">Back to Diseases</Link>
        </Button>
      </div>
    </div>
  );
};

export default DiseaseDetailPage;


