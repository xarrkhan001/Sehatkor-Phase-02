import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileImageUploadProps {
  currentImage?: string;
  userName?: string;
  onImageUpdate?: (newImageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showEditButton?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  userName = 'User',
  onImageUpdate,
  size = 'md',
  showEditButton = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateUser } = useAuth();

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Profile image updated successfully');
        
        // Update user context
        if (data.user && updateUser) {
          updateUser(data.user);
        }
        
        // Call callback if provided
        if (onImageUpdate) {
          onImageUpdate(data.avatar);
        }

        // Reset form
        setSelectedFile(null);
        setPreview('');
        setIsOpen(false);
      } else {
        toast.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ring-2 ring-white shadow-sm`}>
        <AvatarImage src={currentImage || user?.avatar} alt={userName} />
        <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
          {userName?.charAt(0) ?? 'U'}
        </AvatarFallback>
      </Avatar>
      
      {showEditButton && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 shadow-md"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Image</DialogTitle>
              <DialogDescription>
                Choose a new profile image. Maximum file size is 5MB.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 ring-2 ring-gray-200">
                  <AvatarImage src={preview || currentImage || user?.avatar} alt={userName} />
                  <AvatarFallback className="bg-red-100 text-red-700 font-semibold text-xl">
                    {userName?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profile-image">Select Image</Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="min-w-[100px]"
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProfileImageUpload;
