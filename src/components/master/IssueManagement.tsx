import React, { useState, useEffect } from 'react';
import { useToast } from '../common/Toast';
import { Table, Button, Modal, Card } from '../ui';
import MediaViewer from '../common/MediaViewer';
import { issuesApi } from '../../services/api';
import type { TableColumn, Issue } from '../../types';
import {
  Eye,
  MessageSquare,
  MapPin,

  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Image,
  Video,
  FileText
} from 'lucide-react';

const IssueManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  // const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });
  const [statistics, setStatistics] = useState({
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    closedIssues: 0
  });

  useEffect(() => {
    loadIssues();
    loadStatistics();
  }, [filters]);

  // Mock data for testing (remove this when backend is ready)
  useEffect(() => {
    if (issues.length === 0) {
      const mockIssues: Issue[] = [
        {
          id: '1',
          ticketNumber: 'ISS-2025-000001',
          title: 'Broken Street Light',
          description: 'Street light on Main Street is not working',
          category: 'INFRASTRUCTURE',
          status: 'PENDING',
          priority: 'MEDIUM',
          agentId: 'AGENT001',
          agentName: 'John Doe',
          agentFirstName: 'John',
          agentLastName: 'Doe',
          agentPhone: '+91 9876543210',
          submissionDate: new Date().toISOString(),
          address: 'Near Bus Stand, Main Road',
          area: 'Sector 15',
          village: 'Rampur',
          district: 'Ghaziabad',
          latitude: 28.6139,
          longitude: 77.2090,
          location: {
            address: 'Near Bus Stand, Main Road',
            latitude: 28.6139,
            longitude: 77.2090
          },
          attachments: [
            {
              id: '1',
              type: 'IMAGE',
              url: 'https://picsum.photos/800/600?random=1',
              filename: 'pothole-image.jpg'
            },
            {
              id: '2',
              type: 'IMAGE',
              url: 'https://picsum.photos/800/600?random=2',
              filename: 'road-damage.jpg'
            }
          ],
          comments: []
        }
      ];
      setIssues(mockIssues);
      setStatistics({
        totalIssues: 1,
        openIssues: 1,
        inProgressIssues: 0,
        resolvedIssues: 0,
        closedIssues: 0
      });
    }
  }, []);

  const loadIssues = async () => {
    // setLoading(true);
    try {
      const response = await issuesApi.getAll(filters);
      if (response.success) {
        // Backend returns a Page object, so we need to extract the content
        setIssues(Array.isArray(response.data.content) ? response.data.content : []);
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
      setIssues([]); // Set empty array on error
      showError('Failed to load issues', 'Please try again.');
    } finally {
      // setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await issuesApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Keep default statistics on error
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      const response = await issuesApi.updateStatus(issueId, newStatus);
      if (response.success) {
        showSuccess('Status updated successfully!');
        loadIssues();
        loadStatistics();
        if (selectedIssue?.id === issueId) {
          setSelectedIssue({ ...selectedIssue, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status', 'Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !newComment.trim()) return;

    try {
      const response = await issuesApi.addComment(selectedIssue.id, newComment);
      if (response.success) {
        showSuccess('Comment added successfully!');
        setNewComment('');
        // Reload issue details
        const updatedIssue = await issuesApi.getById(selectedIssue.id);
        if (updatedIssue.success) {
          setSelectedIssue(updatedIssue.data);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showError('Failed to add comment', 'Please try again.');
    }
  };

  const handleViewMedia = (issue: Issue, mediaIndex: number = 0) => {
    setSelectedIssue(issue);
    setSelectedMediaIndex(mediaIndex);
    setShowMediaViewer(true);
  };

  const getMediaIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="w-4 h-4 text-gray-500" />;

    const type = fileType.toUpperCase();

    // Handle different image formats
    if (type === 'IMAGE' || type.includes('IMAGE') ||
        ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'BMP'].includes(type)) {
      return <Image className="w-4 h-4 text-blue-600" />;
    }

    // Handle different video formats
    if (type === 'VIDEO' || type.includes('VIDEO') ||
        ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'WEBM'].includes(type)) {
      return <Video className="w-4 h-4 text-green-600" />;
    }

    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: TableColumn<Issue>[] = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      render: (ticketNumber) => (
        <span className="font-mono text-sm font-medium">{ticketNumber}</span>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      render: (description) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={description}>
            {description || 'No description'}
          </p>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location Details',
      render: (_, issue) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900">
            {issue.address && (
              <div className="truncate" title={issue.address}>
                <strong>Address:</strong> {issue.address}
              </div>
            )}
            {issue.area && (
              <div className="truncate" title={issue.area}>
                <strong>Area:</strong> {issue.area}
              </div>
            )}
            {issue.village && (
              <div className="truncate" title={issue.village}>
                <strong>Village:</strong> {issue.village}
              </div>
            )}
            {issue.district && (
              <div className="truncate" title={issue.district}>
                <strong>District:</strong> {issue.district}
              </div>
            )}
            {!issue.address && !issue.area && !issue.village && !issue.district && (
              <span className="text-gray-400 text-sm">No location data</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (priority) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      )
    },
    {
      key: 'agentName',
      label: 'Agent',
      sortable: true
    },
    {
      key: 'submissionDate',
      label: 'Submitted',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: 'attachments',
      label: 'Media',
      render: (attachments, issue) => {
        if (!attachments || attachments.length === 0) {
          return (
            <div className="flex items-center space-x-1 text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="text-xs">No Media</span>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewMedia(issue, 0)}
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
              title={`View ${attachments.length} media file(s)`}
            >
              {getMediaIcon(attachments[0]?.type)}
              <span className="text-xs font-medium">{attachments.length}</span>
              <span className="text-xs">Media</span>
            </Button>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, issue) => (
        <div className="flex space-x-1">
          <Button
            variant="info"
            size="sm"
            onClick={() => setViewingIssue(issue)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedIssue(issue)}
            title="Manage Issue"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Issue Management</h1>
          <p className="text-gray-600">Manage and resolve issues reported by agents</p>
        </div>
        {/* Export button removed as requested */}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold">{statistics.totalIssues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold">{statistics.openIssues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{statistics.inProgressIssues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold">{statistics.resolvedIssues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold">{statistics.closedIssues}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="UTILITIES">Utilities</option>
              <option value="SAFETY">Safety</option>
              <option value="ENVIRONMENT">Environment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Issues Table */}
      <Table
        data={issues}
        columns={columns}

        searchable
        searchPlaceholder="Search issues..."
      />

      {/* Issue Details Modal */}
      <Modal
        isOpen={!!viewingIssue}
        onClose={() => setViewingIssue(null)}
        title="Issue Details"
        size="xl"
      >
        {viewingIssue && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ticket Number</label>
                <p className="font-mono text-lg font-bold">{viewingIssue.ticketNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingIssue.status)}`}>
                  {viewingIssue.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <p className="text-lg font-semibold">{viewingIssue.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-700 whitespace-pre-wrap">{viewingIssue.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p>{viewingIssue.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(viewingIssue.priority)}`}>
                  {viewingIssue.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Agent</label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  <p className="font-semibold">{viewingIssue.agentFirstName} {viewingIssue.agentLastName}</p>
                  <p className="text-sm text-gray-600">ID: {viewingIssue.agentId}</p>
                  <p className="text-sm text-gray-600">Phone: {viewingIssue.agentPhone}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p>{new Date(viewingIssue.submissionDate).toLocaleString()}</p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {viewingIssue.location?.address || viewingIssue.address || 'Address not specified'}
                  </span>
                  {(viewingIssue.area || viewingIssue.village || viewingIssue.district) && (
                    <span className="text-sm text-gray-600 mt-1">
                      {[
                        viewingIssue.area && `Area: ${viewingIssue.area}`,
                        viewingIssue.village && `Village: ${viewingIssue.village}`,
                        viewingIssue.district && `District: ${viewingIssue.district}`
                      ].filter(Boolean).join(' • ')}
                    </span>
                  )}
                  {!viewingIssue.location?.address && !viewingIssue.address && !viewingIssue.area && !viewingIssue.village && !viewingIssue.district && (
                    <span className="text-gray-500 italic">Location not available</span>
                  )}
                </div>
                {((viewingIssue.location?.latitude && viewingIssue.location?.longitude) ||
                  (viewingIssue.latitude && viewingIssue.longitude)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lat = viewingIssue.location?.latitude || viewingIssue.latitude;
                      const lng = viewingIssue.location?.longitude || viewingIssue.longitude;
                      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
                    }}
                  >
                    View on Map
                  </Button>
                )}
              </div>
            </div>

            {/* Attachments */}
            {viewingIssue.attachments && viewingIssue.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {viewingIssue.attachments.map((attachment) => (
                    <div key={attachment.id} className="border rounded-lg p-2">
                      {attachment.type === 'IMAGE' ? (
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => window.open(attachment.url, '_blank')}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                             onClick={() => window.open(attachment.url, '_blank')}>
                          <div className="text-center">
                            <div className="text-2xl mb-2">🎥</div>
                            <p className="text-sm text-gray-600">Video</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1 truncate">{attachment.filename}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {viewingIssue.comments && viewingIssue.comments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {viewingIssue.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{comment.createdBy}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Issue Management Modal */}
      <Modal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title="Manage Issue"
        size="lg"
      >
        {selectedIssue && (
          <div className="space-y-6">
            {/* Issue Header */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold">{selectedIssue.ticketNumber}</h3>
              <p className="text-gray-600">{selectedIssue.title}</p>
            </div>

            {/* Status Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <div className="flex space-x-2">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedIssue.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedIssue.id, status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>

            {/* Existing Comments */}
            {selectedIssue.comments && selectedIssue.comments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Comments</label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedIssue.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{comment.createdBy}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Media Viewer */}
      {selectedIssue && selectedIssue.attachments && (
        <MediaViewer
          media={selectedIssue.attachments}
          isOpen={showMediaViewer}
          onClose={() => setShowMediaViewer(false)}
          initialIndex={selectedMediaIndex}
        />
      )}
    </div>
  );
};

export default IssueManagement;
