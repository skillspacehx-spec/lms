'use client';

import Link from 'next/link';
import { FileText, BookOpen, Brain, Users, Download } from 'lucide-react';
import Button from '../common/Button';

export default function FreeResources() {
  const resourceTypes = [
    {
      title: 'Parent Guides',
      description: 'Expert advice on supporting your child\'s learning journey',
      icon: Users
    },
    {
      title: 'Study Tips',
      description: 'Proven techniques to help students learn more effectively',
      icon: Brain
    },
    {
      title: 'Wellbeing Articles',
      description: 'Mental health and emotional support resources',
      icon: FileText
    },
    {
      title: 'Teen Communication',
      description: 'Building stronger relationships with your teenager',
      icon: BookOpen
    },
    {
      title: 'SEND Support Blogs',
      description: 'Specialist guidance for children with additional needs',
      icon: Download
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Free Articles and Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Access a wealth of expert content to support both parents and students on their learning journey
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {resourceTypes.map((resource, index) => {
            const IconComponent = resource.icon;
            
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm">
                  {resource.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button href="/resources" size="lg">
            Visit the Parent Hub
          </Button>
          <p className="text-gray-600 mt-4">
            All resources are completely free and available to all families
          </p>
        </div>
      </div>
    </section>
  );
}