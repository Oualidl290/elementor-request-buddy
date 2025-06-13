import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Filter, Search, User, LogOut, Globe, Settings, Bell, Eye, MessageCircle, CheckCircle, Clock, AlertCircle, Plus, Mail } from 'lucide-react';
import { editRequestsService, EditRequest } from '@/services/editRequestsService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const DesignerPanel = () => {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get user's profile data including project_id
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch edit requests filtered by user's project_id
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['editRequests', statusFilter, pageFilter, searchQuery, userProfile?.project_id],
    queryFn: () => editRequestsService.getEditRequests({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page_url: pageFilter === 'all' ? undefined : pageFilter,
      search: searchQuery || undefined,
      project_id: userProfile?.project_id || '',
    }),
    enabled: !!userProfile?.project_id,
  });

  // Get unique page URLs for the filter dropdown (only for user's project)
  const uniquePages = [...new Set(requests.map(req => req.page_url))];

  // Update request status
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      editRequestsService.updateEditRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editRequests'] });
    },
  });

  // Add reply to request
  const addReplyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      editRequestsService.addReply(id, message, 'designer'),
    onSuccess: (_, variables) => {
      setReplyTexts(prev => ({ ...prev, [variables.id]: '' }));
      queryClient.invalidateQueries({ queryKey: ['editRequests'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-3 h-3" />;
      case 'in-progress': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      default: return <MessageCircle className="w-3 h-3" />;
    }
  };

  const handleStatusChange = (requestId: string, newStatus: string) => {
    updateRequestMutation.mutate({
      id: requestId,
      updates: { status: newStatus }
    });
  };

  const handleReplySubmit = (requestId: string) => {
    const message = replyTexts[requestId]?.trim();
    if (!message) return;

    addReplyMutation.mutate({
      id: requestId,
      message
    });
  };

  const openRequestDialog = (request: EditRequest) => {
    setSelectedRequest(request);
    setIsRequestDialogOpen(true);
  };

  const getClientInitials = (submittedBy: string) => {
    if (!submittedBy) return 'AN';
    
    // If it's an email, get initials from the part before @
    if (submittedBy.includes('@')) {
      const namePart = submittedBy.split('@')[0];
      const words = namePart.split(/[._-]/).filter(word => word.length > 0);
      return words.length >= 2 
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : `${words[0][0]}${words[0][1] || ''}`.toUpperCase();
    }
    
    // If it's a name, get first letters of first two words
    const words = submittedBy.split(' ').filter(word => word.length > 0);
    return words.length >= 2 
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : `${words[0][0]}${words[0][1] || ''}`.toUpperCase();
  };

  const getDisplayName = (submittedBy: string) => {
    if (!submittedBy) return 'Anonymous';
    
    // If it's an email, show the name part nicely formatted
    if (submittedBy.includes('@')) {
      const namePart = submittedBy.split('@')[0];
      return namePart.split(/[._-]/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return submittedBy;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Please sign in to access the designer panel.</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Designer Panel</h1>
                <p className="text-sm text-gray-500 font-medium">Manage client feedback</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl border-gray-200 hover:border-blue-300 transition-all duration-200">
                    <Globe className="w-4 h-4 mr-2" />
                    Project ID
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6 rounded-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Your Project ID</h4>
                    <p className="text-sm text-gray-600">Share this with clients to receive feedback</p>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <code className="text-sm font-mono text-gray-800">{userProfile.project_id}</code>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" onClick={signOut} size="sm" className="rounded-2xl border-gray-200 hover:border-red-300 transition-all duration-200">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8 rounded-3xl border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-2xl border-gray-200 bg-white/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="rounded-2xl border-gray-200 bg-white/50">
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Pages</SelectItem>
                  {uniquePages.map(page => (
                    <SelectItem key={page} value={page}>{page}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-2xl border-gray-200 bg-white/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Cards */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 font-medium">Loading requests...</p>
          </div>
        ) : error ? (
          <Card className="rounded-3xl border-0 shadow-lg bg-white/60">
            <CardContent className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Error loading requests</h3>
              <p className="text-gray-600">{error.message}</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-lg bg-white/60">
            <CardContent className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No requests found</h3>
              <p className="text-gray-600">No edit requests match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request: EditRequest) => (
              <Card 
                key={request.id} 
                className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/70 backdrop-blur-sm hover:bg-white/80 group"
                onClick={() => openRequestDialog(request)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-3">
                        {request.page_url}
                      </p>
                      <div className="flex items-center space-x-3">
                        <Badge className={`text-xs rounded-full px-3 py-1.5 font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1.5 capitalize">{request.status.replace('-', ' ')}</span>
                        </Badge>
                        {request.replies && request.replies.length > 0 && (
                          <Badge variant="outline" className="text-xs rounded-full px-3 py-1.5">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {request.replies.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {request.message}
                  </p>

                  {/* Client Information */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                          {getClientInitials(request.submitted_by || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900">
                          {getDisplayName(request.submitted_by || '')}
                        </span>
                        {request.submitted_by && request.submitted_by.includes('@') && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {request.submitted_by}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Request Detail Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            {selectedRequest && (
              <>
                <DialogHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                        {selectedRequest.page_url}
                      </DialogTitle>
                      
                      {/* Enhanced Client Information in Dialog */}
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {getClientInitials(selectedRequest.submitted_by || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {getDisplayName(selectedRequest.submitted_by || '')}
                          </span>
                          {selectedRequest.submitted_by && selectedRequest.submitted_by.includes('@') && (
                            <span className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-4 h-4 mr-1.5" />
                              {selectedRequest.submitted_by}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 mt-1">
                            Submitted on {new Date(selectedRequest.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`rounded-full px-3 py-1.5 ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusIcon(selectedRequest.status)}
                          <span className="ml-1.5 capitalize">{selectedRequest.status.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => handleStatusChange(selectedRequest.id, value)}
                    >
                      <SelectTrigger className="w-40 rounded-2xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Original Request */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 rounded-2xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Original Request</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedRequest.message}</p>
                  </div>

                  {/* Conversation */}
                  {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Conversation</h4>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {selectedRequest.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-4 rounded-2xl ${
                              reply.from === 'designer'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 ml-6'
                                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-300 mr-6'
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className={`text-xs font-medium ${
                                  reply.from === 'designer' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-500 text-white'
                                }`}>
                                  {reply.from === 'designer' ? 'Y' : getClientInitials(selectedRequest.submitted_by || '')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {reply.from === 'designer' ? 'You' : getDisplayName(selectedRequest.submitted_by || '')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Reply */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Add Reply</h4>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyTexts[selectedRequest.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({
                          ...prev,
                          [selectedRequest.id]: e.target.value
                        }))}
                        className="rounded-2xl border-gray-200 min-h-[100px] resize-none"
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleReplySubmit(selectedRequest.id)}
                          disabled={!replyTexts[selectedRequest.id]?.trim() || addReplyMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl px-8 shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DesignerPanel;
