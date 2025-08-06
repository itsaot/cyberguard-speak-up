import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/hooks/useReports';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { reportsApi } from '@/services/reportsApi';
import EmojiReactions from '@/components/EmojiReactions';
import { useState } from 'react';
import { Flag, Trash2, Clock, AlertTriangle, Eye } from 'lucide-react';

interface ReportCardProps {
  report: any;
  onFlag: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  onReact: (reportId: string, emoji: string) => void;
  isAdmin: boolean;
}

const ReportCard = ({ report, onFlag, onDelete, onReact, isAdmin }: ReportCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{report.title || 'Incident Report'}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getSeverityColor(report.severity)}>
                {report.severity || 'Unknown'} Priority
              </Badge>
              <Badge variant="outline">
                {report.type}
              </Badge>
              {report.flagged && (
                <Badge variant="destructive">
                  <Flag className="w-3 h-3 mr-1" />
                  Flagged
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showDetails ? 'Hide' : 'Details'}
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFlag(report._id)}
                  disabled={report.flagged}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Flag
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(report._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4">
          {report.description.length > 150 && !showDetails
            ? `${report.description.substring(0, 150)}...`
            : report.description}
        </p>

        {showDetails && (
          <div className="space-y-4 border-t pt-4">
            {report.location && (
              <div>
                <strong>Location:</strong> {report.location}
              </div>
            )}
            {report.platform && (
              <div>
                <strong>Platform:</strong> {report.platform}
              </div>
            )}
            {report.evidence && (
              <div>
                <strong>Evidence:</strong> {report.evidence}
              </div>
            )}
            <div>
              <strong>Status:</strong> {report.status || 'Pending'}
            </div>
            <div>
              <strong>Submitted:</strong> {new Date(report.createdAt).toLocaleString()}
            </div>
            {report.isAnonymous && (
              <Badge variant="secondary">Anonymous Report</Badge>
            )}
          </div>
        )}

        <Separator className="my-4" />
        
        <EmojiReactions
          reactions={report.reactions || []}
          onReact={async (emoji) => await onReact(report._id, emoji)}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportsView = () => {
  const { user } = useAuth();
  const { reports, flaggedReports, isLoading, flagReport, deleteReport, reactToReport } = useReports();
  const { lastUpdate } = useRealTimeSync(10000);
  const isAdmin = user?.isAdmin || (user as any)?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Reports</p>
                <p className="text-2xl font-bold text-red-600">{flaggedReports.length}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(lastUpdate).toLocaleTimeString()}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Reports</h2>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">No incident reports have been submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onFlag={flagReport}
              onDelete={deleteReport}
              onReact={reactToReport}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsView;