'use client';

import '@/styles/footer.css';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      ['How do I sign up on Glimo?', 'Click on "Join Glimo", sign up using your email, and follow the prompts to create your profile.'],
      ['How do I create or edit my profile?', 'After signing in, go to your Dashboard and select the "Profile" tab to view or update your details.'],
    ],
  },
  {
    category: 'Features',
    questions: [
      ['What is Hustle Street?', 'Hustle Street is a community board where users share and find jobs, gigs, collaborations, and side hustles.'],
      ['What can I do in Glimo Groups?', 'Groups allow users with shared interests to chat, collaborate, and share opportunities.'],
    ],
  },
  {
    category: 'Messaging',
    questions: [
      ['How do I start a chat with another user?', 'Navigate to "Messages", use the search bar to find a user, then click their name to start chatting.'],
      ['How do group chats work?', 'Group chats include multiple users. Admins can create them under the "Messages" section.'],
    ],
  },
  {
    category: 'Premium',
    questions: [
      ['What do I get with Glimo Premium?', 'Premium unlocks exclusive AI tools, premium job listings, early feature access, and priority support.'],
      ['How do I subscribe to Premium?', 'Click on "Go Premium" in the sidebar, select a plan, and complete the payment process securely.'],
    ],
  },
  {
    category: 'Tools',
    questions: [
      ['What kind of AI tools are available in Glimo?', 'Glimo offers business idea generators, pitch deck builders, name finders, gig matchers, and more.'],
      ['Are Glimo’s tools free to use?', 'Most tools have a free version, but premium users get extra features and usage.'],
    ],
  },
  {
    category: 'Security & Support',
    questions: [
      ['Is Glimo safe and secure?', 'Yes, Glimo uses Supabase with advanced access control and end-to-end encryption where needed.'],
      ['How do I report a bug or issue?', 'Go to the Help Center and click "Contact Support", or email support@glimo.app.'],
    ],
  },
  {
    category: 'Account',
    questions: [
      ['How do I delete my account?', 'Go to "Settings" > "Account" > "Delete Account". This action is irreversible.'],
      ['I forgot my password. What do I do?', 'Click "Forgot Password" on the login page to receive a reset link via email.'],
    ],
  },
  {
    category: 'Pricing',
    questions: [
      ['Is Glimo free to use?', 'Yes! Most features are free, with optional upgrades available via Premium.'],
    ],
  },
  {
    category: 'General',
    questions: [
      ['Can I refer friends to Glimo?', 'Yes, we have a referral program. You’ll find it in the "Profile" section if it’s available in your region.'],
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="legal-page">
      <h1>Help Center / FAQ</h1>
      {faqs.map(({ category, questions }, idx) => (
        <div key={idx} className="faq-section">
          <h2>{category}</h2>
          {questions.map(([q, a], index) => (
            <div key={index} className="faq-item">
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
