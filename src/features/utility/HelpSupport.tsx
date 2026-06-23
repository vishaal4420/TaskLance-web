import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, ChevronDown, Mail } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: 'How do I get paid?', a: 'TaskLance uses a secure Escrow system. Clients fund milestones upfront, and funds are released to you once the work is approved.' },
  { q: 'What is the platform fee?', a: 'We charge a flat 10% fee on all completed milestones. There are no hidden charges or subscription fees.' },
  { q: 'Can I change my role later?', a: 'Yes, you can have both Client and Freelancer profiles attached to a single account and switch between them.' },
  { q: 'How do disputes work?', a: 'If you cannot resolve an issue with your client/freelancer, you can open a dispute. Our mediation team will review the case and make a binding decision.' },
];

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { addToast } = useToast();
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    
    // Simulate API call
    setTimeout(() => {
      addToast('Message sent! Our support team will get back to you shortly.', 'success');
      setIsContactModalOpen(false);
      setContactSubject('');
      setContactMessage('');
    }, 600);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold mb-4">How can we help?</h1>
        <div className="max-w-xl mx-auto relative">
          <Input 
            placeholder="Search for articles, guides, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            className="h-14 text-base"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-display font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-border-color rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-2 transition-colors text-left font-medium"
                  >
                    {faq.q}
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180 text-primary' : 'text-text-muted'}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-surface-2 text-text-muted border-t border-border-color text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-text-muted py-8">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">

          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 text-secondary">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-text-muted mb-4">Send us a message and we'll reply within 24h.</p>
              <Button variant="outline" className="w-full" onClick={() => setIsContactModalOpen(true)}>Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsContactModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
            >
              <div className="bg-surface border border-border-color rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" /> Contact Support
                  </h2>
                  <button onClick={() => setIsContactModalOpen(false)} className="text-text-muted hover:text-text-primary">
                    &times;
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    label="Subject"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    placeholder="What is this regarding?"
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary ml-1">
                      Message
                    </label>
                    <textarea
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="w-full bg-surface-2 border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted min-h-[120px] resize-y"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
