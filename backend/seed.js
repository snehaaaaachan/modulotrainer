require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const { sequelize, Course, Module, Quiz } = require("./models");

const rawCourses = JSON.parse(
  fs.readFileSync(path.join(__dirname, "materials-data.json"), "utf-8")
);

// ── Quiz questions — 3 per module, keyed by "slug-index" ─────────────────────
const QUIZ_DATA = {
  // ── Web Dev ────────────────────────────────────────────────────────────────
  "webdev-0": [
    { question: "Which HTML element is used for the most important heading?",
      options: ["<h6>","<h1>","<head>","<title>"], correctIndex: 1,
      explanation: "<h1> is the top-level heading; headings go from h1 (most important) to h6 (least)." },
    { question: "What does the 'alt' attribute on an <img> tag provide?",
      options: ["The image URL","Alternate styling","A text description for accessibility","The image width"], correctIndex: 2,
      explanation: "alt text is read by screen readers and shown when the image fails to load." },
    { question: "Which of these is a semantic HTML element?",
      options: ["<div>","<span>","<article>","<b>"], correctIndex: 2,
      explanation: "<article> describes meaning; <div> and <span> are purely structural with no semantic meaning." }
  ],
  "webdev-1": [
    { question: "What does 'display: flex' do?",
      options: ["Hides the element","Makes children scroll","Creates a one-dimensional flex layout","Adds a grid overlay"], correctIndex: 2,
      explanation: "Flexbox is a one-dimensional layout model for rows or columns." },
    { question: "In the CSS box model, which layer is outermost?",
      options: ["Content","Padding","Border","Margin"], correctIndex: 3,
      explanation: "From inside out: content → padding → border → margin." },
    { question: "Which property controls spacing along the main axis in flexbox?",
      options: ["align-items","justify-content","flex-wrap","gap"], correctIndex: 1,
      explanation: "justify-content aligns items along the main axis (row or column direction)." }
  ],
  "webdev-2": [
    { question: "Which keyword declares a variable that cannot be reassigned?",
      options: ["let","var","const","static"], correctIndex: 2,
      explanation: "const creates a binding that cannot be reassigned after initialisation." },
    { question: "What does document.querySelector('.btn') do?",
      options: ["Creates a new element","Deletes an element","Finds the first element matching the CSS selector","Finds all matching elements"], correctIndex: 2,
      explanation: "querySelector returns the first matching element, or null if none found." },
    { question: "Which method attaches an event listener to an element?",
      options: ["element.on()","element.listen()","element.addEventListener()","element.attach()"], correctIndex: 2,
      explanation: "addEventListener is the standard DOM method for registering event handlers." }
  ],
  "webdev-3": [
    { question: "What is the mobile-first CSS approach?",
      options: ["Design for desktop first","Write styles for small screens first, then add complexity for larger screens","Only use percentages","Avoid media queries"], correctIndex: 1,
      explanation: "Mobile-first starts with simple styles for narrow screens and progressively enhances for wider viewports." },
    { question: "Which CSS unit is relative to the viewport width?",
      options: ["px","rem","vw","em"], correctIndex: 2,
      explanation: "vw (viewport width) scales with the browser window width." },
    { question: "What does @media (min-width: 768px) target?",
      options: ["Screens narrower than 768px","Exactly 768px wide screens","Screens 768px wide or wider","Print media only"], correctIndex: 2,
      explanation: "min-width means the styles apply when the viewport is AT LEAST that wide." }
  ],
  "webdev-4": [
    { question: "Which HTML input type validates an email address format automatically?",
      options: ['type="text"','type="email"','type="url"','type="search"'], correctIndex: 1,
      explanation: 'type="email" triggers built-in browser validation for the @ symbol and domain format.' },
    { question: "What is the purpose of client-side form validation?",
      options: ["Replaces server-side validation","Improves user experience by catching errors early","Secures the database","Encrypts form data"], correctIndex: 1,
      explanation: "Client-side validation is UX-focused; servers must always re-validate independently." },
    { question: "Which attribute prevents a form field from being submitted empty?",
      options: ["disabled","placeholder","required","readonly"], correctIndex: 2,
      explanation: "The required attribute blocks form submission if the field is empty." }
  ],
  "webdev-5": [
    { question: "What command typically builds a React app for production?",
      options: ["npm run start","npm run dev","npm run build","npm run deploy"], correctIndex: 2,
      explanation: "npm run build compiles and optimises the source files into a deployable build/ folder." },
    { question: "Which of these is a static hosting platform?",
      options: ["MySQL","Vercel","Docker","Redis"], correctIndex: 1,
      explanation: "Vercel is built specifically for deploying static front-end sites and serverless functions." },
    { question: "What is a custom domain?",
      options: ["A type of SSL certificate","A DNS record pointing your domain name to a host's servers","A subdomain of localhost","A database name"], correctIndex: 1,
      explanation: "A custom domain is configured via DNS to point your own URL at your hosting provider." }
  ],

  // ── Data Science ───────────────────────────────────────────────────────────
  "datasci-0": [
    { question: "Which data structure holds key-value pairs in Python?",
      options: ["List","Tuple","Dictionary","Set"], correctIndex: 2,
      explanation: "A dictionary (dict) maps keys to values: {'name': 'Ana', 'score': 88}." },
    { question: "What does a for loop do in Python?",
      options: ["Defines a function","Repeats code for each item in a sequence","Creates a class","Imports a module"], correctIndex: 1,
      explanation: "for loops iterate over sequences like lists, ranges, or strings." },
    { question: "When reading a Python traceback, where should you look first?",
      options: ["The top line","The middle","The bottom (the actual error)","The import statements"], correctIndex: 2,
      explanation: "The bottom of a traceback shows the actual error type and message; the top shows the call chain." }
  ],
  "datasci-1": [
    { question: "Which function loads a CSV file into a pandas DataFrame?",
      options: ["pd.load_csv()","pd.read_csv()","pd.open_csv()","pd.import_csv()"], correctIndex: 1,
      explanation: "pd.read_csv('file.csv') is the standard way to load tabular data from a CSV." },
    { question: "What does df.dropna() do?",
      options: ["Drops all columns","Removes rows with any missing (NaN) values","Fills missing values with 0","Renames columns"], correctIndex: 1,
      explanation: "dropna() removes rows (by default) that contain at least one NaN value." },
    { question: "What does df.groupby('category').mean() compute?",
      options: ["The total of each category","The mean of all columns grouped by category","The number of rows per category","The first row per category"], correctIndex: 1,
      explanation: "groupby splits the DataFrame by a column, then .mean() computes the average for each group." }
  ],
  "datasci-2": [
    { question: "Which chart type is best for showing change over time?",
      options: ["Bar chart","Pie chart","Line chart","Scatter plot"], correctIndex: 2,
      explanation: "Line charts are ideal for time-series data where you want to show trends." },
    { question: "What does sorting bars by value do to a bar chart?",
      options: ["Makes it harder to read","Makes comparisons easier at a glance","Changes the data","Adds color"], correctIndex: 1,
      explanation: "Sorted bars let readers immediately find the largest/smallest without scanning." },
    { question: "Which matplotlib function displays the chart?",
      options: ["plt.render()","plt.draw()","plt.show()","plt.display()"], correctIndex: 2,
      explanation: "plt.show() renders and displays the current figure." }
  ],
  "datasci-3": [
    { question: "Which measure of center is resistant to outliers?",
      options: ["Mean","Mode","Median","Standard deviation"], correctIndex: 2,
      explanation: "The median is the middle value and is not affected by extreme values, unlike the mean." },
    { question: "What does a correlation of -1 indicate?",
      options: ["No relationship","A perfect positive relationship","A perfect negative relationship","A circular relationship"], correctIndex: 2,
      explanation: "Correlation of -1 means as one variable increases, the other decreases perfectly." },
    { question: "Correlation between ice cream sales and drownings is high. What causes both?",
      options: ["Ice cream causes drownings","Drownings cause ice cream sales","Warm weather (a confounding factor)","Random chance"], correctIndex: 2,
      explanation: "This is a classic confounding variable example — hot weather drives both, not one causing the other." }
  ],
  "datasci-4": [
    { question: "In machine learning, what are 'features'?",
      options: ["The output the model predicts","The input variables the model learns from","The model's weights","The test dataset"], correctIndex: 1,
      explanation: "Features are the input variables (columns) used to train the model." },
    { question: "Why do we split data into train and test sets?",
      options: ["To speed up training","To use less memory","To honestly evaluate if the model generalises to unseen data","To balance the classes"], correctIndex: 2,
      explanation: "The test set is held back during training so we can measure real generalisation, not memorisation." },
    { question: "What does model.fit(X_train, y_train) do in scikit-learn?",
      options: ["Makes predictions","Evaluates the model","Trains the model on the training data","Loads the dataset"], correctIndex: 2,
      explanation: ".fit() trains the model by learning patterns from X_train relative to y_train." }
  ],

  // ── Design ─────────────────────────────────────────────────────────────────
  "design-0": [
    { question: "What is the first stage of Design Thinking?",
      options: ["Prototype","Define","Empathize","Test"], correctIndex: 2,
      explanation: "Empathize comes first — understanding the user's real situation before defining the problem." },
    { question: "A well-framed problem statement focuses on:",
      options: ["The technology to be used","The user's need","The budget","The timeline"], correctIndex: 1,
      explanation: "Good problem statements describe a user need, not a specific solution." },
    { question: "Why are cheap, early prototypes valuable?",
      options: ["They look professional","They are easy to patent","They can be thrown away, making fast testing cheap","They replace user research"], correctIndex: 2,
      explanation: "Low-cost prototypes let you test and discard ideas quickly without wasting effort." }
  ],
  "design-1": [
    { question: "In a 60-30-10 color palette, what does the 10% represent?",
      options: ["The dominant neutral","The secondary color","The accent color used sparingly","The background color"], correctIndex: 2,
      explanation: "The 10% is the accent — used sparingly for emphasis and focal points." },
    { question: "What is the minimum WCAG contrast ratio for normal body text?",
      options: ["2:1","3:1","4.5:1","7:1"], correctIndex: 2,
      explanation: "WCAG AA requires a contrast ratio of at least 4.5:1 for normal-sized body text." },
    { question: "What is a type scale?",
      options: ["A tool for weighing fonts","A small set of consistent font sizes used across a design","The number of fonts in a project","A CSS animation"], correctIndex: 1,
      explanation: "A type scale (e.g. 14/16/20/28/40px) keeps heading and body sizes consistent throughout." }
  ],
  "design-2": [
    { question: "What is the purpose of a low-fidelity wireframe?",
      options: ["To finalize visual design","To test layout ideas fast and cheaply before polish","To write code","To replace user testing"], correctIndex: 1,
      explanation: "Low-fi wireframes use rough sketches to validate structure before investing in visual design." },
    { question: "What elements should a wireframe block out?",
      options: ["Only images","Only text","Navigation, content area, calls to action, and repeating patterns","Color palettes"], correctIndex: 2,
      explanation: "Wireframes map the structural elements — nav, content, CTAs — not visual styling." },
    { question: "Why is it valuable that wireframes don't look 'finished'?",
      options: ["It saves printing costs","It invites blunt feedback because nothing looks precious","It is faster to code","It avoids copyright issues"], correctIndex: 1,
      explanation: "When a design looks unpolished, reviewers feel free to suggest radical changes without hesitation." }
  ],
  "design-3": [
    { question: "What does a prototype test that static screens cannot?",
      options: ["Color choices","Font sizes","A user flow — how screens connect","Database performance"], correctIndex: 2,
      explanation: "Linking screens into a clickable prototype reveals flow problems invisible in isolated static images." },
    { question: "What fidelity should you use to test visual details?",
      options: ["Paper sketches","Low fidelity","Near-final high fidelity","No prototype needed"], correctIndex: 2,
      explanation: "High-fidelity prototypes are needed when testing visual design specifics, not just flow." },
    { question: "How should you frame a prototype testing task?",
      options: ['"Just explore the app"','"Find and book a table for two" (a specific task)','"Tell me what you think"','"Do whatever you want"'], correctIndex: 1,
      explanation: "Specific, realistic tasks produce actionable observations; open-ended exploration rarely does." }
  ],
  "design-4": [
    { question: "According to Nielsen, roughly how many users reveal most usability problems?",
      options: ["1","5","20","100"], correctIndex: 1,
      explanation: "Nielsen's research shows ~5 users typically surface the majority of major usability issues." },
    { question: "What is the think-aloud protocol?",
      options: ["The facilitator explains the design","Participants narrate their thoughts while completing a task","Users rate the design numerically","A post-session survey"], correctIndex: 1,
      explanation: "Think-aloud captures in-the-moment confusion rather than memory-shaped post-session feedback." },
    { question: "What signals are worth noting during a usability test?",
      options: ["Only task failures","Only positive comments","Hesitation, backtracking, and re-reading — even if the task succeeds","Only the time taken"], correctIndex: 2,
      explanation: "Hesitation and backtracking reveal friction even when a participant eventually completes the task." }
  ],

  // ── Marketing ──────────────────────────────────────────────────────────────
  "marketing-0": [
    { question: "Which funnel stage do search ads typically target?",
      options: ["Awareness","Consideration","Decision","Retention"], correctIndex: 2,
      explanation: "Search ads reach people actively looking to buy — they're already close to a decision." },
    { question: "What type of content is most useful at the Consideration stage?",
      options: ["Broad social campaigns","Comparison guides and case studies","Checkout pages","Unboxing videos"], correctIndex: 1,
      explanation: "At consideration, people are comparing options — detailed comparisons and social proof help most." },
    { question: "What does a marketing funnel describe?",
      options: ["The shape of a brand logo","The journey from awareness to purchase decision","A type of paid ad format","An email template"], correctIndex: 1,
      explanation: "A funnel maps the stages a potential customer moves through: Awareness → Consideration → Decision." }
  ],
  "marketing-1": [
    { question: "What does SEO stand for?",
      options: ["Social Engagement Optimization","Search Engine Optimization","Site Experience Output","Structured External Outreach"], correctIndex: 1,
      explanation: "SEO (Search Engine Optimization) is the practice of improving a page's visibility in organic search results." },
    { question: "What is a backlink?",
      options: ["A link from your site to another","A link from another site pointing to yours","A broken internal link","A redirect"], correctIndex: 1,
      explanation: "Backlinks are inbound links from other websites — they signal authority and trust to search engines." },
    { question: "Which on-page element is most important for SEO?",
      options: ["Background color","Font size","Title tag and meta description","Image border radius"], correctIndex: 2,
      explanation: "The title tag and meta description directly affect how your page appears in search results." }
  ],
  "marketing-2": [
    { question: "What does engagement rate measure on social media?",
      options: ["Total follower count","Number of posts published","Interactions (likes, comments, shares) relative to reach","Ad spend"], correctIndex: 2,
      explanation: "Engagement rate = interactions ÷ reach (or followers), showing how actively the audience responds." },
    { question: "Which content type tends to have the highest organic reach on most platforms?",
      options: ["Text-only posts","Short-form video","PDF attachments","Long blog posts"], correctIndex: 1,
      explanation: "Short-form video (Reels, TikTok, Shorts) consistently gets boosted algorithmically on most platforms." },
    { question: "What is a content calendar used for?",
      options: ["Tracking ad spend","Planning and scheduling posts in advance","Measuring follower growth","A/B testing captions"], correctIndex: 1,
      explanation: "A content calendar helps plan, schedule, and maintain a consistent publishing rhythm." }
  ],
  "marketing-3": [
    { question: "What is a good email open rate benchmark for most industries?",
      options: ["Below 5%","Around 20-30%","Above 70%","Exactly 50%"], correctIndex: 1,
      explanation: "Industry average open rates typically range from 20-30%, though this varies by sector." },
    { question: "What does segmentation in email marketing mean?",
      options: ["Splitting the email into sections","Sending the same email to everyone","Dividing your list into groups for more targeted messages","Scheduling emails in advance"], correctIndex: 2,
      explanation: "Segmentation groups subscribers by behaviour or traits so each group gets more relevant content." },
    { question: "What is a double opt-in?",
      options: ["Paying for two ad placements","Requiring subscribers to confirm their email after signing up","Sending two emails per week","Using two subject lines via A/B test"], correctIndex: 1,
      explanation: "Double opt-in asks subscribers to click a confirmation link, ensuring the address is valid and consent is genuine." }
  ],
  "marketing-4": [
    { question: "What does CTR stand for?",
      options: ["Cost To Reach","Click-Through Rate","Content Tracking Report","Customer Trigger Response"], correctIndex: 1,
      explanation: "CTR (Click-Through Rate) = clicks ÷ impressions, showing how compelling your link or ad is." },
    { question: "What is a conversion in digital marketing?",
      options: ["A page view","A social media follow","A desired action completed by a visitor (purchase, sign-up, etc.)","A bounce"], correctIndex: 2,
      explanation: "A conversion is whatever action you define as valuable — a sale, a form fill, a download, etc." },
    { question: "What does a high bounce rate typically indicate?",
      options: ["Visitors are very engaged","The page is not meeting visitor expectations","The site loads too slowly — always","Ad spend is too high"], correctIndex: 1,
      explanation: "A high bounce rate usually means the landing page content doesn't match what the visitor expected." }
  ]
};

async function run() {
  await sequelize.authenticate();
  console.log("Connected to MySQL. Syncing tables…");
  await sequelize.sync(); // creates quizzes table if not exists

  for (const c of rawCourses) {
    const [course] = await Course.upsert(
      { slug: c.slug, domain: c.domain, title: c.title, description: c.description },
      { returning: true }
    );
    const courseRow = await Course.findOne({ where: { slug: c.slug } });

    for (let index = 0; index < c.modules.length; index++) {
      const m = c.modules[index];
      await Module.upsert({
        courseId: courseRow.id,
        order:    index,
        title:    m.title,
        time:     m.time,
        body:     m.body,
        pdfFile:  `${c.slug}-${index}.pdf`
      });

      // Seed quiz questions for this module
      const moduleRow = await Module.findOne({ where: { courseId: courseRow.id, order: index } });
      const key = `${c.slug}-${index}`;
      const questions = QUIZ_DATA[key];

      if (questions && moduleRow) {
        // Clear old questions first so re-running seed is idempotent
        await Quiz.destroy({ where: { moduleId: moduleRow.id } });
        for (const q of questions) {
          await Quiz.create({ moduleId: moduleRow.id, ...q });
        }
        console.log(`  ✓ Quiz seeded for ${m.title} (${questions.length} questions)`);
      }
    }

    console.log(`Upserted: ${c.title} (${c.modules.length} modules)`);
  }

  console.log("Done.");
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
