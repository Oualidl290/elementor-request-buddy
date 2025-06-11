import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { editRequestsService, EditRequest } from '@/services/editRequestsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, MessageSquare, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const DesignerPanel = () => {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState({
    page_url: 'all',
    status: 'all',
    search: '',
    project_id: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const queryClient = useQueryClient();

  // Define queries and mutations
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['edit-requests', filters],
    queryFn: () => editRequestsService.getEditRequests(filters),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      editRequestsService.updateEditRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-requests'] });
      setSelectedRequest(null);
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ id, message, from }: { id: string; message: string; from: string }) =>
      editRequestsService.addReply(id, message, from),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-requests'] });
      setReplyMessage('');
    },
  });

  const handleStatusChange = (requestId: string, newStatus: string) => {
    updateRequestMutation.mutate({
      id: requestId,
      updates: { status: newStatus as 'open' | 'in-progress' | 'resolved' }
    });
  };

  const handleAddReply = () => {
    if (selectedRequest && replyMessage.trim()) {
      addReplyMutation.mutate({
        id: selectedRequest.id,
        message: replyMessage,
        from: 'designer'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Designer Panel</h1>
            <p className="text-gray-600">Manage client edit requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              {user?.email}
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Page URL</label>
                <Select value={filters.page_url} onValueChange={(value) => setFilters({ ...filters, page_url: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {Array.from(new Set(requests.map(r => r.page_url))).map(url => (
                      <SelectItem key={url} value={url}>{url}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project ID</label>
                <Input
                  placeholder="Filter by project..."
                  value={filters.project_id}
                  onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No edit requests found</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{request.page_url}</CardTitle>
                      {request.section_id && (
                        <CardDescription>Section: {request.section_id}</CardDescription>
                      )}
                      <CardDescription className="mt-2">
                        Project: {request.project_id || 'No project specified'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Select value={request.status} onValueChange={(value) => handleStatusChange(request.id, value)}>
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
                  <p className="text-gray-700 mb-4">{request.message}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      Created: {new Date(request.created_at).toLocaleDateString()}
                      {request.submitted_by && ` • By: ${request.submitted_by}`}
                    </div>
                    <div className="flex items-center gap-2">
                      {request.replies.length > 0 && (
                        <span>{request.replies.length} replies</span>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Request Details</DialogTitle>
                            <DialogDescription>
                              {request.page_url} - {request.section_id}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Original Request</h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
                            </div>
                            
                            {request.replies.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Replies</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {request.replies.map((reply) => (
                                    <div key={reply.id} className="bg-gray-50 p-3 rounded">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm">{reply.from}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(reply.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.message}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Add Reply</label>
                              <Textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply..."
                                rows={3}
                              />
                              <Button 
                                onClick={handleAddReply}
                                className="mt-2"
                                disabled={!replyMessage.trim() || addReplyMutation.isPending}
                              >
                                {addReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerPanel;
