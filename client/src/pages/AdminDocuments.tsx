import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Trash2,
  Eye,
  Download,
  ArrowLeft,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDocuments = () => {
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    // Add fl_attachment flag to Cloudinary URL to force download
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  // Documents: fetch pending
  const fetchPendingDocuments = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/documents/pending', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch documents');
      setPendingDocs(data.documents || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to fetch documents', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to delete');
      toast({ title: 'Deleted', description: 'The document has been deleted successfully.' });
      fetchPendingDocuments();
    } catch (err: any) {
      toast({ title: 'Deletion Error', description: err.message || 'Try again', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <Button 
            variant="outline" 
            onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href='/admin'; }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Document Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review, download, verify, or delete uploaded documents</p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="card-healthcare">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Pending Provider Documents ({pendingDocs.length})
          </CardTitle>
          <CardDescription>Review, download, verify, or delete uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          ) : pendingDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No Pending Documents</p>
              <p className="text-muted-foreground">All provider documents have been processed</p>
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="space-y-4 lg:hidden">
                {pendingDocs.map((doc: any) => (
                  <div key={doc._id} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{doc.userId?.name || '—'}</h3>
                          <p className="text-sm text-muted-foreground">{doc.userId?.email}</p>
                          <p className="text-sm text-muted-foreground">{doc.userId?.phone}</p>
                        </div>
                        <Badge variant="outline">{doc.userId?.role}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a 
                          href={getDownloadUrl(doc.url)} 
                          download={doc.fileName || 'document'} 
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 underline"
                        >
                          <Download className="w-4 h-4" /> 
                          {doc.fileName || 'Document'}
                        </a>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{doc.status}</Badge>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <Table className="hidden lg:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDocs.map((doc: any) => (
                    <TableRow key={doc._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.userId?.name || '—'}</span>
                          <span className="text-sm text-muted-foreground">{doc.userId?.email}</span>
                          <span className="text-sm text-muted-foreground">{doc.userId?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.userId?.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={getDownloadUrl(doc.url)} 
                          download={doc.fileName || 'document'} 
                          className="inline-flex items-center gap-2 underline text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" /> 
                          {doc.fileName || 'Document'}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{doc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteDocument(doc._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDocuments;
