
import React, { useState } from 'react';
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditRequest {
  id: string;
  sectionName: string;
  pageUrl: string;
  clientMessage: string;
  attachedFiles: string[];
  timestamp: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

const mockRequests: EditRequest[] = [
  {
    id: '1',
    sectionName: 'Hero Section',
    pageUrl: '/homepage',
    clientMessage: 'Please change the main headline to "Transform Your Business Today" and make the button more prominent.',
    attachedFiles: ['reference-image.jpg'],
    timestamp: '2 hours ago',
    status: 'Open'
  },
  {
    id: '2',
    sectionName: 'About Us',
    pageUrl: '/about',
    clientMessage: 'The team photo needs to be updated with our new team member Sarah.',
    attachedFiles: ['new-team-photo.jpg', 'sarah-headshot.jpg'],
    timestamp: '1 day ago',
    status: 'In Progress'
  },
  {
    id: '3',
    sectionName: 'Contact Form',
    pageUrl: '/contact',
    clientMessage: 'Add a phone number field to the contact form please.',
    attachedFiles: [],
    timestamp: '3 days ago',
    status: 'Resolved'
  },
  {
    id: '4',
    sectionName: 'Services Grid',
    pageUrl: '/services',
    clientMessage: 'Update the pricing for our premium package to $299/month.',
    attachedFiles: [],
    timestamp: '1 week ago',
    status: 'Open'
  }
];

const DesignerPanel = () => {
  const [requests, setRequests] = useState<EditRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.clientMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPage = pageFilter === 'all' || request.pageUrl === pageFilter;
    
    return matchesSearch && matchesStatus && matchesPage;
  });

  const pendingCount = requests.filter(r => r.status !== 'Resolved').length;
  const uniquePages = [...new Set(requests.map(r => r.pageUrl))];

  const getStatusBadge = (status: string) => {
    const colors = {
      'Open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status as keyof typeof colors] || colors['Open'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3 h-3" />;
      case 'In Progress': return <Clock className="w-3 h-3" />;
      case 'Resolved': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const updateRequestStatus = (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const handleReply = (id: string) => {
    if (replyText.trim()) {
      // In a real app, this would send the reply
      console.log(`Reply to request ${id}:`, replyText);
      setActiveReply(null);
      setReplyText('');
    }
  };

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
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
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
                          <h3 className="font-semibold text-gray-900">{request.sectionName}</h3>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${getStatusBadge(request.status)}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Page:</span> {request.pageUrl}
                        </p>
                        <p className="text-sm text-gray-500">{request.timestamp}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed">{request.clientMessage}</p>
                    </div>

                    {/* Attached Files */}
                    {request.attachedFiles.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attached Files:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{file}</span>
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
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
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
