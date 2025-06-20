
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
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Filter, Search, User, LogOut, Globe, Settings, Bell, Eye, MessageCircle, CheckCircle, Clock, AlertCircle, Plus, Sparkles, Palette, Zap, Send, Calendar } from 'lucide-react';
import { editRequestsService, EditRequest } from '@/services/editRequestsService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { initializeWordPressContext, WordPressConfig, listenForPassportMessages } from '@/utils/wordpressIntegration';

const DesignerPanel = () => {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig | null>(null);
  const [initializationStatus, setInitializationStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const queryClient = useQueryClient();

  // useEffect for WordPress integration
  useEffect(() => {
    console.log('Designer Panel: Initializing WordPress integration');
    
    const config = initializeWordPressContext();
    if (config) {
      setWordpressConfig(config);
      setInitializationStatus('ready');
      console.log('Designer Panel: WordPress integration ready');
    } else {
      console.log('Designer Panel: No WordPress config, will use user profile fallback');
      setInitializationStatus('ready'); // Still allow fallback to user profile
    }

    // Listen for WordPress configuration changes
    const handleConfigChange = (event: CustomEvent) => {
      console.log('Designer Panel: WordPress config changed:', event.detail);
      setWordpressConfig(event.detail);
    };

    // Listen for Passport messages
    const cleanupPassport = listenForPassportMessages((message) => {
      console.log('Designer Panel: Received Passport message:', message);
      
      if (message.type === 'lef-config-update' && message.projectId) {
        setWordpressConfig({
          projectId: message.projectId,
          userRole: message.data?.role || 'designer'
        });
      }
    });

    window.addEventListener('lef-config-changed', handleConfigChange as EventListener);

    return () => {
      window.removeEventListener('lef-config-changed', handleConfigChange as EventListener);
      cleanupPassport();
    };
  }, []);

  // userProfile query
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

  const effectiveProjectId = wordpressConfig?.projectId || userProfile?.project_id;

  // requests query
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['editRequests', statusFilter, pageFilter, searchQuery, effectiveProjectId],
    queryFn: () => editRequestsService.getEditRequests({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page_url: pageFilter === 'all' ? undefined : pageFilter,
      search: searchQuery || undefined,
      project_id: effectiveProjectId || '',
    }),
    enabled: !!effectiveProjectId && initializationStatus === 'ready',
  });

  const uniquePages = [...new Set(requests.map(req => req.page_url))];

  // mutations
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      editRequestsService.updateEditRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editRequests'] });
    },
  });

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
      case 'open': return 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 shadow-sm';
      case 'in-progress': return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm';
      case 'resolved': return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 shadow-sm';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-sm';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'in-progress': return <Clock className="w-3.5 h-3.5" />;
      case 'resolved': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <MessageCircle className="w-3.5 h-3.5" />;
    }
  };

  // handler functions
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

  if (initializationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-xl font-semibold text-slate-700 mb-2">Initializing Designer Panel</div>
          <div className="text-sm text-slate-500">Connecting to WordPress...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm p-8">
          <CardContent className="text-center">
            <User className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <div className="text-xl font-semibold text-slate-700 mb-2">Authentication Required</div>
            <div className="text-slate-500">Please sign in to access the designer panel.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!effectiveProjectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm p-8">
          <CardContent className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <div className="text-xl font-semibold text-slate-700 mb-2">No Project Found</div>
            <div className="text-sm text-slate-500 max-w-md">
              {wordpressConfig ? 'WordPress integration active but no project ID configured' : 'Please check your configuration or sign in again'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Glassmorphism */}
      <div className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Designer Studio
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {wordpressConfig ? `WordPress Integration Active (${wordpressConfig.userRole || 'designer'})` : 'Manage client feedback'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl border-white/20 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                    <Globe className="w-4 h-4 mr-2" />
                    Project
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6 rounded-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 text-lg">Current Project</h4>
                    <p className="text-sm text-slate-600">
                      {wordpressConfig ? 'Loaded from WordPress via Passport Portal' : 'From user profile'}
                    </p>
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-2xl border border-slate-100">
                      <code className="text-sm font-mono text-slate-800 break-all">{effectiveProjectId}</code>
                    </div>
                    {wordpressConfig && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        WordPress Bridge Active
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" onClick={signOut} size="sm" className="rounded-2xl border-white/20 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <Card className="mb-8 rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-2xl border-slate-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="rounded-2xl border-slate-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                  <SelectItem value="all">All Pages</SelectItem>
                  {uniquePages.map(page => (
                    <SelectItem key={page} value={page}>{page}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Request Cards */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-6"></div>
              <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-slate-600 text-lg">Loading requests...</p>
          </div>
        ) : error ? (
          <Card className="rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error loading requests</h3>
              <p className="text-slate-600">{error.message}</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-800 mb-3">No requests found</h3>
              <p className="text-slate-600">No edit requests match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request: EditRequest) => (
              <Card 
                key={request.id} 
                className="rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/95 hover:-translate-y-1 group"
                onClick={() => openRequestDialog(request)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {request.page_url}
                      </p>
                      <div className="flex items-center space-x-3">
                        <Badge className={`text-xs rounded-full px-3 py-1.5 ${getStatusColor(request.status)} transition-all duration-300`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1.5 capitalize font-medium">{request.status.replace('-', ' ')}</span>
                        </Badge>
                        {request.replies && request.replies.length > 0 && (
                          <Badge variant="outline" className="text-xs rounded-full px-2.5 py-1 border-slate-200 bg-slate-50/80">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {request.replies.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {request.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                    {request.submitted_by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {request.submitted_by}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border-0 shadow-xl bg-white/95 backdrop-blur-xl p-0">
            {selectedRequest && (
              <div className="flex flex-col h-full">
                {/* Compact Header Section */}
                <div className="px-6 py-4 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 to-blue-50/80">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-800 mb-1 truncate">
                        {selectedRequest.page_url}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                        </div>
                        {selectedRequest.submitted_by && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{selectedRequest.submitted_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full px-3 py-1 text-xs ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize font-medium">{selectedRequest.status.replace('-', ' ')}</span>
                      </Badge>
                      
                      <Select
                        value={selectedRequest.status}
                        onValueChange={(value) => handleStatusChange(selectedRequest.id, value)}
                      >
                        <SelectTrigger className="w-36 h-8 rounded-xl border-slate-200/70 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-xl">
                          <SelectItem value="open">
                            <div className="flex items-center gap-2 text-xs">
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                              Open
                            </div>
                          </SelectItem>
                          <SelectItem value="in-progress">
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-blue-500" />
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              Resolved
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Compact Content Section */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {/* Original Request */}
                    <div className="bg-gradient-to-r from-slate-50/90 to-blue-50/90 rounded-xl p-4 border border-slate-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800">Original Request</h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-lg p-3">
                        {selectedRequest.message}
                      </p>
                    </div>

                    {/* Conversation */}
                    {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800">Conversation</h3>
                          <Badge variant="outline" className="rounded-full px-2 py-0.5 bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">
                            {selectedRequest.replies.length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {selectedRequest.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`flex gap-3 ${reply.from === 'designer' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] ${reply.from === 'designer' ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-xl px-4 py-2 ${
                                  reply.from === 'designer'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                    : 'bg-white border border-slate-200/70 text-slate-700'
                                }`}>
                                  <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                                    <User className="w-2.5 h-2.5" />
                                    <span className="font-medium">
                                      {reply.from === 'designer' ? 'You' : 'Client'}
                                    </span>
                                    <span className="text-xs opacity-60">
                                      {new Date(reply.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs leading-relaxed">{reply.message}</p>
                                </div>
                              </div>
                              
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                reply.from === 'designer' 
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 order-1' 
                                  : 'bg-gradient-to-br from-slate-100 to-slate-200 order-2'
                              }`}>
                                <User className={`w-3 h-3 ${reply.from === 'designer' ? 'text-white' : 'text-slate-600'}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Reply Section */}
                <div className="border-t border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-blue-50/50 px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">Add Reply</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyTexts[selectedRequest.id] || ''}
                      onChange={(e) => setReplyTexts(prev => ({
                        ...prev,
                        [selectedRequest.id]: e.target.value
                      }))}
                      className="rounded-xl border-slate-200/70 bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-300 min-h-[80px] text-sm resize-none"
                      rows={3}
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleReplySubmit(selectedRequest.id)}
                        disabled={!replyTexts[selectedRequest.id]?.trim() || addReplyMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg text-white font-medium text-sm h-9"
                      >
                        <Send className="w-3 h-3 mr-2" />
                        {addReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DesignerPanel;
