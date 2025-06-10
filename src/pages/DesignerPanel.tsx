
import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { editRequestsService, EditRequest } from '@/services/editRequestsService';

const DesignerPanel = () => {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();

  // Load requests from Supabase
  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await editRequestsService.getEditRequests({
        page_url: pageFilter !== 'all' ? pageFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Error",
        description: "Failed to load edit requests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load requests on component mount and when filters change
  useEffect(() => {
    loadRequests();
  }, [statusFilter, pageFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredRequests = requests;
  const pendingCount = requests.filter(r => r.status !== 'resolved').length;
  const uniquePages = [...new Set(requests.map(r => r.page_url))];

  const getStatusBadge = (status: string) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status as keyof typeof colors] || colors['open'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-3 h-3" />;
      case 'in-progress': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const updateRequestStatus = async (id: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    try {
      await editRequestsService.updateEditRequest(id, { status: newStatus });
      await loadRequests(); // Refresh the list
      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus.replace('-', ' ')}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReply = async (id: string) => {
    if (replyText.trim()) {
      try {
        await editRequestsService.addReply(id, replyText.trim());
        await loadRequests(); // Refresh the list
        setActiveReply(null);
        setReplyText('');
        toast({
          title: "Reply Sent",
          description: "Your reply has been added to the request."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send reply. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInHours / (24 * 7))} week${Math.floor(diffInHours / (24 * 7)) > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading edit requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Client Edit Requests</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white border-orange-200 text-orange-700 px-3 py-1">
              {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-white shadow-sm border-0 shadow-gray-100">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Filters</h3>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                  <Select value={pageFilter} onValueChange={setPageFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Pages</SelectItem>
                      {uniquePages.map(page => (
                        <SelectItem key={page} value={page}>{page}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request List */}
          <div className="flex-1">
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="bg-white shadow-sm border-0 shadow-gray-100 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {request.section_id || 'General Request'}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${getStatusBadge(request.status)}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Page:</span> {request.page_url}
                        </p>
                        <p className="text-sm text-gray-500">{formatTimestamp(request.created_at)}</p>
                        {request.submitted_by && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">From:</span> {request.submitted_by}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed">{request.message}</p>
                    </div>

                    {/* Replies */}
                    {request.replies && request.replies.length > 0 && (
                      <div className="mb-4 border-l-2 border-gray-200 pl-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Replies:</p>
                        <div className="space-y-2">
                          {request.replies.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-800">{reply.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {reply.from} • {formatTimestamp(reply.timestamp)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-4">
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateRequestStatus(request.id, value as any)}
                      >
                        <SelectTrigger className="w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveReply(activeReply === request.id ? null : request.id)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </div>

                    {/* Inline Reply */}
                    {activeReply === request.id && (
                      <div className="border-t pt-4 animate-fade-in">
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReply(request.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Send Reply
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setActiveReply(null);
                              setReplyText('');
                            }}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MessageSquare className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerPanel;
