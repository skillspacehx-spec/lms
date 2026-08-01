"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const Newsletter = () => {
  const sectionRef = useRef(null);
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
    } else {
      // Handle newsletter subscription
      alert("Thanks for subscribing!");
      setEmail("");
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Newsletter content animations
      gsap.from(".newsletter-title", {
        scrollTrigger: {
          trigger: ".newsletter-title",
          start: "top 80%",
        },
        opacity: 0,
        x: -100,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".newsletter-description", {
        scrollTrigger: {
          trigger: ".newsletter-description",
          start: "top 80%",
        },
        opacity: 0,
        x: -100,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".newsletter-form", {
        scrollTrigger: {
          trigger: ".newsletter-form",
          start: "top 80%",
        },
        opacity: 0,
        x: 100,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-16 text-white mt-12 md:mt-16 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <div className="relative w-full h-full">
          <img
            src="/assets/images/newsletter-bg.png"
            alt="Newsletter Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="newsletter-title text-2xl sm:text-3xl font-bold mb-2">
            Join Our Newsletter
          </h2>
          <p className="newsletter-description text-base sm:text-lg opacity-90 max-w-lg">
            Receive study tips, parenting guidance, and updates on new learning
            resources, courses, and educator training.{" "}
          </p>
        </div>

        <form
          className="newsletter-form flex-1 flex flex-col sm:flex-row bg-white p-1 rounded-lg max-w-lg w-full gap-2 sm:gap-0"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none text-gray-800 rounded-lg sm:rounded-l-lg sm:rounded-r-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-l-none font-semibold transition-colors hover:bg-black text-sm sm:text-base"
          >
            Subscribe Now
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
