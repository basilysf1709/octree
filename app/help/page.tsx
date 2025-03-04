'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { ChevronDown, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const FAQs = [
  {
    question: "What is version control in Octree?",
    answer: "Version control in Octree tracks all changes made to your documents. Each save creates a new version, allowing you to view document history, compare changes, and revert to previous versions if needed."
  },
  {
    question: "How does real-time collaboration work?",
    answer: "Multiple team members can edit the same document simultaneously. Changes appear in real-time, and our conflict resolution system ensures everyone's work is preserved."
  },
  {
    question: "Can I work offline?",
    answer: "Yes, Octree allows you to work offline. Changes are synchronized automatically when you reconnect to the internet."
  },
  {
    question: "How secure are my documents?",
    answer: "We use end-to-end encryption and enterprise-grade security measures to protect your documents. Your data is stored securely and backed up regularly."
  },
  {
    question: "What file formats are supported?",
    answer: "Octree currently supports Markdown, plain text, and rich text formats. You can export your documents to PDF, DOCX, and other common formats."
  },
  {
    question: "How do I share documents with others?",
    answer: "You can invite collaborators via email, set specific permissions (view/edit), and manage access through the document settings."
  }
]

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [feedback, setFeedback] = useState({ subject: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Here you would implement the email sending logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Feedback sent successfully!')
      setFeedback({ subject: '', message: '' })
    } catch (error) {
      alert('Failed to send feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto p-8">
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground mt-2">
              Find answers to common questions or send us your feedback
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "text-muted-foreground transition-transform duration-200",
                        openFAQ === index && "rotate-180"
                      )}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Send Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={feedback.subject}
                  onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[150px]"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 