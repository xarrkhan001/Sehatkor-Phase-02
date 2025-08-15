import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listTests as apiList, createTest as apiCreate, updateTest as apiUpdate, deleteTest as apiDelete } from "@/lib/laboratoryApi";
import { 
  TestTube, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Bell,
  Edit,
  FileText,
  Download,
  FlaskConical,
  Microscope,
  Activity,
  Plus,
  Trash2
} from "lucide-react";

const LaboratoryDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [labType, setLabType] = useState('');
  const [testImagePreview, setTestImagePreview] = useState('');
  const [testImageFile, setTestImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: ''
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [testForm, setTestForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: ''
  });

  const labTypes = [
    'Pathology Lab', 'Radiology Center', 'Clinical Lab', 
    'Diagnostic Center', 'Medical Lab', 'Research Lab'
  ];

  const testCategories = [
    'Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound'
  ];

  const syncServicesFromBackend = (docs: any[]) => {
    if (!user?.id) return;
    try {
      const all = ServiceManager.getAllServices();
      // Remove existing laboratory services from this user
      const filtered = all.filter((s: any) => !(s.providerType === 'laboratory' && s.providerId === user.id));
      
      // Add new tests from backend
      const mapped = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: (d.category || 'Test') as any,
        providerType: 'laboratory' as const,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Laboratory'),
        image: d.imageUrl,
        duration: d.duration || '',
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
      }));
      
      const next = [...filtered, ...mapped];
      localStorage.setItem('sehatkor_services', JSON.stringify(next));
      window.dispatchEvent(new StorageEvent('storage', { key: 'sehatkor_services' }));
    } catch (error) {
      console.error('Error syncing services from backend:', error);
    }
  };

  const reloadTests = async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching laboratory tests for user:', user.id);
      const docs = await apiList();
      console.log('Laboratory tests fetched:', docs);
      
      // Map to UI Test type for table
      const mapped: any[] = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: d.category || 'Test',
        duration: d.duration || '',
        image: d.imageUrl,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Laboratory'),
        providerType: 'laboratory' as const,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
      
      setTests(mapped);
      
      // Sync to local storage for other pages
      syncServicesFromBackend(docs);
      
    } catch (error) {
      console.error('Error loading tests:', error);
      toast({
        title: "Error",
        description: "Failed to load tests. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // initial load and lab type from localStorage
    reloadTests();
    const savedType = localStorage.getItem(`lab_type_${user?.id}`);
    if (savedType) setLabType(savedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddTest = async () => {
    if (!testForm.name || !user?.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsAddingTest(true);
    const parsedPrice = testForm.price ? parseFloat(testForm.price) : 0;

    try {
      let imageUrl: string | undefined = undefined;
      let imagePublicId: string | undefined = undefined;
      
      if (testImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(testImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Warning",
            description: "Image upload failed, but test will be added without image",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Save to backend
      const created = await apiCreate({
        name: testForm.name,
        description: testForm.description,
        price: parsedPrice,
        category: testForm.category || 'Test',
        duration: testForm.duration,
        imageUrl,
        imagePublicId,
        providerName: user?.name || 'Laboratory',
      });

      // Sync to local storage for other pages
      const newTest = {
        name: created.name,
        description: created.description,
        price: created.price,
        category: created.category,
        image: created.imageUrl,
        providerId: user.id,
        providerName: created.providerName,
        providerType: 'laboratory' as const,
      };

      // Add to local storage
      ServiceManager.addService(newTest);

      // Reset form
      setTestForm({ name: '', price: '', duration: '', description: '', category: '' });
      setTestImagePreview('');
      setTestImageFile(null);
      setIsAddTestOpen(false);
      
      // Reload tests from backend
      await reloadTests();
      
      toast({ 
        title: "Success", 
        description: "Test added successfully and is now available to all users" 
      });
    } catch (error: any) {
      console.error('Error adding test:', error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to add test. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsAddingTest(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await apiDelete(testId);
      ServiceManager.deleteService(testId);
      reloadTests();
      toast({ title: "Success", description: "Test deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to delete test", variant: "destructive" });
    }
  };

  const openEdit = (t: any) => {
    const id = t._id || t.id;
    setEditingTestId(String(id));
    setEditForm({
      name: t.name || '',
      price: t.price != null ? String(t.price) : '',
      duration: t.duration || '',
      description: t.description || '',
      category: t.category || ''
    });
    setEditImagePreview(t.imageUrl || t.image || '');
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTestId) return;
    try {
      let imageUrl: string | undefined = editImagePreview || undefined;
      let imagePublicId: string | undefined = undefined;
      if (editImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(editImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } finally {
          setIsUploadingImage(false);
        }
      }
      const parsedPrice = editForm.price ? parseFloat(editForm.price) : 0;
      const updated = await apiUpdate(editingTestId, {
        name: editForm.name,
        description: editForm.description,
        price: parsedPrice,
        category: editForm.category || 'Test',
        duration: editForm.duration,
        imageUrl,
        imagePublicId,
      });
      
      // Update in local storage
      const updatedTest = {
        name: updated.name,
        description: updated.description,
        price: updated.price,
        category: updated.category,
        duration: updated.duration,
        image: updated.imageUrl,
        providerId: user.id,
        providerName: updated.providerName,
        providerType: 'laboratory' as const,
      };
      
      // Note: Local storage sync is handled in reloadTests
      await reloadTests();
      
      setIsEditOpen(false);
      setEditingTestId(null);
      toast({ title: "Success", description: "Test updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update test", variant: "destructive" });
    }
  };

  const handleTypeChange = (type) => {
    setLabType(type);
    localStorage.setItem(`lab_type_${user?.id}`, type);
    
    toast({
      title: "Success",
      description: "Lab type updated successfully"
    });
  };

  const pendingTests = [
    { id: 1, patient: "Ahmad Ali", test: "Blood Test Complete", time: "9:00 AM", status: "Processing" },
    { id: 2, patient: "Sara Khan", test: "Urine Analysis", time: "10:30 AM", status: "Pending" },
    { id: 3, patient: "Hassan Ahmed", test: "X-Ray Chest", time: "11:00 AM", status: "Ready" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Laboratory</h1>
            <p className="text-muted-foreground">
              Manage diagnostic tests and lab operations
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Verification Banner */}
        {!user?.isVerified && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Laboratory License Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your laboratory license is being verified. You can start processing tests once verified.
                  </p>
                  <Button size="sm" className="bg-warning hover:bg-warning/90">
                    Upload Documents
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Tests</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <TestTube className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">28</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">14</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl font-bold">PKR 45,000</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Test Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Test</DialogTitle>
                  <DialogDescription>
                    Update the details of your diagnostic test.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editTestName">Test Name *</Label>
                    <Input
                      id="editTestName"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>

                  <div>
                    <Label>Test Image</Label>
                    <ImageUpload
                      onImageSelect={(file, preview) => {
                        setEditImageFile(file);
                        setEditImagePreview(preview);
                      }}
                      onImageRemove={() => {
                        setEditImageFile(null);
                        setEditImagePreview('');
                      }}
                      currentImage={editImagePreview}
                      placeholder="Upload new test image"
                      className="max-w-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editTestPrice">Price (PKR) *</Label>
                      <Input
                        id="editTestPrice"
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        placeholder="e.g., 1500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editTestDuration">Duration (hours)</Label>
                      <Input
                        id="editTestDuration"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                        placeholder="e.g., 2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editTestCategory">Category</Label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test category" />
                      </SelectTrigger>
                      <SelectContent>
                        {testCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="editTestDescription">Description</Label>
                    <Textarea
                      id="editTestDescription"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Brief description of the test"
                    />
                  </div>

                  <Button onClick={handleSaveEdit} className="w-full" disabled={isUploadingImage}>
                    {isUploadingImage ? 'Uploading...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Test Queue */}
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Test Queue</CardTitle>
                <CardDescription>Pending and active diagnostic tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{test.patient}</h4>
                        <p className="text-sm text-muted-foreground">{test.test}</p>
                        <div className="flex items-center space-x-1 mt-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{test.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={test.status === "Ready" ? "default" : "secondary"}
                          className={test.status === "Ready" ? "bg-success" : ""}
                        >
                          {test.status}
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {test.status === "Ready" && (
                            <Button size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lab Tests Management */}
            <Card className="card-healthcare">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lab Tests</CardTitle>
                    <CardDescription>Manage your diagnostic tests and pricing</CardDescription>
                  </div>
                  <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Test</DialogTitle>
                        <DialogDescription>
                          Add a new diagnostic test to your lab
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="testName">Test Name *</Label>
                          <Input
                            id="testName"
                            value={testForm.name}
                            onChange={(e) => setTestForm({...testForm, name: e.target.value})}
                            placeholder="e.g., Complete Blood Count"
                          />
                        </div>
                        
                        <div>
                          <Label>Test Image</Label>
                          <ImageUpload
                            onImageSelect={(file, preview) => {
                              setTestImageFile(file);
                              setTestImagePreview(preview);
                            }}
                            onImageRemove={() => {
                              setTestImageFile(null);
                              setTestImagePreview('');
                            }}
                            currentImage={testImagePreview}
                            placeholder="Upload test image"
                            className="max-w-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="testPrice">Price (PKR) *</Label>
                            <Input
                              id="testPrice"
                              type="number"
                              value={testForm.price}
                              onChange={(e) => setTestForm({...testForm, price: e.target.value})}
                              placeholder="e.g., 1500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="testDuration">Duration (hours)</Label>
                            <Input
                              id="testDuration"
                              value={testForm.duration}
                              onChange={(e) => setTestForm({...testForm, duration: e.target.value})}
                              placeholder="e.g., 2"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="testCategory">Category</Label>
                          <Select value={testForm.category} onValueChange={(value) => setTestForm({...testForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test category" />
                            </SelectTrigger>
                            <SelectContent>
                              {testCategories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="testDescription">Description</Label>
                          <Textarea
                            id="testDescription"
                            value={testForm.description}
                            onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                            placeholder="Brief description of the test"
                          />
                        </div>
                        <Button onClick={handleAddTest} className="w-full" disabled={isUploadingImage || isAddingTest}>
                          {isAddingTest ? 'Adding Test...' : 'Add Test'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tests.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {test.image ? (
                                  <img 
                                    src={test.image} 
                                    alt={test.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling!.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <span className={`text-gray-400 text-lg ${test.image ? 'hidden' : ''}`}>🔬</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{test.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{test.category}</Badge>
                            </TableCell>
                            <TableCell>PKR {test.price.toLocaleString()}</TableCell>
                            <TableCell>{test.duration || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(test)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No tests added yet. Add your first test to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Laboratory Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TestTube className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {labType && (
                    <Badge variant="secondary" className="mt-2">{labType}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="labType">Laboratory Type</Label>
                    <Select value={labType} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab type" />
                      </SelectTrigger>
                      <SelectContent>
                        {labTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Lab Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Tests
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Lab Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryDashboard;