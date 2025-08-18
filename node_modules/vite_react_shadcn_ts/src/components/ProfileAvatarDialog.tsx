import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadFile, updateMyProfile } from '@/lib/chatApi';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const ProfileAvatarDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { updateCurrentUser } = useAuth();

  const hasImage = !!imageDataUrl;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      // Upload the original full image without cropping
      const uploaded = await uploadFile(selectedFile);
      const resp = await updateMyProfile({ avatar: uploaded.url });
      const updatedUser = resp?.user || resp;
      if (updatedUser?.avatar) {
        updateCurrentUser({ avatar: updatedUser.avatar });
      }
      onOpenChange(false);
      setImageDataUrl(null);
      setSelectedFile(null);
    } catch (err) {
      // no-op, rely on UI toast elsewhere if desired
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setImageDataUrl(null); setSelectedFile(null); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Change profile photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative w-full h-64 rounded-lg bg-neutral-50 border overflow-hidden">
            {hasImage ? (
              <img
                ref={imgRef}
                src={imageDataUrl!}
                alt="preview"
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Choose an image to preview</div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <input type="file" accept="image/*" onChange={onPick} className="text-xs" />
            {hasImage && (
              <Button variant="secondary" size="sm" onClick={() => { setImageDataUrl(null); setSelectedFile(null); }} className="text-xs">Remove</Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={!hasImage || saving} className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileAvatarDialog;


