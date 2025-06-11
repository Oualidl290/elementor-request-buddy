
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, Filter, Search, User, LogOut, Globe } from 'lucide-react';
import { editRequestsService, EditRequest } from '@/services/editRequestsService';
import { useAuth } from '@/contexts/AuthContext';

const DesignerPanel = () => {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
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
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Please sign in to access the designer panel.</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Designer Panel</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  Welcome, {user.email}
                </p>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {userProfile.project_id}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Page</label>
                <Select value={pageFilter} onValueChange={setPageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {uniquePages.map(page => (
                      <SelectItem key={page} value={page}>{page}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Your Project ID</h3>
                <p className="text-sm text-blue-700">
                  Share this ID with clients so they can submit feedback: 
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded ml-2">
                    {userProfile.project_id}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests */}
        {isLoading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading requests: {error.message}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' && pageFilter === 'all' && !searchQuery
                  ? 'No edit requests have been submitted for your project yet.'
                  : 'No requests match your current filters.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: EditRequest) => (
              <Card key={request.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.page_url}</CardTitle>
                      <CardDescription>
                        {request.section_id && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                            Section: {request.section_id}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </span>
                        {request.submitted_by && (
                          <span className="text-xs text-gray-500 ml-2">
                            by {request.submitted_by}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Request:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
                  </div>

                  {/* Replies */}
                  {request.replies && request.replies.length > 0 && (
                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="replies">
                        <AccordionTrigger>
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Replies ({request.replies.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {request.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className={`p-3 rounded-lg ${
                                  reply.from === 'designer'
                                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                    : 'bg-gray-50 border-l-4 border-l-gray-400'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium text-sm">
                                    {reply.from === 'designer' ? 'Designer' : 'Client'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Add Reply */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Add Reply:</h4>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyTexts[request.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={() => handleReplySubmit(request.id)}
                        disabled={!replyTexts[request.id]?.trim() || addReplyMutation.isPending}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerPanel;
