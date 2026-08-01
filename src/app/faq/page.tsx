"use client";

import Image from "next/image";
import Button from "../../components/common/Button";
import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const handleGetHelp = () => {
    router.push("/contact");
  };

  const handleFindTutor = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/tutors");
    }
  };

  const quickAnswers = [
    "How do I get started? Create account → Browse tutors → Book trial session",
    "What equipment needed? Computer/tablet with webcam and stable internet",
    "Session cost? £25-£60/hour, trial sessions from £10",
    "Are tutors qualified? Yes, all DBS-checked with teaching qualifications",
    "Can I reschedule? Yes, up to 24 hours before session",
    "Refund policy? Money-back guarantee on first session",
  ];

  const faqs = [
    {
      question: "How do I get started with Skill Space?",
      answer:
        "Getting started is simple. Browse our tutoring subjects and learning plans, then book an introductory session to find the right support for your child.",
    },
    {
      question: "How do learning memberships work?",
      answer:
        "Our memberships provide ongoing support alongside access to learning resources, webinars, and parent guidance designed to support long-term learning progress.",
    },
    {
      question: "What subjects do you offer?",
      answer:
        "We provide support across a wide range of subjects including Maths, English, Science, GCSE preparation, A-Level support, study skills, and more.",
    },
    {
      question: "What age groups do you support?",
      answer:
        "We support learners across primary, secondary, GCSE, and A-Level stages, with tutoring tailored to different ages and academic levels.",
    },
    {
      question: "How do I monitor my child's progress?",
      answer:
        "Tutors provide regular feedback and progress updates to help families understand how learners are developing in confidence, understanding, and academic progress.",
    },
    {
      question: "Do you support students with SEND needs?",
      answer:
        "Yes. We aim to provide supportive and inclusive learning experiences for students with a range of additional learning and SEND needs.",
    },
    {
      question: "How long are tutoring sessions?",
      answer:
        "Most tutoring sessions are one hour long, allowing time for focused learning, questions, and personalised support.",
    },
    {
      question: "How are tutors matched with learners?",
      answer:
        "We carefully match learners with tutors based on subject needs, learning goals, and the type of support that will help them feel confident and engaged.",
    },
    {
      question: "What is included in a learning membership?",
      answer:
        "Learning memberships may include one-to-one tutoring sessions, webinars, study resources, parent-guidance, and access to additional learning support materials.",
    },
    {
      question: "Can parents access support and resources too?",
      answer:
        "Yes. Skill Space also provides guidance, webinars, and resources designed to help parents support their child's learning and wellbeing.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-4">
        {/* Main Hero Section - Home page style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Left Content */}
          <div>
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              FREQUENTLY ASKED
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#191919] mb-6 leading-tight">
              Get Quick Answers To Your Questions
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Find instant answers to common questions about our tutoring
              platform, booking process, pricing, and more. We're here to make
              learning simple.
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-[#7AC2F9] focus:outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Quick Answers Cards */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {quickAnswers.slice(0, 4).map((answer, index) => (
                <div key={index} className="bg-[#F8F9FA] p-4 rounded-xl">
                  <p className="text-sm text-gray-700">{answer}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-end">
              <div className="flex flex-row gap-4">
                <Button
                  onClick={handleFindTutor}
                  className="!bg-[#7AC2F9] !text-[#191919] hover:!bg-[#6AB4ED] !border-[#7AC2F9]"
                >
                  Find Your Tutor
                </Button>
                <Button
                  onClick={handleGetHelp}
                  className="!bg-[#191919] !text-white hover:!bg-gray-800 !border-[#191919]"
                >
                  Get Help
                </Button>
              </div>
            </div>
          </div>

          {/* Right Image with floating elements */}
          <div className="relative">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/images/stat-right.png"
                alt="FAQ Support"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* FAQ List Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No questions found matching your search.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-[#E9E2FF] rounded-2xl shadow-lg hover:shadow-xl hover:border-[#7AC2F9] transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition rounded-2xl"
                    >
                      <span className="text-lg font-bold text-[#191919] pr-8">
                        {faq.question}
                      </span>
                      {openItems.includes(index) ? (
                        <ChevronUp className="w-6 h-6 text-[#7AC2F9] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.includes(index) && (
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-[#E9E2FF] pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#E9E2FF] to-[#F0F4FF] rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <MessageCircle className="w-16 h-16 text-[#7AC2F9] mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-bold text-[#191919] mb-6">
                Still Need Help?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our friendly support team is
                here to help you get started.
              </p>

              {/* Help Options */}
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border-2 border-[#E9E2FF]">
                  <MessageCircle className="w-8 h-8 text-[#7AC2F9] mx-auto mb-3" />
                  <h4 className="font-bold text-[#191919] mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600">
                    Get instant answers from our support team
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-[#E9E2FF]">
                  <HelpCircle className="w-8 h-8 text-[#7AC2F9] mx-auto mb-3" />
                  <h4 className="font-bold text-[#191919] mb-2">Help Center</h4>
                  <p className="text-sm text-gray-600">
                    Browse our comprehensive help guides
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-[#E9E2FF]">
                  <CheckCircle className="w-8 h-8 text-[#7AC2F9] mx-auto mb-3" />
                  <h4 className="font-bold text-[#191919] mb-2">Quick Start</h4>
                  <p className="text-sm text-gray-600">
                    Step-by-step getting started guide
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex flex-row gap-4">
                  <Button
                    onClick={handleGetHelp}
                    className="!bg-[#7AC2F9] !text-[#191919] hover:!bg-[#6AB4ED] !border-[#7AC2F9]"
                  >
                    Contact Support
                  </Button>
                  <Button
                    onClick={handleFindTutor}
                    className="!bg-[#191919] !text-white hover:!bg-gray-800 !border-[#191919]"
                  >
                    Start Learning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
