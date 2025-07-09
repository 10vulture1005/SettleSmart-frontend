import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, User, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        phone: ''
      });
      setSubmitSuccess(false);
    }, 3000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Contact Me</h1>
            <p className="text-sm text-slate-400 mt-1">
              Get in touch - I'd love to hear from you
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">Available</span>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Email Card */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Email</h3>
                <p className="text-sm text-slate-400">Send me a message</p>
              </div>
            </div>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
              Primary
            </span>
          </div>
          <div className="text-slate-300 font-medium">hello@example.com</div>
          <div className="text-sm text-slate-400 mt-1">Response within 24 hours</div>
        </div>

        {/* Phone Card */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Phone</h3>
                <p className="text-sm text-slate-400">Call or text</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
              Available
            </span>
          </div>
          <div className="text-slate-300 font-medium">+1 (555) 123-4567</div>
          <div className="text-sm text-slate-400 mt-1">Mon-Fri 9AM-6PM EST</div>
        </div>

        {/* Location Card */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:bg-slate-750">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Location</h3>
                <p className="text-sm text-slate-400">Based in</p>
              </div>
            </div>
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
              Remote
            </span>
          </div>
          <div className="text-slate-300 font-medium">Raipur, Chhattisgarh</div>
          <div className="text-sm text-slate-400 mt-1">Open to remote work</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-100">Send a Message</h3>
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-emerald-400 mb-2">Message Sent!</h4>
              <p className="text-slate-300">Thank you for reaching out. I'll get back to you soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell me about your project, question, or just say hello!"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          {/* Response Time */}
          <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Response Time</h3>
                  <p className="text-sm text-slate-400">When you can expect to hear back</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Email inquiries:</span>
                <span className="text-emerald-400 font-medium">Within 24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Phone calls:</span>
                <span className="text-emerald-400 font-medium">Same day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Project proposals:</span>
                <span className="text-emerald-400 font-medium">2-3 business days</span>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-100">Quick Questions</h3>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">What's your availability?</h4>
                <p className="text-slate-300 text-sm">I'm currently available for new projects and collaborations. Response times are typically within 24 hours.</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">Do you work remotely?</h4>
                <p className="text-slate-300 text-sm">No. but looking for fulltime work or internships</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">What's your preferred contact method?</h4>
                <p className="text-slate-300 text-sm">Email is best for detailed discussions, while phone calls work great for quick questions or urgent matters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <div className="text-center text-slate-400">
          <p className="text-sm">
          </p>
        </div>
      </div>
    </div>
  );
}