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
  const [tests, setTests] = useState([]);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [labType, setLabType] = useState('');
  const [testImage, setTestImage] = useState('');

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

  useEffect(() => {
    const savedTests = localStorage.getItem(`lab_tests_${user?.id}`);
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    }

    const savedType = localStorage.getItem(`lab_type_${user?.id}`);
    if (savedType) {
      setLabType(savedType);
    }
  }, [user?.id]);

  const saveTests = (newTests) => {
    setTests(newTests);
    localStorage.setItem(`lab_tests_${user?.id}`, JSON.stringify(newTests));
  };

  const handleAddTest = () => {
    if (!testForm.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const parsedPrice = testForm.price ? parseFloat(testForm.price) : 0;

    // Add test using ServiceManager
    try {
      const testData = {
        name: testForm.name,
        description: testForm.description,
        price: parsedPrice,
        category: testForm.category,
        providerType: 'laboratory' as const,
        providerId: user?.id || '',
        providerName: user?.name || 'Laboratory',
        image: testImage,
        ...(testForm.duration && { duration: testForm.duration })
      };

      const newTest = ServiceManager.addService(testData);
      setTestForm({
        name: '',
        price: '',
        duration: '',
        description: '',
        category: ''
      });
      setTestImage('');
      setIsAddTestOpen(false);
      toast({
        title: "Success",
        description: "Test added successfully and will appear in search results"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTest = (testId) => {
    const updatedTests = tests.filter(test => test.id !== testId);
    saveTests(updatedTests);
    
    toast({
      title: "Success",
      description: "Test deleted successfully"
    });
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
                            onImageSelect={(file, preview) => setTestImage(preview)}
                            onImageRemove={() => setTestImage('')}
                            currentImage={testImage}
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
                        <Button onClick={handleAddTest} className="w-full">
                          Add Test
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Services added here will appear in search results for patients to find and book.
                </p>
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