const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateWriterEbook() {
  const doc = new PDFDocument({ margin: 50 });
  const outputPath = "public/ebooks/writer-beginner.pdf";

  // Ensure folder exists
  fs.mkdirSync("public/ebooks", { recursive: true });
  doc.pipe(fs.createWriteStream(outputPath));

  // ---- Title Page ----
  doc.fontSize(30).fillColor("#1a73e8").text("Freelance Writing Essentials (Beginner)", {
    align: "center",
  });
  doc.moveDown(1.5);
  doc.fontSize(18).fillColor("#000").text("A Beginner’s Guide to Freelance Writing", {
    align: "center",
  });
  doc.moveDown(2);
  doc.fontSize(14).fillColor("gray").text("By Smart Hustle Hub", { align: "center" });

  doc.addPage();

  // ---- Full Content ----
  const content = `
 Chapter 1: Understanding Freelance Writing

Freelance writing is one of the most accessible ways to start earning money online while using your writing skills. Unlike a traditional job, freelance writing allows you to work independently, choose your clients, and set your schedule. This chapter will give you a strong foundation so you understand what freelance writing really is, why it’s a great career choice, and what skills you need to succeed.

1.1 What Is Freelance Writing?

Freelance writing is the act of writing content for clients or companies on a contract basis. You are not a full-time employee; instead, you take on projects, complete them, and get paid per project or per word. Freelance writers may work with multiple clients at the same time, giving them the flexibility to earn more and explore different topics.

Types of Freelance Writing

Freelance writing is not limited to one type of content. Here are the main categories you can consider as a beginner:

Blog Posts and Articles
Writing blog posts and articles is the most common entry point for new freelance writers. Businesses, websites, and bloggers need fresh content to engage readers and improve SEO (Search Engine Optimization). For example:

A travel website may hire you to write “Top 10 Things to Do in Paris.”

A tech blog may want “5 Tips to Secure Your Online Accounts.”

Copywriting
Copywriting focuses on writing persuasive content that encourages readers to take action, such as buying a product, signing up for a newsletter, or clicking a link. Examples include:

Sales pages for a website

Email marketing campaigns

Social media advertisements

Technical Writing
Technical writing involves creating manuals, guides, and instructions for products or services. For example, a software company may need a step-by-step guide on how to use their app.

Social Media Content
Many businesses hire freelance writers to create posts, captions, and social media campaigns that engage followers and drive traffic to their website.

eBooks and Long-Form Guides
Freelance writers are often asked to write complete eBooks or detailed guides for clients who want to educate their audience. For instance, a fitness brand might hire a writer to create a 50-page guide on “Healthy Meal Plans for Beginners.”

1.2 Why Freelance Writing Is a Great Career

Freelance writing is not only a way to earn money—it can be a fulfilling and flexible career. Here’s why many people choose freelance writing:

1. Flexibility

You decide when and where you work. Freelance writers can work from home, coffee shops, or while traveling. You can choose the number of projects you want to take on each month.

2. Creative Freedom

As a freelance writer, you often have the chance to choose the topics and clients you want to work with. This allows you to focus on subjects you enjoy, whether it’s technology, health, travel, or parenting.

3. Income Potential

Freelance writing has no strict salary limit. Beginners may earn $50–$200 per article depending on length and complexity, but experienced writers can earn much more. Some writers make a full-time income simply by working with multiple clients consistently.

4. Skill Development

Writing for different clients helps you improve your research, writing, and communication skills. Every project teaches you something new and makes you more valuable in the freelance market.

5. Low Start-Up Costs

Freelance writing does not require expensive tools or formal degrees. A computer, internet connection, and a few essential tools are enough to get started.

1.3 Skills Needed for Freelance Writing

While anyone can technically start freelance writing, certain skills make you more likely to succeed and grow quickly.

1. Grammar and Spelling

Correct grammar, punctuation, and spelling are crucial. Clients expect polished work. Beginners should focus on writing clearly and accurately rather than using complex vocabulary. Tools like Grammarly or Hemingway App can help you catch mistakes.

2. Research Skills

Freelance writing often requires you to write about topics you’re not an expert in. Being able to find credible sources, take notes, and summarize information is essential. Tip: Always check multiple sources to verify facts before writing.

3. Time Management

Meeting deadlines is one of the most important skills for freelance writers. Use calendars, timers, or apps like Trello or Notion to organize your tasks and avoid last-minute stress.

4. Communication

You must be able to understand your client’s requirements and respond professionally. Good communication helps avoid misunderstandings and increases your chances of repeat work.

5. Adaptability

Clients may request edits or changes. Being flexible and open to feedback is essential for long-term success.

1.4 Examples of Freelance Writing in Action

To help you understand, here are a few practical examples:

Example 1: Blog Post
Client: A travel agency wants a blog post about “The Best Beaches in Bali.”
Your Task: Research the beaches, write a 1,000-word article, include tips for travelers, and submit on time.

Example 2: Copywriting
Client: A startup selling eco-friendly water bottles wants a landing page that converts visitors into buyers.
Your Task: Write persuasive copy highlighting the benefits of the bottles, using clear headings, bullet points, and a call-to-action like “Buy Now.”

Example 3: Social Media Content
Client: A health coach wants daily Instagram captions.
Your Task: Create 30 captions that engage followers, include hashtags, and align with the brand voice.

Chapter 2: Getting Started

Starting your freelance writing career can feel overwhelming at first. There are so many things to consider: where to work, what to write about, and how to improve your skills. This chapter will guide you step by step, helping you set up your workspace, choose a niche, and learn the essential writing techniques to get started.

2.1 Setting Up Your Workspace

Even if you’re working from home, having a dedicated workspace is crucial. It improves focus, productivity, and motivation. A clutter-free, organized area helps you separate “work” from “personal life,” even if you only have a small corner of a room.

Essentials for a Beginner Writer

Computer or Laptop

You don’t need a super-expensive machine. Any computer that can run a word processor and internet browser is enough.

Stable Internet Connection

Most freelance writing requires research, emailing clients, and sometimes uploading files. A reliable internet connection prevents delays.

Word Processor

Tools like Microsoft Word, Google Docs, or Notion are essential for writing and organizing your content.

Google Docs is especially beginner-friendly because it automatically saves your work online.

Grammar and Style Tools

Grammarly: Checks grammar, punctuation, and style.

Hemingway App: Helps simplify sentences and improve readability.

Optional Tools for Productivity

Noise-canceling headphones (for focus)

Calendar or task management app (Trello, Notion, or Todoist)

Notebook for jotting down ideas

Pro Tip: Even if your workspace is small, try to create a clear distinction between “writing space” and “relaxation space.” Your brain associates the area with focus, which improves productivity.

2.2 Choosing Your Niche

A niche is the specific topic or industry you specialize in as a writer. Beginners often struggle with choosing a niche, but it’s important because clients prefer writers who know their field.

Popular Beginner-Friendly Niches

Technology: Gadgets, apps, software guides

Health & Fitness: Nutrition, workouts, mental health

Travel: Destination guides, travel tips, cultural experiences

Finance: Personal finance, saving tips, investing

Parenting: Tips for parents, family activities

How to Choose Your Niche

Start With What You Know

If you’re familiar with a topic, it’s easier to write confidently and research efficiently.

Consider Demand

Some niches have more clients and higher-paying opportunities. Tech, finance, and health are often in demand.

Test and Learn

You can start with one niche and expand later. Freelancers often write in multiple niches once they gain experience.

Pro Tip: A clear niche helps you build a portfolio that appeals to clients in that field. It also positions you as an expert rather than a generalist.

2.3 Learning Basic Writing Techniques

Good writing is more than just putting words on a page. As a beginner, learning basic writing techniques will help you create content that clients love.

1. Headlines and Titles

The headline is the first thing readers see. It should be:

Clear: Readers immediately know the topic

Engaging: Sparks curiosity or interest

Accurate: Reflects the content of the article

Example: Instead of “Travel Tips,” write “10 Easy Travel Tips for First-Time Backpackers.”

2. Introduction Paragraphs

Your introduction should hook the reader and make them want to continue. Include:

A problem or question the reader cares about

A brief overview of what the article covers

Example:
“Planning your first trip abroad can be exciting and overwhelming. From packing to budgeting, there’s a lot to consider. In this guide, you’ll discover simple tips to make your travel stress-free and enjoyable.”

3. Structuring Your Content

Use headings and subheadings to organize ideas.

Break text into short paragraphs for readability.

Use bullet points or numbered lists to highlight important information.

4. Clarity Over Complexity

Write simple, easy-to-read sentences.

Avoid jargon unless it’s appropriate for your audience.

Focus on communicating ideas clearly rather than sounding “fancy.”

5. Editing as You Go

Don’t overthink while drafting; focus on getting your ideas down.

After drafting, use editing tools and read aloud to catch errors.

2.4 Tips for Beginners to Build Confidence

Write Daily: Even 200 words a day helps improve your skills and builds discipline.

Read Widely: Blogs, articles, and books help you see different writing styles and expand vocabulary.

Seek Feedback: Share your writing with friends, mentors, or online communities. Constructive criticism helps you grow.

Start Small: Begin with short articles or blog posts before attempting long-form guides or complex projects.

2.5 Mini Exercise for Chapter 2

Try the following exercises to apply what you’ve learned:

Workspace Setup: Organize your writing space and ensure all essential tools are ready.

Choose a Niche: Write down 1–3 niches you are interested in and why.

Practice Writing an Introduction: Pick a topic in your niche and write a 3–4 sentence introduction that hooks the reader.

Chapter 3: Finding Freelance Writing Opportunities

Now that you understand freelance writing and have set up your workspace and niche, it’s time to find clients and start earning. This chapter will guide you step by step, from beginner-friendly platforms to pitching clients effectively.

3.1 Freelance Platforms

Freelance platforms are websites that connect clients with writers. They are especially helpful for beginners because you don’t need prior experience or a large portfolio to get started. Here are some popular platforms:

1. Upwork

Overview: A global marketplace for freelancers of all types.

How It Works: Create a profile, submit proposals for jobs, and get paid through the platform.

Tips for Beginners: Start with smaller projects to build your ratings. Always include samples of your writing.

2. Fiverr

Overview: A platform where you offer services (called “gigs”) starting at $5.

How It Works: Set up gigs like “I will write a 500-word blog post on any topic.”

Tips for Beginners: Focus on one niche, create clear gig descriptions, and showcase your samples.

3. Freelancer.com

Overview: Similar to Upwork, you can bid on projects posted by clients.

How It Works: Submit proposals explaining why you’re the best fit.

Tips for Beginners: Write a personal message for each proposal, and start with low-cost projects to build your reputation.

4. ProBlogger Job Board

Overview: Focused specifically on writing and blogging jobs.

How It Works: Browse job listings and apply directly to clients.

Tips for Beginners: Look for postings that mention “beginner-friendly” or “entry-level.”

3.2 Pitching Clients

A pitch is your introduction to a potential client. It’s your chance to convince them you are the right writer for their project. A strong pitch can make the difference between getting hired or ignored.

Tips for a Successful Pitch

Personalize Your Message
Address the client by name if possible. Reference the project specifics to show you understand their needs.

Show Understanding of the Project
Mention that you read their project description carefully and explain how your skills fit.

Include Samples
Even 2–3 writing samples or links to previous work give clients confidence in your abilities.

Be Concise
Clients often read dozens of pitches. Keep your message clear and to the point.

Sample Pitch for Beginners

Hi [Client Name],
I read your request for a blog post on [topic]. I have experience writing articles in this niche and can deliver a 1,000-word post with SEO optimization. Here’s a sample of my work: [link].
Looking forward to your response.
Best, [Your Name]

Extra Tips for Beginners

Respond Quickly: Early responses often have a higher chance of being selected.

Follow Instructions: If the job post asks for specific details (e.g., word count or subject line in the message), include them.

Start Small: Apply for smaller projects first to build credibility and gain positive reviews.

3.3 Networking and Social Media

While freelance platforms are helpful, many opportunities come from networking. Here’s how beginners can use networking effectively:

Facebook Groups
Join groups like “Freelance Writers” or “Blogging Jobs.” Engage with posts and share your availability.

LinkedIn
Connect with business owners and share your writing samples. Post articles to showcase your expertise.

Discord Communities
Many writing communities on Discord share job opportunities and feedback.

Pro Tip: Networking helps you find repeat clients and long-term opportunities, which is often more stable than relying only on freelance platforms.

3.4 Building a Beginner Portfolio

Clients want to see your work before hiring you. Even as a beginner, you can create a portfolio that demonstrates your skills:

Write 2–5 sample articles in your niche.

Use free platforms like Medium or WordPress to host your writing.

Include a brief bio highlighting your niche, skills, and interest in writing.

Update your portfolio regularly as you complete more projects.

3.5 Actionable Exercises for Chapter 3

Create Accounts on 1–2 Freelance Platforms

Fill out your profile completely. Add a professional photo, bio, and your sample articles.

Write a Practice Pitch

Use the template above and tailor it to a hypothetical client.

Join 1 Networking Group

Participate in discussions or share your writing samples.

Build a Mini Portfolio

Publish 2 sample articles on a free platform like Medium.

Chapter 4: Writing and Editing Like a Pro

Writing is only half the battle in freelance writing. Editing and refining your work is what makes it client-ready and professional. This chapter will guide you through the writing process, introduce helpful tools, and give tips for producing high-quality content every time.

4.1 The Writing Process

Understanding the writing process is crucial for beginners. It helps you work efficiently, produce consistent results, and avoid writer’s block. Here’s a step-by-step approach:

Step 1: Research

Before you start writing, gather information about your topic. Research helps you create accurate, credible, and informative content.

Tips for Research:

Use reputable sources such as blogs, news sites, or academic articles.

Take notes and organize information with headings or bullet points.

Avoid copying; always write in your own words to maintain originality.

Example: If you’re writing “10 Tips for Healthy Eating,” research diet tips, meal planning, and nutritional facts.

Step 2: Outline

Outlining is like creating a roadmap for your article. It helps you organize ideas and ensures your writing flows logically.

How to Outline:

Write the main headings first (e.g., Introduction, Tip 1, Tip 2…).

Add subpoints under each heading with key ideas or examples.

Decide the order of sections to create a smooth reading experience.

Example Outline:

Introduction: Why healthy eating matters

Tip 1: Plan your meals

Tip 2: Include more vegetables

Tip 3: Drink enough water

Conclusion: Benefits of a balanced diet

Step 3: Draft

Now that you have your research and outline, it’s time to write the first draft.

Drafting Tips:

Focus on getting your ideas down rather than perfection.

Don’t worry about grammar, spelling, or style at this stage.

Write in short paragraphs to make editing easier later.

Pro Tip: Set a timer and write without stopping for 20–30 minutes to boost productivity.

Step 4: Edit

Editing transforms your rough draft into polished, professional content.

Editing Steps:

Content Review: Ensure all information is accurate, relevant, and complete.

Clarity and Flow: Make sure sentences are easy to read and paragraphs transition smoothly.

Grammar and Spelling: Correct mistakes and awkward phrasing.

Style and Tone: Adjust language to match the client’s voice (formal, casual, persuasive, etc.).

Pro Tip: Take a short break before editing. Fresh eyes catch mistakes more easily.

4.2 Essential Editing Tools

Using the right tools can save time and improve the quality of your writing. Here are some beginner-friendly options:

Grammarly

Checks grammar, punctuation, and style.

Suggests clarity improvements and vocabulary enhancements.

Hemingway App

Highlights long or complex sentences.

Helps simplify writing for better readability.

Google Docs

Built-in spell check

Collaborative editing if working with clients or editors

Thesaurus / Dictionary

Helps find better words and expand vocabulary.

4.3 Tips for Beginners to Improve Writing

Write Daily

Even 200–300 words per day improves skills and builds confidence.

Read Widely

Reading blogs, articles, and books exposes you to different writing styles and ideas.

Don’t Fear Feedback

Constructive criticism helps you identify weaknesses and grow as a writer.

Revise, Revise, Revise

Writing is rewriting. Don’t be satisfied with the first draft.

Practice Different Styles

Experiment with blog posts, guides, emails, or social media content to diversify your skills.

Learn SEO Basics (Optional but Helpful)

Using keywords naturally in your writing can make your content more attractive to clients who run websites.

4.4 Mini Exercises for Chapter 4

Draft Practice: Write a 300-word article using your niche. Focus on structure and clarity, not perfection.

Edit Your Work: Use Grammarly or Hemingway App to refine your draft.

Headline Practice: Create 5 alternative headlines for the same article.

Flow Check: Ensure your introduction, body, and conclusion follow a logical order.

Chapter 5: Building Your Portfolio

A portfolio is your most powerful tool as a freelance writer. It shows potential clients what you can do, highlights your strengths, and builds credibility. Even as a beginner, you can create a portfolio that impresses clients and helps you land your first paid projects.

5.1 Why a Portfolio Matters

Clients want to see proof of your skills before hiring you. A portfolio:

Demonstrates your writing style and abilities

Shows experience, even if it’s self-created content

Helps you stand out from other beginners

Builds trust with potential clients

Pro Tip: A strong portfolio often matters more than experience. Even 2–5 high-quality samples can convince a client to hire you.

5.2 How to Create a Beginner-Friendly Portfolio

Even if you haven’t worked with clients yet, you can create a portfolio by following these steps:

Step 1: Write Sample Articles

Start with 2–5 articles in your niche.

Focus on quality, clarity, and proper structure.

Make them relevant to the type of work you want to do.

Example: If your niche is health and fitness:

“5 Easy Morning Exercises for Beginners”

“Healthy Meal Planning for Busy Professionals”

Step 2: Choose a Platform to Host Your Portfolio

Medium: Free platform where you can publish articles and get exposure.

WordPress: Free or paid website builder to showcase work professionally.

Google Docs/Dropbox Links: If you don’t want a public site, share PDFs or docs with clients.

Step 3: Create a Professional Bio

Include a brief introduction highlighting:

Your niche or area of expertise

Skills and experience (even if it’s self-taught)

Contact information

Example Bio:

Hi! I’m [Your Name], a freelance writer specializing in health and wellness. I create engaging articles, blog posts, and guides that help readers live healthier lives. Check out my work below, and feel free to contact me for collaborations.

Step 4: Organize Your Portfolio

Start with your best work first.

Include a variety of content types if possible (blog posts, guides, copywriting).

Label articles clearly with titles, dates, and topics.

Step 5: Keep Updating

Add new samples as you gain experience.

Remove outdated or low-quality articles.

5.3 Tips for Beginners to Build a Strong Portfolio

Write for Free or Practice First

You can create practice articles or volunteer for small projects to gain samples.

Focus on Quality, Not Quantity

It’s better to have 3–5 excellent articles than 10 mediocre ones.

Show Your Best Work

Highlight projects that match the type of work you want to get.

Include a Variety of Formats

Blog posts, social media captions, guides, or even sample copywriting.

Make it Easy for Clients to Contact You

Include a contact form, email, or social media link.

5.4 Mini Exercises for Chapter 5

Write 2–3 Sample Articles

Choose topics in your niche and write beginner-friendly, polished pieces.

Publish Your Samples

Upload them to Medium, WordPress, or Google Docs.

Create a Simple Bio

Highlight your niche, skills, and availability for writing projects.

Organize Your Portfolio

Arrange your samples in order of quality and relevance.

Chapter 6: Pricing and Getting Paid

One of the most important aspects of freelance writing is understanding how to price your work and get paid reliably. Many beginners struggle with this, so this chapter will break it down step by step.

6.1 Setting Your Rates

Deciding what to charge can be tricky for beginners. You don’t want to undervalue yourself, but at the same time, you need to be realistic about your experience level.

Common Pricing Models

Per Word

Example: $0.05–$0.10 per word for beginners.

500-word blog post at $0.05/word = $25.

Per Article or Project

Example: $20–$50 per short blog post (500–1,000 words).

$100–$300 for longer guides or eBooks.

Hourly Rate

Less common for beginners but sometimes used for ongoing projects.

Example: $15–$25 per hour.

Tips for Setting Beginner Rates

Start at the lower end to attract your first clients, but don’t go too low—it can undervalue your skills.

Increase rates gradually as you gain experience and positive reviews.

Consider the complexity of the work: technical topics or SEO-focused articles can command higher rates.

Pro Tip: Always communicate your rates clearly before starting a project to avoid confusion.

6.2 Payment Methods

Choosing reliable payment methods ensures you get paid safely and on time. Here are common options for freelancers:

PayPal

Widely used, fast, and secure.

Can convert to local currency easily.

Wise (formerly TransferWise)

Great for international payments with low fees.

Allows direct bank transfers in multiple currencies.

Direct Bank Transfer

Safe for local clients.

Make sure to agree on payment terms beforehand.

Freelance Platform Payments

Platforms like Upwork or Fiverr handle payments for you.

They usually deduct a small fee but offer protection in case of disputes.

6.3 Ensuring Smooth Payment

Agree on Payment Terms Upfront

Example: 50% upfront, 50% on delivery.

This protects you from clients who delay payment.

Use Contracts for Larger Projects

Even a simple written agreement specifying the project scope, delivery date, and payment terms can save headaches.

Invoice Properly

Include your name, contact info, client info, project description, total amount, and payment instructions.

Tools like Wave, PayPal Invoicing, or Google Docs templates make it easy.

Keep Records

Track your earnings, invoices, and payments for future reference or taxes.

6.4 Tips for Beginners

Don’t Work for Free: Offering free samples is okay for practice, but avoid free work for paying clients.

Request Partial Payments: For larger projects, a 50% upfront payment is standard.

Be Professional: Always send invoices and communicate clearly about deadlines and payment.

Adjust Rates Over Time: As you gain experience and credibility, raise your rates gradually.

6.5 Mini Exercise for Chapter 6

Decide Your Starting Rates

Choose per word or per article rates based on your niche and comfort level.

Set Up a Payment Method

Create a PayPal or Wise account and test sending/receiving payments.

Draft a Simple Invoice Template

Include your name, client info, project, amount, and payment instructions.

Chapter 7: Growing as a Freelance Writer

Getting your first freelance writing gig is exciting, but real success comes from growth, skill development, and building strong client relationships. This chapter will guide you on networking, learning, and handling challenges as a freelance writer.

7.1 Networking

Networking is crucial in freelancing. Many clients come from referrals, connections, and online communities. Here’s how to grow your professional network:

1. Join Online Communities

Facebook Groups: Search for groups like “Freelance Writers Hub” or “Blogging Jobs” and participate in discussions.

Discord Communities: Many writing-focused servers share job opportunities, feedback, and advice.

Reddit: Subreddits like r/freelancewriting are helpful for tips, opportunities, and peer support.

2. Connect on LinkedIn

Create a professional profile highlighting your niche, skills, and portfolio.

Connect with business owners, content managers, and other writers.

Post sample articles or tips to showcase your expertise.

3. Attend Workshops and Webinars

Many online workshops teach writing, marketing, and freelancing skills.

Networking at webinars can lead to collaborations or referrals.

Pro Tip: Be helpful and professional in your interactions. People remember writers who contribute positively to the community.

7.2 Continuous Learning

The writing industry constantly evolves, especially with SEO, content marketing, and digital trends. Continuous learning helps you stay competitive and attract higher-paying clients.

Ways to Learn and Improve

Read Books and Blogs About Writing

Example: “On Writing” by Stephen King or content marketing blogs like HubSpot.

Take Online Courses

Platforms like Coursera, Udemy, or Skillshare offer courses on copywriting, SEO, and content strategy.

Practice New Writing Styles

Experiment with blog posts, social media content, technical guides, or email campaigns.

Learn SEO Basics

Understanding keywords, meta descriptions, and readability can make your work more valuable to clients.

Pro Tip: Allocate at least 30 minutes a day to learning or practicing new writing skills. Over time, small efforts accumulate into significant improvement.

7.3 Handling Rejections

Rejection is a normal part of freelancing, especially for beginners. Every writer faces clients who don’t choose them or ask for revisions beyond what you expected.

How to Handle Rejections

Stay Positive

Don’t take rejection personally—it’s often about client preference or budget.

Learn from Feedback

If a client provides feedback, use it to improve your writing or pitch.

Keep Pitching

Don’t stop applying for jobs. Consistency beats discouragement.

Track Lessons Learned

Maintain notes on what works in pitches and what doesn’t. This helps refine your approach.

Pro Tip: Every rejection is a step closer to your first accepted project. Persistence is key in freelance writing.

7.4 Building Long-Term Client Relationships

Once you start getting clients, focus on building long-term relationships. Repeat clients are more valuable than constantly finding new ones.

Communicate clearly and professionally.

Meet deadlines consistently.

Offer additional value (suggest content ideas, improve SEO, or provide extra edits).

Ask for testimonials or referrals after completing projects.

Pro Tip: A strong relationship with one client can lead to multiple projects and referrals, which is a cornerstone of a sustainable freelance career.

7.5 Mini Exercises for Chapter 7

Join a Networking Group

Participate in discussions and introduce yourself professionally.

Plan a Learning Routine

Pick a topic to study this week (SEO, copywriting, or social media content).

Draft a Rejection Response

Practice responding professionally to a declined pitch or client feedback.

Reach Out to Past Clients

If you have any completed projects, ask for feedback, testimonials, or future opportunities.
`;

  // ---- Paragraph Formatting ----
  const paragraphs = content.split("\n\n");

  paragraphs.forEach((p) => {
    if (!p.trim()) return;

    // Detect chapter headers
    if (p.startsWith("Chapter")) {
      doc.moveDown(1);
      doc.fontSize(20).fillColor("#1a73e8").text(p.trim(), { align: "left" });
      doc.moveDown(0.5);
    }
    // Detect Pro Tips / Exercises
    else if (p.startsWith("Pro Tip") || p.includes("Mini Exercise")) {
      const boxY = doc.y;
      doc.rect(50, boxY, 500, 70).fill("#f0f4ff").stroke();
      doc.fillColor("#1a73e8").fontSize(12).text(p.trim(), 60, boxY + 10, {
        width: 480,
        align: "left",
      });
      doc.moveDown(5);
    }
    // Normal text
    else {
      doc.fontSize(12).fillColor("#000").text(p.trim(), {
        align: "justify",
      });
      doc.moveDown();
    }
  });

  // ---- Footer with Page Numbers ----
  // ---- Footer with Page Numbers ----
doc.on("pageAdded", () => {
  const pageNumber = doc.page.number;
  doc.fontSize(10).fillColor("gray").text(`Page ${pageNumber}`, 0, 750, {
    align: "center",
  });
});


  doc.end();
  console.log("✅ Styled Writer Beginner Ebook generated at:", outputPath);
}

generateWriterEbook();

