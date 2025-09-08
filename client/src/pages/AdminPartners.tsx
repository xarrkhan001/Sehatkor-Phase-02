import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input as UiInput } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/config/api";

type AddPartnerPayload = { name: string; logo: File };

const AddPartnerDialog = memo(function AddPartnerDialog({
  open,
  onOpenChange,
  onSave
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: AddPartnerPayload) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFile = useCallback((file: File | null) => {
    setLogo(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }, []);

  const handleSave = useCallback(async () => {
    if (!logo) return;
    await onSave({ name: name.trim(), logo });
    setName("");
    setLogo(null);
    setPreviewUrl("");
    onOpenChange(false);
  }, [name, logo, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Partner</Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e)=>e.preventDefault()} onPointerDownOutside={(e)=>e.preventDefault()} onInteractOutside={(e)=>e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add Partner</DialogTitle>
          <DialogDescription>Upload PNG logo. Company name is optional.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Company Name (optional)</label>
            <UiInput autoComplete="off" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="e.g., TCS" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PNG Logo</label>
            <input type="file" accept="image/png" onChange={(e:any)=> handleFile(e.target.files?.[0]||null)} />
            {previewUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={previewUrl} className="h-16 w-16 rounded-full object-contain ring-1 ring-gray-200" />
                <span className="text-sm text-gray-600">Preview</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const AdminPartners = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchPartners = async () => {
    try {
      const res = await fetch(apiUrl('/api/partners'));
      const data = await res.json();
      if (res.ok && data?.success) setPartners(data.partners || []);
    } catch {}
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreatePartner = async (name: string, logo: File) => {
    if (!logo) return toast({ title: 'Missing', description: 'PNG logo is required', variant: 'destructive' });
    const fd = new FormData();
    if (name && name.trim()) fd.append('name', name.trim());
    fd.append('logo', logo);
    const res = await fetch(apiUrl('/api/partners'), { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) return toast({ title: 'Error', description: data?.message || 'Failed', variant: 'destructive' });
    toast({ title: 'Added', description: 'Partner created' });
    fetchPartners();
  };

  const handleReplaceLogo = async (id: string, file: File | null, name?: string) => {
    if (!file && !name) return;
    const fd = new FormData();
    if (name) fd.append('name', name);
    if (file) fd.append('logo', file);
    const res = await fetch(apiUrl(`/api/partners/${id}`), { method: 'PUT', body: fd });
    const data = await res.json();
    if (!res.ok) return toast({ title: 'Update failed', description: data?.message || 'Try again', variant: 'destructive' });
    toast({ title: 'Updated', description: 'Partner updated' });
    fetchPartners();
  };

  const handleDeletePartner = async (id: string) => {
    const res = await fetch(apiUrl(`/api/partners/${id}`), { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return toast({ title: 'Delete failed', description: data?.message || 'Try again', variant: 'destructive' });
    toast({ title: 'Deleted', description: 'Partner removed' });
    fetchPartners();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Marquee Partners</CardTitle>
          <CardDescription>Upload partner PNG logos. Company name is optional. Stored on Cloudinary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Add New Partner</h3>
            <AddPartnerDialog open={openAddModal} onOpenChange={setOpenAddModal} onSave={({name, logo})=>handleCreatePartner(name, logo)} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(partners||[]).map((p:any)=> (
                <TableRow key={p._id}>
                  <TableCell>
                    <img src={p.logoUrl} alt={p.name} className="h-12 w-12 rounded-full object-contain" />
                  </TableCell>
                  <TableCell>
                    <UiInput defaultValue={p.name} onBlur={(e:any)=>handleReplaceLogo(p._id, null, e.target.value)} />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <input type="file" accept="image/png" onChange={(e:any)=>handleReplaceLogo(p._id, e.target.files?.[0]||null)} />
                    <Button variant="destructive" onClick={()=>handleDeletePartner(p._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPartners;


