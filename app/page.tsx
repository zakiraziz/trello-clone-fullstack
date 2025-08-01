"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Trello,
  ChevronDown,
  Monitor,
  Smartphone,
  Globe,
  BarChart2,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll to features if coming from sign-in
  useEffect(() => {
    if (window.location.hash === "#features") {
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const features = [
    {
      icon: CheckSquare,
      title: "Task Management",
      description: "Organize your tasks with intuitive drag-and-drop boards",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team in real-time",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with Next.js 15 for optimal performance",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Enterprise-grade security with Clerk authentication",
    },
  ];

  const stats = [
    { value: "10M+", label: "Users worldwide" },
    { value: "95%", label: "Customer satisfaction" },
    { value: "24/7", label: "Support available" },
    { value: "50+", label: "Integrations" },
  ];

  const platforms = [
    { icon: Monitor, name: "Web App" },
    { icon: Smartphone, name: "Mobile App" },
    { icon: Globe, name: "Browser Extensions" },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Organize work and life,{" "}
            <span className="text-blue-600">finally.</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            TrelloClone helps teams move work forward. Collaborate, manage
            projects, and reach new productivity peaks. From high rises to the
            home office, the way your team works is unique—accomplish it all
            with TrelloClone.
          </motion.p>

          {!isSignedIn ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <SignUpButton>
                <Button size="lg" className="text-lg px-8">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                onClick={() => {
                  const demoSection = document.getElementById("demo");
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Watch demo
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <div
              className="inline-flex flex-col items-center cursor-pointer"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="text-sm text-gray-500 mb-2">
                Explore features
              </span>
              <motion.div
                animate={{ y: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
              >
                <ChevronDown className="h-6 w-6 text-gray-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Everything you need to stay organized
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Powerful features to help your team collaborate and get more done.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                See it in action
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Watch how TrelloClone can transform the way your team works.
                Simple, flexible, and powerful enough to tackle any project.
              </p>
              <div className="space-y-4">
                {platforms.map((platform, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <platform.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:w-1/2 bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="aspect-video bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Interactive Demo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Experience the power of TrelloClone with our interactive demo
                  </p>
                  <Button variant="outline">Launch Demo</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
          >
            Trusted by teams worldwide
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="p-6">
                    <div className="text-yellow-400 mb-4">★★★★★</div>
                    <p className="text-gray-600 mb-4 italic">
                      "TrelloClone has completely transformed how our team
                      collaborates. We've seen a 40% increase in productivity
                      since switching."
                    </p>
                    <div className="font-medium">- Sarah Johnson, CEO</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of teams who are already using TrelloClone to organize
            their work.
          </motion.p>

          {!isSignedIn ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <SignUpButton>
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start your free trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Trello className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">TrelloClone</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© {new Date().getFullYear()} TrelloClone. All rights reserved.</span>
              <span>Built with Next.js & Clerk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}