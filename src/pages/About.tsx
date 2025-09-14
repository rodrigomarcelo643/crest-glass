import { Building, Target, Eye, Trophy, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Trophy,
      title: "Quality Excellence",
      description: "We use only premium materials and maintain the highest standards in all our work.",
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We listen, understand, and deliver beyond expectations.",
    },
    {
      icon: Award,
      title: "Expert Craftsmanship",
      description: "Our skilled team brings years of experience to every project, big or small.",
    },
  ];

  const goals = [
    "Deliver exceptional workmanship in every project",
    "Offer competitive and transparent pricing",
    "Expand our customer base through digital innovation",
    "Maintain comprehensive inventory for responsive service",
    "Continuously improve our products and services",
    "Build lasting relationships with our clients",
  ];

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <Building className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">About CREST</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your trusted partner in glass and aluminum solutions
        </p>
      </div>

      {/* Company Overview */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            CREST Glass & Aluminum Supply has been a leading provider of premium glass and aluminum 
            solutions for residential and commercial projects. Founded with a commitment to quality 
            and precision, we have grown to become a trusted name in the industry, serving clients 
            with innovative designs and expert craftsmanship.
          </p>
          <br />
          <p className="text-muted-foreground leading-relaxed">
            Our journey began with a simple vision: to transform spaces through the beauty and 
            functionality of glass and aluminum. Today, we continue to push boundaries, combining 
            traditional craftsmanship with modern technology to deliver solutions that exceed expectations.
          </p>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To provide high-quality glass and aluminum solutions that enhance both residential 
              and commercial spaces, while maintaining the highest standards of craftsmanship 
              and customer service.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To be the most trusted provider of glass and aluminum installation services in the 
              region, known for innovation, reliability, and exceptional customer satisfaction.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="glass-card text-center hover:scale-105 transition-transform">
              <CardHeader>
                <value.icon className="w-12 h-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Goals */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Our Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">{goal}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <div className="mt-12 glass-card p-8 text-center rounded-2xl gradient-primary">
        <h3 className="text-2xl font-bold mb-4 text-white">
          Let's Build Something Amazing Together
        </h3>
        <p className="text-white/90 mb-6">
          Ready to start your next project? We're here to help bring your vision to life.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center text-white/90 text-sm">
          <span>📞 +63 912 345 6789</span>
          <span className="hidden sm:inline">•</span>
          <span>📧 info@crestglass.com</span>
        </div>
      </div>
    </div>
  );
};

export default About;