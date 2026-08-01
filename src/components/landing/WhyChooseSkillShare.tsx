'use client';

import { BookOpen, Users, Clock, Heart } from 'lucide-react';

export default function WhyChooseSkillShare() {
  const features = [
    {
      title: 'Courses and Tutoring in One Place',
      description: 'Academic learning, wellbeing, life skills, and parent support available in one platform.',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Designed by Specialists',
      description: 'Created by educators, youth workers, behaviour mentors, and safeguarding experts.',
      icon: Users,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Flexible Learning',
      description: 'Live tutoring, recorded webinars, and self-paced courses.',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Parent-Friendly',
      description: 'Guides, tools, and clear progress tracking for your child.',
      icon: Heart,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Skill Share?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;re more than just an online learning platform. We&apos;re your partner in educational success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <div key={index} className="text-center">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}