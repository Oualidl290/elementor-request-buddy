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
import { initializeWordPressContext, WordPressConfig } from '@/utils/wordpressIntegration';

const DesignerPanel = () => {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig | null>(null);
  const queryClient = useQueryClient();

  // Initialize WordPress context on component mount
  useEffect(() => {
    const config = initializeWordPressContext();
    setWordpressConfig(config);
  }, []);

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

  // Use WordPress project ID if available, otherwise fall back to user profile
  const effectiveProjectId = wordpressConfig?.projectId || userProfile?.project_id;

  // Fetch edit requests filtered by effective project_id
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['editRequests', statusFilter, pageFilter, searchQuery, effectiveProjectId],
    queryFn: () => editRequestsService.getEditRequests({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page_url: pageFilter === 'all' ? undefined : pageFilter,
      search: searchQuery || undefined,
      project_id: effectiveProjectId || '',
    }),
    enabled: !!effectiveProjectId,
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

  // Show loading while WordPress config is being initialized
  if (!wordpressConfig && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Initializing Designer Panel...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Please sign in to access the designer panel.</div>
      </div>
    );
  }

  if (!effectiveProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">No project ID found. Please check your configuration.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Designer Panel</h1>
                <p className="text-sm text-gray-500">
                  {wordpressConfig ? 'WordPress Integration Active' : 'Manage client feedback'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Globe className="w-4 h-4 mr-2" />
                    Project ID
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 rounded-xl shadow-lg border-0">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Current Project ID</h4>
                    <p className="text-sm text-gray-600">
                      {wordpressConfig ? 'Loaded from WordPress container' : 'From user profile'}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-sm font-mono text-gray-800">{effectiveProjectId}</code>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" onClick={signOut} size="sm" className="rounded-lg">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* Filters */}
        <Card className="mb-6 rounded-xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">All Pages</SelectItem>
                  {uniquePages.map(page => (
                    <SelectItem key={page} value={page}>{page}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-lg border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : error ? (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading requests</h3>
              <p className="text-gray-600">{error.message}</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No edit requests match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request: EditRequest) => (
              <Card 
                key={request.id} 
                className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                onClick={() => openRequestDialog(request)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-2">
                        {request.page_url}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs rounded-full px-2 py-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status.replace('-', ' ')}</span>
                        </Badge>
                        {request.replies && request.replies.length > 0 && (
                          <Badge variant="outline" className="text-xs rounded-full">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {request.replies.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {request.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
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

        {/* Clean Request Detail Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-0 shadow-xl">
            {selectedRequest && (
              <>
                <DialogHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {selectedRequest.page_url}
                    </DialogTitle>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => handleStatusChange(selectedRequest.id, value)}
                    >
                      <SelectTrigger className="w-36 rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Badge className={`rounded-full px-2 py-1 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status.replace('-', ' ')}</span>
                    </Badge>
                    <span>{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                    {selectedRequest.submitted_by && (
                      <span>by {selectedRequest.submitted_by}</span>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Original Request */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Original Request</h4>
                    <p className="text-gray-700 text-sm">{selectedRequest.message}</p>
                  </div>

                  {/* Conversation */}
                  {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Conversation</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedRequest.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-xl ${
                              reply.from === 'designer'
                                ? 'bg-blue-50 border-l-4 border-blue-400 ml-4'
                                : 'bg-gray-50 border-l-4 border-gray-300 mr-4'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {reply.from === 'designer' ? 'You' : 'Client'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Reply */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Add Reply</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyTexts[selectedRequest.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({
                          ...prev,
                          [selectedRequest.id]: e.target.value
                        }))}
                        className="rounded-xl border-gray-200 min-h-[80px]"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleReplySubmit(selectedRequest.id)}
                          disabled={!replyTexts[selectedRequest.id]?.trim() || addReplyMutation.isPending}
                          className="bg-blue-500 hover:bg-blue-600 rounded-xl px-6"
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
