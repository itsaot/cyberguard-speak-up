import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    severity: '',
    anonymous: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://cybergaurd-backend-2.onrender.com/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reportedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          type: '',
          location: '',
          description: '',
          severity: '',
          anonymous: true,
        });
        
        toast({
          title: "Report Submitted",
          description: "Your report has been submitted successfully. Our admin team will review it shortly.",
        });
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-warning mr-3" />
          <h1 className="text-3xl font-bold text-foreground">Report an Incident</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your safety matters. Report bullying incidents anonymously and securely. 
          All reports are reviewed by our admin team.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="mb-6 border-accent bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent-foreground">Your Privacy is Protected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All reports are submitted anonymously. We do not collect or store any personally 
                identifiable information unless you choose to provide it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Incident Report Form</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Incident Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type of Incident *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Bullying</SelectItem>
                  <SelectItem value="verbal">Verbal Bullying</SelectItem>
                  <SelectItem value="social">Social/Relational Bullying</SelectItem>
                  <SelectItem value="cyber">Cyberbullying</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor incident</SelectItem>
                  <SelectItem value="medium">Medium - Ongoing issue</SelectItem>
                  <SelectItem value="high">High - Serious incident</SelectItem>
                  <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Where did this incident occur? (e.g., school, workplace, online)"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Incident Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe what happened. Include as much detail as you feel comfortable sharing..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.type || !formData.severity || !formData.description}
              >
                {isSubmitting ? (
                  "Submitting Report..."
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Anonymous Report
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By submitting this report, you acknowledge that the information provided is accurate 
              to the best of your knowledge and will be reviewed by our admin team.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Help Resources */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            If you're in immediate danger or need urgent support:
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Emergency Services: 911</li>
            <li>• Crisis Text Line: Text HOME to 741741</li>
            <li>• National Suicide Prevention Lifeline: 988</li>
            <li>• Anti-Bullying Hotline: 1-800-273-8255</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIncident;