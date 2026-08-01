'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, Clock, Facebook, GraduationCap, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Users } from 'lucide-react';

const pathways = [
  { title: 'Tutoring Enquiries', description: 'Find out more about tutoring and support options.', icon: Users },
  { title: 'Courses & Webinars', description: 'Questions about upcoming events and learning opportunities.', icon: CalendarDays },
  { title: 'Schools & Partnerships', description: 'Discuss workshops, projects, and partnership opportunities.', icon: Building2 },
  { title: 'Become a Tutor', description: 'Get in touch and send supporting documentation.', icon: GraduationCap },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    consent: false,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert("Thank you. We'll get back to you within 2 working days.");
    setFormData({ name: '', email: '', subject: '', message: '', consent: false });
  };

  return (
    <main className="min-h-screen bg-[#F5FBFF] text-[#111827]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
          <div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Contact Us</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              We're here to help. Whether you have a question about tutoring, courses, webinars, SEND support, or becoming a tutor, we'd love to hear from you.
            </p>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-tl-[5rem] bg-[#EAF6FF] md:min-h-[390px]">
            <Image src="/assets/images/heroImg.png" alt="" fill className="object-cover object-top" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black">How can we help?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {pathways.map(({ title, description, icon: Icon }) => (
            <div key={title} className="border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF6FF] text-[#2E9DDA]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
              {/* <ArrowRight className="mx-auto mt-5 h-4 w-4 text-[#2E9DDA]" /> */}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.9fr_1.4fr] lg:px-8">
        <aside className="border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black">Our contact details</h2>
          <div className="mt-6 space-y-5">
            {[
              [Mail, 'Email', 'hello@skill-space.co.uk'],
              [Phone, 'Telephone', '020 7993 9245'],
              [MapPin, 'Location', 'Unit 7, The IO Centre, Lea Road, Waltham Abbey, EN9 1AS'],
              [Clock, 'Office Hours', 'Monday - Friday, 9:00am - 5:00pm'],
            ].map(([Icon, label, value]) => (
              <div key={label as string} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7AC2F9] text-[#191919]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{label as string}</p>
                  <p className="text-sm leading-6 text-gray-600">{value as string}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            {[Linkedin, Instagram, Facebook].map((Icon, index) => (
              <Link key={index} href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7AC2F9] text-[#191919]">
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black">Send us a message</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="Your name"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7AC2F9]"
            />
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="Email address"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7AC2F9]"
            />
          </div>
          <select
            required
            value={formData.subject}
            onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
            className="mt-4 w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7AC2F9]"
          >
            <option value="">What is your enquiry about?</option>
            <option value="tutoring">Tutoring enquiries</option>
            <option value="courses-webinars">Courses and webinars</option>
            <option value="send">SEND support</option>
            <option value="partnerships">Schools and partnerships</option>
            <option value="tutor-recruitment">Become a tutor</option>
          </select>
          <textarea
            required
            rows={6}
            value={formData.message}
            onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            placeholder="Your message"
            className="mt-4 w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7AC2F9]"
          />
          <label className="mt-4 flex gap-3 text-sm leading-6 text-gray-600">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(event) => setFormData({ ...formData, consent: event.target.checked })}
              className="mt-1 h-4 w-4"
            />
            <span>I agree to the Privacy Policy and consent to my data being used to respond to my enquiry.</span>
          </label>
          <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#7AC2F9] px-5 py-3 text-sm font-bold text-[#191919] hover:bg-[#6AB4ED]">
            Send message <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 bg-[#0F76B7] p-8 text-white md:grid-cols-2">
          <div className="flex gap-4">
            <MessageCircle className="h-10 w-10 flex-shrink-0 text-[#D9F0FF]" />
            <div>
              <h2 className="text-2xl font-black">Not sure where to start?</h2>
              <p className="mt-2 text-sm leading-6 text-white/80">Our team is happy to help point you in the right direction.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="h-10 w-10 flex-shrink-0 text-[#D9F0FF]" />
            <div>
              <h2 className="text-2xl font-black">We aim to respond within 2 working days.</h2>
              <p className="mt-2 text-sm leading-6 text-white/80">Thank you for getting in touch. We look forward to hearing from you.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
