import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ui/image-upload';
import { uploadProfileImage, updateMyProfile } from '@/lib/chatApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: 'doctor' | 'clinic/hospital' | 'laboratory' | 'pharmacy';
  name?: string;
  specialization?: string;
  avatar?: string;
}

const SPECIALTIES: Record<Props['role'], string[]> = {
  doctor: [
    'General Physician','Cardiologist','Dermatologist','Pediatrician','Orthopedic','Neurologist','Gynecologist','ENT Specialist','Psychiatrist','Dentist'
  ],
  'clinic/hospital': [
    'General Hospital','Specialty Clinic','Teaching Hospital','Surgical Center','Rehabilitation Center'
  ],
  laboratory: [
    'Pathology Lab','Radiology Center','Clinical Lab','Diagnostic Center','Medical Lab','Research Lab'
  ],
  pharmacy: [
    'Retail Pharmacy','Hospital Pharmacy','Online Pharmacy','Compounding Pharmacy','Clinical Pharmacy','Chain Pharmacy'
  ]
};

const EditProfileDialog: React.FC<Props> = ({ open, onOpenChange, role, name, specialization, avatar }) => {
  const { updateCurrentUser } = useAuth();
  const [displayName, setDisplayName] = useState(name || '');
  const [spec, setSpec] = useState(specialization || '');
  const [imagePreview, setImagePreview] = useState<string>(avatar || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(name || '');
      setSpec(specialization || '');
      setImagePreview(avatar || '');
      setImageFile(null);
    }
  }, [open, name, specialization, avatar]);

  const onSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = imagePreview || undefined;
      if (imageFile) {
        const uploaded = await uploadProfileImage(imageFile);
        avatarUrl = uploaded?.url;
      }
      const payload: any = { name: displayName.trim() };
      if (spec) payload.specialization = spec;
      if (avatarUrl) payload.avatar = avatarUrl;
      const updated = await updateMyProfile(payload);
      const updatedUser = updated?.user || updated;
      const partial: any = {};
      if (updatedUser?.name !== undefined) partial.name = updatedUser.name;
      if (updatedUser?.specialization !== undefined) partial.specialization = updatedUser.specialization;
      if (updatedUser?.avatar !== undefined) partial.avatar = updatedUser.avatar;
      updateCurrentUser(partial);
      toast.success('Profile updated');
      onOpenChange(false);
    } catch (e: any) {
      toast.error('Failed to update profile', { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  const options = SPECIALTIES[role] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your display name, specialty/type, and profile image.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="specialization">Specialty / Type</Label>
            <Select value={spec} onValueChange={setSpec}>
              <SelectTrigger id="specialization">
                <SelectValue placeholder="Select specialty / type" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Profile Image</Label>
            <ImageUpload
              currentImage={imagePreview}
              onImageSelect={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
              onImageRemove={() => { setImageFile(null); setImagePreview(''); }}
              placeholder="Upload profile image"
              className="max-w-xs"
              aspectRatio={1}
            />
          </div>
          <Button className="w-full" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
