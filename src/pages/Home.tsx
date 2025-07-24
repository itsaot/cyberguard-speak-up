import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, AlertTriangle, Users, Lock, Heart } from 'lucide-react';
import bullyingAwarenessBanner from '@/assets/bullying-awareness-banner.jpg';
import helpingHands from '@/assets/helping-hands.jpg';
import safeSpace from '@/assets/safe-space.jpg';

const Home = () => {
  const features = [
    {
      icon: Lock,
      title: 'Anonymous Reporting',
      description: 'Report incidents safely and anonymously without fear of retaliation.',
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Connect with others, share experiences, and find support in our community.',
    },
    {
      icon: Users,
      title: 'Admin Oversight',
      description: 'Trained administrators review and respond to all reports appropriately.',
    },
    {
      icon: Heart,
      title: 'Safe Space',
      description: 'A judgment-free environment where everyone can feel safe and supported.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={bullyingAwarenessBanner} 
            alt="Students standing together in solidarity against bullying" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-5xl font-bold text-foreground">CyberGuard</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A safe platform for reporting bullying incidents and finding community support. 
            Stand up, speak out, and help create safer spaces for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report">
              <Button size="lg" className="w-full sm:w-auto">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Report an Incident
              </Button>
            </Link>
            <Link to="/forum">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <MessageSquare className="h-5 w-5 mr-2" />
                Join the Discussion
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How CyberGuard Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides multiple ways to address bullying and create positive change in your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-4">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Take Action Today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're experiencing bullying, witnessing it, or want to support others, 
            CyberGuard provides the tools you need to make a difference.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <img 
                  src={helpingHands} 
                  alt="Helping hands representing support" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <CardContent className="text-center relative z-10">
                <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Report an Incident</h3>
                <p className="text-muted-foreground mb-4">
                  Safely and anonymously report bullying incidents. Your report will be reviewed by our admin team.
                </p>
                <Link to="/report">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <img 
                  src={safeSpace} 
                  alt="Safe space concept with protection" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <CardContent className="text-center relative z-10">
                <MessageSquare className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with others, share your experiences, and find support in our community forum.
                </p>
                <Link to="/forum">
                  <Button variant="outline" className="w-full">Join Discussion</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;