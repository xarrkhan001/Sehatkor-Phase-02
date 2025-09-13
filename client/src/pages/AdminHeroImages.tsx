import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/config/api";

const AdminHeroImages = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await fetch(apiUrl('/api/hero-images'));
      const data = await res.json();
      if (res.ok && data?.success) setImages(data.images || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch hero images', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      return toast({ title: 'Missing', description: 'Please choose an image', variant: 'destructive' });
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('image', file);
      if (title) fd.append('title', title);
      fd.append('order', String(order));
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/hero-images'), { 
        method: 'POST', 
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: fd 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      toast({ title: 'Uploaded', description: 'Hero image added successfully' });
      setFile(null);
      setTitle("");
      setOrder(0);
      fetchImages();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to upload', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch(apiUrl(`/api/hero-images/${id}`), { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Delete failed');
      toast({ title: 'Deleted', description: 'Hero image removed' });
      fetchImages();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Hero Images</CardTitle>
          <CardDescription>Upload images for the homepage hero slider. Stored on Cloudinary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e:any)=> setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="e.g., Caring Health" />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={order} onChange={(e:any)=> setOrder(Number(e.target.value)||0)} />
            </div>
          </div>
          <div>
            <Button onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Image'}</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(images||[]).map((img:any)=> (
                  <TableRow key={img._id}>
                    <TableCell>
                      <img src={img.url} alt={img.title||'Hero'} className="h-16 w-28 object-cover rounded" />
                    </TableCell>
                    <TableCell>{img.title || '-'}</TableCell>
                    <TableCell>{img.order ?? 0}</TableCell>
                    <TableCell>
                      <Button variant="destructive" onClick={()=> handleDelete(img._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHeroImages;
