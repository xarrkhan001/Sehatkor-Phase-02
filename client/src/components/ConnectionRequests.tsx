import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Check, 
  X, 
  Users,
  Loader2,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserBadge from "./UserBadge";
import { 
  searchUsersForConnection, 
  sendConnectionRequest, 
  getPendingRequests, 
  getSentRequests,
  acceptConnectionRequest, 
  rejectConnectionRequest,
  deleteConnectionRequest 
} from "@/lib/connectionApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
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
  const [searchSuggestions, setSearchSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'search' | 'received' | 'sent'>('search');
  const [dismissedRejections, setDismissedRejections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  // Load pending requests on mount
  useEffect(() => {
    loadPendingRequests();
    loadSentRequests();
  }, []);

  // Socket.io event listeners for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('sehatkor_token');
    if (!token) return;

    let socket: any;
    try {
      const { getSocket } = require('@/lib/socket');
      socket = getSocket();
    } catch (error) {
      return;
    }

    // Listen for new connection requests
    const onNewConnectionRequest = (data: any) => {
      // Refresh pending requests when a new request is received
      loadPendingRequests();
      toast({
        title: "New Connection Request",
        description: data.message || "You have a new connection request"
      });
    };

    // Listen for connection acceptance notifications
    const onConnectionAccepted = (data: any) => {
      // Refresh sent requests to update status
      loadSentRequests();
      toast({
        title: "Connection Accepted",
        description: data.message || "Your connection request was accepted"
      });
    };

    socket.on('new_connection_request', onNewConnectionRequest);
    socket.on('connection_accepted', onConnectionAccepted);

    return () => {
      socket?.off('new_connection_request', onNewConnectionRequest);
      socket?.off('connection_accepted', onConnectionAccepted);
    };
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSuggestionLoading(true);
        const results = await searchUsersForConnection(searchQuery);
        setSearchSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      } catch (error) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  const loadSentRequests = async () => {
    try {
      const requests = await getSentRequests();
      setSentRequests(requests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load sent requests",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setSearchResults([]); // Clear previous results
      setShowSuggestions(false); // Hide suggestions when doing full search
      
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

  const handleSuggestionSelect = (user: User) => {
    setSearchQuery(user.name);
    setShowSuggestions(false);
    setSearchResults([user]); // Show selected user as search result
  };

  const handleInputFocus = () => {
    if (searchSuggestions.length > 0 && searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    
    try {
      setSendingRequest(true);
      // Message input removed; send without a message
      await sendConnectionRequest(selectedUser._id, "");
      toast({
        title: "Success",
        description: "Connection request sent successfully"
      });
      setRequestDialogOpen(false);
      setSelectedUser(null);
      // Refresh search results to update status
      if (searchQuery.trim()) {
        handleSearch();
      }
      // Refresh sent requests
      loadSentRequests();
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

  const handleResendRequest = async (recipientId: string, recipientName: string) => {
    setSelectedUser({
      _id: recipientId,
      name: recipientName,
      email: '',
      role: '',
      isVerified: true
    });
    setRequestDialogOpen(true);
  };

  const handleDismissRejection = async (requestId: string) => {
    try {
      await deleteConnectionRequest(requestId);
      // Refresh sent requests to reflect the deletion
      await loadSentRequests();
      toast({
        title: "Success",
        description: "Request dismissed"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss request",
        variant: "destructive"
      });
    }
  };

  const isRejectionDismissed = (requestId: string) => {
    // Since we're deleting from database, this is no longer needed
    // But keep for backward compatibility
    return dismissedRejections.has(requestId);
  };

  const handleDismissCard = async (requestId: string) => {
    // Find the request to check its status
    const request = sentRequests.find(r => r._id === requestId);
    
    if (request?.status === 'rejected') {
      // For rejected requests: permanently delete from database so user can resend
      try {
        await deleteConnectionRequest(requestId);
        toast({
          title: "Success",
          description: "Rejected request removed - you can now send a new request"
        });
        // Refresh sent requests to update the list
        loadSentRequests();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove request",
          variant: "destructive"
        });
      }
    } else {
      // For accepted requests: only hide from UI, don't delete from database
      setDismissedCards(prev => new Set(prev).add(requestId));
      toast({
        title: "Success",
        description: "Card hidden from view"
      });
    }
  };

  const handleRemoveConnectionFromSearch = async (user: User) => {
    try {
      // Find the connection request for this user
      const connectionRequest = sentRequests.find(
        request => 
          (request.recipient._id === user._id || request.sender._id === user._id) &&
          request.status === 'accepted'
      );

      if (connectionRequest) {
        await deleteConnectionRequest(connectionRequest._id);
        toast({
          title: "Success",
          description: "Connection removed successfully"
        });
        // Refresh search results and sent requests
        if (searchQuery.trim()) {
          handleSearch();
        }
        loadSentRequests();
      } else {
        toast({
          title: "Error",
          description: "Connection not found",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove connection",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (acceptingIds.has(requestId) || rejectingIds.has(requestId)) return;
    try {
      setAcceptingIds(prev => new Set(prev).add(requestId));
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
    } finally {
      setAcceptingIds(prev => {
        const s = new Set(prev);
        s.delete(requestId);
        return s;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (acceptingIds.has(requestId) || rejectingIds.has(requestId)) return;
    try {
      setRejectingIds(prev => new Set(prev).add(requestId));
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
    } finally {
      setRejectingIds(prev => {
        const s = new Set(prev);
        s.delete(requestId);
        return s;
      });
    }
  };

  const getConnectionStatus = (status?: string) => {
    return status || 'none';
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
    <div className="space-y-3 lg:space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-0.5 bg-gray-100 p-0.5 rounded-lg">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-1 px-2   py-1.5 text-xs font-medium rounded-md transition-colors lg:flex-col lg:gap-0.5 ${
            activeTab === 'search'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="w-3 h-3 lg:w-4 lg:h-4 lg:mb-0.5" />
          <span className="leading-none">Search</span>
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 flex items-center justify-center gap-1 px-2  py-1.5 text-xs font-medium rounded-md transition-colors lg:flex-col lg:gap-0.5 ${
            activeTab === 'received'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="w-3 h-3 lg:w-4 lg:h-4 lg:mb-0.5" />
          <span className="leading-none">Received</span>
          {pendingRequests.length > 0 && (
            <span className="ml-1 lg:ml-0 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 flex items-center justify-center gap-1 px-2  py-1.5 text-xs font-medium rounded-md transition-colors lg:flex-col lg:gap-0.5 ${
            activeTab === 'sent'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-3 h-3 lg:w-4 lg:h-4 lg:mb-0.5" />
          <span className="leading-none">Sent</span>
          {sentRequests.length > 0 && (
            <span className="ml-1 lg:ml-0 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Section */}
      {activeTab === 'search' && (
        <Card className="p-2 lg:p-3">
          <div className="flex items-center gap-1.5 lg:gap-2 mb-2 lg:mb-3">
            <Search className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500" />
            <h3 className="font-semibold text-sm lg:text-base">Find Users</h3>
          </div>
          
          {/* Search Input */}
          <div className="mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search name, email, or role"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="pl-8 h-9 text-xs lg:text-sm"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && (searchSuggestions.length > 0 || suggestionLoading) && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {suggestionLoading ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    </div>
                  ) : (
                    searchSuggestions.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleSuggestionSelect(user)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{user.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            {user.role && (
                              <div className="text-xs text-blue-600 truncate">{user.role}</div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {getConnectionStatus(user.connectionStatus) === 'none' ? (
                              <UserPlus className="w-4 h-4 text-gray-400" />
                            ) : getConnectionStatus(user.connectionStatus) === 'accepted' ? (
                              <UserCheck className="w-4 h-4 text-green-500" />
                            ) : getConnectionStatus(user.connectionStatus) === 'pending' ? (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
                  {/* Status Badge with Cross Button */}
                  <div className="flex justify-between items-center">
                    <div className="flex justify-start">
                      {getStatusBadge(user.connectionStatus || 'none')}
                    </div>
                    {/* Cross button for connected users */}
                    {user.connectionStatus === 'accepted' && (
                      <button
                        onClick={() => handleRemoveConnectionFromSearch(user)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Remove connection"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
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
      )}

      {/* Received Requests Section */}
      {activeTab === 'received' && (
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
      <Users className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-1 text-gray-300" />
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
              disabled={acceptingIds.has(request._id) || rejectingIds.has(request._id)}
            >
              {acceptingIds.has(request._id) ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Check className="w-2 h-2 lg:w-2.5 lg:h-2.5 mr-0.5" />
                  Accept
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-6 lg:h-7 px-1.5 lg:px-2 text-[11px] lg:text-xs"
              onClick={() => handleRejectRequest(request._id)}
              disabled={acceptingIds.has(request._id) || rejectingIds.has(request._id)}
            >
              {rejectingIds.has(request._id) ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <X className="w-2 h-2 lg:w-2.5 lg:h-2.5 mr-0.5" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
        </Card>
      )}

      {/* Sent Requests Section */}
      {activeTab === 'sent' && (
        <Card className="p-2 lg:p-3">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <h3 className="text-sm lg:text-base font-semibold">Sent Requests</h3>
            {sentRequests.length > 0 && (
              <Badge variant="secondary" className="text-[10px] lg:text-xs">{sentRequests.length}</Badge>
            )}
          </div>

          {sentRequests.length === 0 ? (
            <div className="text-center py-4 lg:py-6 text-gray-500 text-xs lg:text-sm">
              <Send className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-1 text-gray-300" />
              <p>No sent connection requests</p>
            </div>
          ) : (
            <div className="space-y-1.5 lg:space-y-2">
              {sentRequests.filter(request => !dismissedCards.has(request._id)).map((request) => (
                <div key={request._id} className="flex flex-col gap-1.5 lg:gap-2 p-1.5 lg:p-6  border rounded-lg relative">
                  {/* Cross button for rejected and connected requests */}
                  {(request.status === 'rejected' || request.status === 'accepted') && (
                    <button
                      onClick={() => handleDismissCard(request._id)}
                      className="absolute top-1  right-1 p-1 hover:bg-red-200 rounded-full transition-colors"
                      title="Remove this card"
                    >
                      <X  className="w-4 h-4 text-xl text-red-400 bg-red-50 hover:text-red-600" />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 lg:h-7 lg:w-7">
                      <AvatarImage src={request.recipient.avatar} />
                      <AvatarFallback className="text-[10px] lg:text-xs">
                        <UserCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-xs  lg:text-sm truncate">{request.recipient.name}</div>
                    <div className="ml-auto mt-8 md:mt-0 lg:ml-0 lg:mt-0 lg:absolute lg:bottom-2 lg:right-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  
                  {request.message && (
                    <div className="text-[11px] lg:text-xs text-gray-500 pl-8 lg:pl-10   -mt-1">
                      "{request.message.length > 16 ? `${request.message.substring(0, 16)}...` : request.message}"
                    </div>
                  )}


                </div>
              ))}
            </div>
          )}
        </Card>
      )}

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
