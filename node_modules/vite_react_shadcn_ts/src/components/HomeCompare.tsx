import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";
import { useCompare } from "@/contexts/CompareContext";
import { useNavigate } from "react-router-dom";

type Unified = {
  id: string;
  name: string;
  provider: string;
  location: string;
};

const HomeCompare = () => {
  const { clear, add } = useCompare();
  const navigate = useNavigate();

  const [serviceName, setServiceName] = useState<string>("");
  const [firstId, setFirstId] = useState<string>("");
  const [secondId, setSecondId] = useState<string>("");

  const allUnified: Unified[] = useMemo(() => {
    const real = ServiceManager.getAllServices().map((s: RealService) => ({
      id: s.id,
      name: s.name,
      provider: s.providerName,
      location: (s as any).location || "Karachi",
    }));
    const mocks = mockServices.map((s: MockService) => ({ id: s.id, name: s.name, provider: s.provider, location: s.location }));
    return [...real, ...mocks];
  }, []);

  const serviceNames = useMemo(
    () => Array.from(new Set(allUnified.map(s => s.name))).sort(),
    [allUnified]
  );

  const optionsForSelected = useMemo(() => {
    return allUnified.filter(s => (serviceName ? s.name === serviceName : true));
  }, [allUnified, serviceName]);

  useEffect(() => {
    // Reset picks when changing service name
    setFirstId("");
    setSecondId("");
  }, [serviceName]);

  const onCompare = () => {
    if (!firstId || !secondId || firstId === secondId) return;
    clear();
    add(firstId);
    add(secondId);
    navigate("/compare");
  };

  return (
    <Card className="mt-6 bg-white/95 backdrop-blur border">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Quick Compare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Select value={serviceName} onValueChange={setServiceName}>
              <SelectTrigger>
                <SelectValue placeholder="Select service name (optional)" />
              </SelectTrigger>
              <SelectContent>
                {serviceNames.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={firstId} onValueChange={setFirstId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose first provider" />
              </SelectTrigger>
              <SelectContent>
                {optionsForSelected.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.name} — {o.provider} ({o.location})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={secondId} onValueChange={setSecondId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose second provider" />
              </SelectTrigger>
              <SelectContent>
                {optionsForSelected.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.name} — {o.provider} ({o.location})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onCompare} disabled={!firstId || !secondId || firstId === secondId}>Compare</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeCompare;













