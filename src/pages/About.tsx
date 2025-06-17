import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { motion } from 'framer-motion';
import { 
  IconTruck, 
  IconClock24, 
  IconHeadset, 
  IconShieldCheck,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
  IconMapPin,
  IconPhone
} from '@tabler/icons-react';

const features = [
  {
    icon: <IconTruck className="w-6 h-6" />,
    title: "Free Shipping",
    description: "Free shipping on orders over ₹999"
  },
  {
    icon: <IconClock24 className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Round the clock customer service"
  },
  {
    icon: <IconHeadset className="w-6 h-6" />,
    title: "AI Assistant",
    description: "Smart shopping recommendations"
  },
  {
    icon: <IconShieldCheck className="w-6 h-6" />,
    title: "Secure Payments",
    description: "100% secure payment processing"
  }
];

const contactInfo = [
  {
    icon: <IconMapPin className="w-5 h-5" />,
    title: "Address",
    content: "123 Shopping Street, E-commerce City, 12345"
  }, 
  {
    icon: <IconPhone className="w-5 h-5" />,
    title: "Phone",
    content: "+91 9392273983"
  },
  {
    icon: <IconMail className="w-5 h-5" />,
    title: "Email",
    content: "bonthujayaram57@gmail.com"
  }
];

const socialLinks = [
  {
    icon: <IconBrandGithub className="w-5 h-5" />,
    href: "https://github.com/Bonthujayaram",
    label: "GitHub"
  },
  {
    icon: <IconBrandLinkedin className="w-5 h-5" />,
    href: "",
    label: "LinkedIn"
  },
  {
    icon: <IconBrandTwitter className="w-5 h-5" />,
    href: "https://twitter.com",
    label: "Twitter"
  }
];

function ContactForm() {
  const [state, handleSubmit] = useForm("xeokgnne");

  if (state.succeeded) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20"
      >
        <h3 className="text-2xl font-semibold text-green-400 mb-3">
          Thank you for your message!
        </h3>
        <p className="text-green-300">
          We'll get back to you as soon as possible.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            placeholder="your.email@example.com"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-2 text-red-400" />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-200 mb-2">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          name="subject"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          placeholder="What's this about?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
          placeholder="Tell us how we can help..."
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-2 text-red-400" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export const About = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to EcoShop
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your one-stop destination for a modern shopping experience powered by artificial intelligence.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* About Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Our Story</h2>
              <p className="text-gray-300 leading-relaxed">
                EcoShop was founded with a vision to revolutionize online shopping through the power of artificial intelligence. 
                We believe in making shopping not just convenient, but truly personalized and intelligent.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our AI-powered platform learns from your preferences to provide tailored recommendations, 
                while our commitment to customer service ensures you always have the support you need.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                To create the most intuitive and personalized shopping experience by leveraging cutting-edge AI technology. 
                We're committed to making online shopping more efficient, enjoyable, and accessible for everyone.
              </p>
              <div className="flex gap-4 pt-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all duration-200"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Get in Touch</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-8">
                <ContactForm />
              </div>
            </div>

            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{info.title}</h3>
                      <p className="text-gray-400">{info.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 