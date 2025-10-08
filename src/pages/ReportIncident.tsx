import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    title: '',
    incidentType: '',
    platform: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today in YYYY-MM-DD format
    severity: 'medium',
    yourRole: '',
    evidence: '',
    anonymous: true,
    flagged: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // No authentication required for report submissions
      
      // Validate required fields before sending
      const requiredFields = ['incidentType', 'platform', 'description', 'yourRole'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        console.error('❌ Report POST - Missing required fields:', missingFields);
        toast({
          title: "Missing Fields",
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate description length (min 10 chars)
      if (formData.description.trim().length < 10) {
        console.error('❌ Report POST - Description too short');
        toast({
          title: "Description Too Short",
          description: "Please provide a description of at least 10 characters.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate yourRole enum
      const validRoles = ['target', 'bystander', 'reporter', 'other'];
      if (!validRoles.includes(formData.yourRole.toLowerCase())) {
        console.error('❌ Report POST - Invalid yourRole value');
        toast({
          title: "Invalid Role",
          description: "Please select a valid role.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate severity enum
      const validSeverities = ['low', 'medium', 'high'];
      if (!validSeverities.includes(formData.severity)) {
        console.error('❌ Report POST - Invalid severity value');
        toast({
          title: "Invalid Severity",
          description: "Please select a valid severity level.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const requestBody = {
        incidentType: formData.incidentType.trim(),
        platform: formData.platform.trim(),
        description: formData.description.trim(),
        date: formData.date, // YYYY-MM-DD format
        severity: formData.severity, // 'low', 'medium', or 'high'
        yourRole: formData.yourRole.toLowerCase(), // 'target', 'bystander', 'reporter', or 'other'
        evidence: formData.evidence.trim() || undefined,
        anonymous: formData.anonymous,
        flagged: formData.flagged,
        // Do not send: timestamps (backend handles them)
      };
      
      console.log('📝 Report POST - Request body:', requestBody);
       console.log('📝 Report POST - Body validation:', {
        incidentTypeValid: !!requestBody.incidentType,
        descriptionValid: !!requestBody.description,
        severityValid: !!requestBody.severity,
        platformValid: !!requestBody.platform,
        yourRoleValid: !!requestBody.yourRole,
        bodySize: JSON.stringify(requestBody).length
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      console.log('📡 Report POST - Headers being sent:', headers);

      const response = await fetch('https://cybergaurdapi.onrender.com/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📊 Report POST - Response status:', response.status);
      console.log('📊 Report POST - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Report POST - Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ Report POST - Parsed error:', errorData);
        } catch {
          console.error('❌ Report POST - Raw error text:', errorText);
        }
        
        // Specific error handling
        if (response.status === 400) {
          console.error('❌ Report POST - Bad Request Details:', {
            sentBody: requestBody,
            possibleIssues: ['Missing required fields', 'Invalid field values', 'Wrong data types']
          });
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Report POST - Success response:', responseData);
      
      // Reset form
      setFormData({
        title: '',
        incidentType: '',
        platform: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        severity: 'medium',
        yourRole: '',
        evidence: '',
        anonymous: true,
        flagged: false,
      });
      
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully. Our admin team will review it shortly.",
      });
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

  const handleInputChange = (field: string, value: string | boolean) => {
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
              <Label>Type of Incident *</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'physical', label: 'Physical Bullying', icon: '👊' },
                  { value: 'verbal', label: 'Verbal Bullying', icon: '💬' },
                  { value: 'social', label: 'Social/Relational', icon: '👥' },
                  { value: 'cyber', label: 'Cyberbullying', icon: '💻' },
                  { value: 'discrimination', label: 'Discrimination', icon: '⚖️' },
                  { value: 'harassment', label: 'Harassment', icon: '⚠️' },
                  { value: 'other', label: 'Other', icon: '📝' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('incidentType', type.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.incidentType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform/Location *</Label>
              <Input
                id="platform"
                placeholder="Where did this incident occur? (e.g., Instagram, school, workplace)"
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            {/* Your Role */}
            <div className="space-y-2">
              <Label htmlFor="yourRole">Your Role *</Label>
              <Select value={formData.yourRole} onValueChange={(value) => handleInputChange('yourRole', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="target">Target (I was bullied)</SelectItem>
                  <SelectItem value="bystander">Bystander (I witnessed it)</SelectItem>
                  <SelectItem value="reporter">Reporter (Someone told me)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Incident Description * (minimum 10 characters)</Label>
              <Textarea
                id="description"
                placeholder="Please describe what happened. Include as much detail as you feel comfortable sharing..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/10 characters minimum
              </p>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm">Additional Information (Optional)</h3>

              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence</Label>
                <Textarea
                  id="evidence"
                  placeholder="Description of any evidence (photos, messages, etc.)"
                  className="min-h-[80px]"
                  value={formData.evidence}
                  onChange={(e) => handleInputChange('evidence', e.target.value)}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => handleInputChange('anonymous', checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="text-sm">Submit anonymously</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flagged"
                    checked={formData.flagged}
                    onCheckedChange={(checked) => handleInputChange('flagged', checked as boolean)}
                  />
                  <Label htmlFor="flagged" className="text-sm">Flag for priority review</Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.incidentType || !formData.platform || !formData.description || !formData.yourRole || formData.description.length < 10}
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
            <li>• Emergency Services: 911 - 10111</li>
            <li>• Crisis Text Line: Text HOME to 741741</li>
            <li>• National Suicide Prevention Lifeline: 0861-322-322</li>
            <li>• Anti-Bullying Hotline: +27-808-168-9111</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIncident;
