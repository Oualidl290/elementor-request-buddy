
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
import { MessageSquare, Filter, Search, User, LogOut, Globe, Settings, Bell, Eye, MessageCircle, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
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
      case 'open': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-lg font-medium text-slate-600">Please sign in to access the designer panel.</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-lg font-medium text-slate-600">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Designer Panel</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your client feedback</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                    <Globe className="w-4 h-4 mr-2" />
                    Project ID
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Your Project ID</h4>
                    <p className="text-sm text-slate-600">Share this with clients to receive feedback</p>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <code className="text-sm font-mono text-slate-800">{userProfile.project_id}</code>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              
              <Button variant="outline" onClick={signOut} size="sm" className="border-slate-200 hover:bg-slate-50">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Modern Filters Card */}
        <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <h3 className="font-medium text-slate-900">Filters</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                {requests.length} {requests.length === 1 ? 'request' : 'requests'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Page</label>
                <Select value={pageFilter} onValueChange={setPageFilter}>
                  <SelectTrigger className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {uniquePages.map(page => (
                      <SelectItem key={page} value={page}>{page}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading requests...</p>
          </div>
        ) : error ? (
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error loading requests</h3>
              <p className="text-slate-600">{error.message}</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">
                {statusFilter === 'all' && pageFilter === 'all' && !searchQuery
                  ? 'No edit requests have been submitted for your project yet.'
                  : 'No requests match your current filters.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request: EditRequest) => (
              <Card 
                key={request.id} 
                className="border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => openRequestDialog(request)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium text-slate-900 mb-2 line-clamp-1">
                        {request.page_url}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        {request.replies && request.replies.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {request.replies.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {request.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    {request.submitted_by && (
                      <span>by {request.submitted_by}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Request Detail Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="text-slate-900">{selectedRequest.page_url}</span>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => handleStatusChange(selectedRequest.id, value)}
                    >
                      <SelectTrigger className="w-40 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </DialogTitle>
                  <DialogDescription className="flex items-center space-x-4 text-sm">
                    <Badge className={`border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status}</span>
                    </Badge>
                    <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                    {selectedRequest.submitted_by && (
                      <span>by {selectedRequest.submitted_by}</span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Original Request */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Original Request</h4>
                    <p className="text-slate-700">{selectedRequest.message}</p>
                  </div>

                  {/* Replies */}
                  {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Conversation</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedRequest.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-lg ${
                              reply.from === 'designer'
                                ? 'bg-indigo-50 border-l-4 border-indigo-400 ml-4'
                                : 'bg-slate-50 border-l-4 border-slate-400 mr-4'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {reply.from === 'designer' ? 'You' : 'Client'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Reply */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-slate-900 mb-3">Add Reply</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyTexts[selectedRequest.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({
                          ...prev,
                          [selectedRequest.id]: e.target.value
                        }))}
                        className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleReplySubmit(selectedRequest.id)}
                          disabled={!replyTexts[selectedRequest.id]?.trim() || addReplyMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700"
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
