import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Check, 
  X, 
  MessageCircle,
  Users,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserBadge from "./UserBadge";
import { 
  searchUsersForConnection, 
  sendConnectionRequest, 
  getPendingRequests, 
  acceptConnectionRequest, 
  rejectConnectionRequest 
} from "@/lib/connectionApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
}

interface ConnectionRequest {
  _id: string;
  sender: User;
  recipient: User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface ConnectionRequestsProps {
  onConnectionAccepted?: () => void;
}

const ConnectionRequests = ({ onConnectionAccepted }: ConnectionRequestsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load pending requests on mount
  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const requests = await getPendingRequests();
      setPendingRequests(requests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load pending requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    try {
      setSearchLoading(true);
      setSearchResults([]); // Clear previous results
      
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = await searchUsersForConnection(searchQuery.trim());
      setSearchResults(results);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    
    try {
      setSendingRequest(true);
      await sendConnectionRequest(selectedUser._id, requestMessage.trim());
      toast({
        title: "Success",
        description: "Connection request sent successfully"
      });
      setRequestDialogOpen(false);
      setSelectedUser(null);
      setRequestMessage("");
      // Refresh search results to update status
      if (searchQuery.trim()) {
        handleSearch();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive"
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptConnectionRequest(requestId);
      toast({
        title: "Success",
        description: "Connection request accepted"
      });
      loadPendingRequests();
      // Notify parent component to refresh chat list
      if (onConnectionAccepted) {
        onConnectionAccepted();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept request",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId);
      toast({
        title: "Success",
        description: "Connection request rejected"
      });
      loadPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5"><Clock className="w-2.5 h-2.5 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="text-xs px-1.5 py-0.5 h-5 bg-green-500"><UserCheck className="w-2.5 h-2.5 mr-1" />Connected</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5"><UserX className="w-2.5 h-2.5 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 border-gray-300 text-gray-600"><UserPlus className="w-2.5 h-2.5 mr-1" />Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Find & Connect</h3>
        </div>
       {/* Search Input - Compact */}
<div className="mb-3">
  <div className="relative">
    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <Input
      placeholder="Search name, email, or role"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      className="pl-8 h-9 text-xs lg:text-sm"
    />
  </div>
</div>

        {/* Search Button - Full Width Below Input */}
        <div className="mb-4">
          <Button 
            onClick={handleSearch} 
            disabled={searchLoading || !searchQuery.trim()}
            className="w-full h-11 text-sm bg-blue-500 hover:bg-blue-600"
          >
            {searchLoading ? "Searching..." : "Search Users"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600">Search Results</h4>
            {searchResults.map((user) => (
              <div key={user._id} className="p-3 border rounded-lg space-y-3">
                {/* User Info - Compact Layout */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      <UserCheck className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <div className="mt-1">
                      <UserBadge role={user.role} />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Stacked Vertically */}
                <div className="space-y-2">
                  {/* Status Badge - Above Left */}
                  <div className="flex justify-start">
                    {getStatusBadge(user.connectionStatus || 'none')}
                  </div>
                  
                  {/* Connect Button - Below */}
                  {user.connectionStatus === 'none' ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setRequestDialogOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-7 px-3 text-xs w-full"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() && !searchLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No users found matching your search</p>
            <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</p>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Search for users to connect with</p>
            <p className="text-xs text-gray-400 mt-1">Enter a name, email, or role above</p>
          </div>
        ) : null}
      </Card>

      {/* Pending Requests Section */}
<Card className="p-2 lg:p-3">
  <div className="flex items-center gap-2 mb-1 lg:mb-2">
    <h3 className="text-sm lg:text-base font-semibold">Pending Requests</h3>
    {pendingRequests.length > 0 && (
      <Badge variant="secondary" className="text-[10px] lg:text-xs">{pendingRequests.length}</Badge>
    )}
  </div>

  {loading ? (
    <div className="text-center py-2 lg:py-3 text-gray-500 text-xs lg:text-sm">Loading...</div>
  ) : pendingRequests.length === 0 ? (
    <div className="text-center py-4 lg:py-6 text-gray-500 text-xs lg:text-sm">
      <MessageCircle className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-1 text-gray-300" />
      <p>No pending connection requests</p>
    </div>
  ) : (
    <div className="space-y-1.5 lg:space-y-2">
      {pendingRequests.map((request) => (
        <div key={request._id} className="flex flex-col gap-1.5 lg:gap-2 p-1.5 lg:p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 lg:h-7 lg:w-7">
              <AvatarImage src={request.sender.avatar} />
              <AvatarFallback className="text-[10px] lg:text-xs">
                <UserCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </AvatarFallback>
            </Avatar>
            <div className="font-medium text-xs lg:text-sm truncate">{request.sender.name}</div>
          </div>
          
          {request.message && (
            <div className="text-[11px] lg:text-xs text-gray-500 pl-8 lg:pl-10 -mt-1">
              "{request.message.length > 16 ? `${request.message.substring(0, 16)}...` : request.message}"
            </div>
          )}

          <div className="flex gap-1.5 w-full">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white flex-1 h-6 lg:h-7 px-1.5 lg:px-2 text-[11px] lg:text-xs"
              onClick={() => handleAcceptRequest(request._id)}
            >
              <Check className="w-2 h-2 lg:w-2.5 lg:h-2.5 mr-0.5" />
              Accept
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-6 lg:h-7 px-1.5 lg:px-2 text-[11px] lg:text-xs"
              onClick={() => handleRejectRequest(request._id)}
            >
              <X className="w-2 h-2 lg:w-2.5 lg:h-2.5 mr-0.5" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
</Card>

      {/* Send Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Send Connection Request</DialogTitle>
          <DialogDescription>
            Send a connection request to {selectedUser?.name}
          </DialogDescription>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser?.avatar} />
                <AvatarFallback>
                  <UserCheck className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedUser?.name}</div>
                <div className="text-sm text-gray-500">{selectedUser?.email}</div>
                <UserBadge role={selectedUser?.role || ''} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Message (optional)</label>
              <Textarea
                placeholder="Add a personal message to your connection request..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                {requestMessage.length}/200 characters
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setRequestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRequest}
                disabled={sendingRequest}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {sendingRequest ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectionRequests;
