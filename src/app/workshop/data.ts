// Workshop content — sourced from
// "Dashboard Monitoring & Performance Reporting Workshop" (MazNexa)

export const BENEFITS = [
  {
    title: "A single, unified source of truth",
    body: "All data is consolidated in one reliable place, removing the inconsistencies that arise from multiple, disconnected sources.",
    icon: "database",
  },
  {
    title: "Time and resource savings",
    body: "Automating and streamlining data access reduces the effort, manpower, and cost spent on manual retrieval and verification.",
    icon: "timer",
  },
  {
    title: "Clarity and ease of understanding",
    body: "Data is presented in a simple, well-organized format that's easy to interpret and act on — even for non-technical users.",
    icon: "eye",
  },
  {
    title: "Instant access instead of delays",
    body: "Users get the information they need in real time, eliminating waiting periods caused by manual processes or outdated systems.",
    icon: "zap",
  },
  {
    title: "Continuous updates, no interruption",
    body: "The system stays current automatically, so users always work with the latest information without service gaps or downtime.",
    icon: "refresh",
  },
];

export const KPI_STEPS = [
  {
    n: "01",
    title: "Define your goals before selecting metrics",
    body: "Start by clarifying what you're trying to achieve, so the metrics you choose actually align with your objectives rather than being chosen arbitrarily.",
  },
  {
    n: "02",
    title: "Choose only the important metrics",
    body: "Focus on a small, manageable set of key indicators instead of overwhelming yourself or your audience with too much data.",
  },
  {
    n: "03",
    title: "Use metrics that help you make decisions",
    body: "Prioritize indicators that directly inform action, rather than ones that are just interesting to look at.",
  },
  {
    n: "04",
    title: "Rank the most important metrics at the top",
    body: "Place the highest-priority indicators in the most visible positions so they get attention first.",
  },
  {
    n: "05",
    title: "Avoid numbers that look good but aren't useful",
    body: "Steer clear of \"vanity metrics\" that seem impressive but don't provide meaningful insight or drive better decisions.",
  },
];

export const INTERPRET_STEPS = [
  {
    n: "01",
    title: "Compare current data with previous data",
    body: "Look at how numbers have changed over time to understand progress, decline, or stability — rather than viewing data in isolation.",
  },
  {
    n: "02",
    title: "Look for patterns and trends",
    body: "Identify recurring behaviors or directional movements in the data that reveal deeper insights beyond single data points.",
  },
  {
    n: "03",
    title: "Ask \"why\" when you see changes",
    body: "Don't just note that something changed; dig into the underlying causes to understand what's driving the shift.",
  },
  {
    n: "04",
    title: "Discover unusual things",
    body: "Watch for outliers or anomalies that may signal problems, opportunities, or errors worth investigating.",
  },
  {
    n: "05",
    title: "Turn numbers into actionable insights",
    body: "Go beyond just reporting data by translating findings into clear recommendations or next steps that drive decisions.",
  },
];

export const REPORTING_PRACTICES = [
  {
    title: "Set reporting timing based on each department's needs",
    body: "Adjust the frequency of updates (real-time, daily, weekly, etc.) to match how urgently different teams actually need the information.",
  },
  {
    title: "Create different dashboards for different people",
    body: "Tailor views to each audience's role, showing only the metrics relevant to their responsibilities instead of a one-size-fits-all report.",
  },
  {
    title: "Use simple and clear language",
    body: "Avoid technical jargon so that reports and dashboards are easily understood by all stakeholders, regardless of their background.",
  },
  {
    title: "Alert immediately for critical issues",
    body: "Ensure urgent problems trigger instant notifications rather than waiting to be discovered in a routine report.",
  },
  {
    title: "Continuously ask for feedback from the team",
    body: "Regularly check in with the users of your dashboards to improve relevance, usability, and accuracy over time.",
  },
];

export const TOOLS_TABLE = [
  { tool: "Power BI", type: "Dashboard Software", speed: "Fast", best: "Complex data analysis" },
  { tool: "Zoho Analytics", type: "Dashboard Software", speed: "Very Fast", best: "Budget-friendly dashboards" },
  { tool: "Agency Analytics", type: "Specialized Tool", speed: "Very Fast", best: "Marketing agencies" },
  { tool: "Claude AI", type: "AI Assistant", speed: "Instant", best: "Data interpretation" },
];

export const TOOL_DETAILS = [
  {
    n: "1",
    name: "Power BI",
    does: [
      "Advanced data visualization and business intelligence tool",
      "Creates interactive dashboards and reports from any data source",
      "Allows real-time data analysis and sharing",
    ],
    bestFor: [
      "Large companies with complex data",
      "In-depth analytics and forecasting",
      "Interactive, dynamic dashboards",
      "Advanced users comfortable with data",
    ],
    features: [
      "Stunning visual reports that drill down into details",
      "Connects to multiple data sources automatically",
      "Easy to update and refresh",
    ],
  },
  {
    n: "2",
    name: "Zoho Analytics",
    does: [
      "All-in-one business intelligence platform",
      "Creates dashboards, reports, and automated insights",
      "Integrates with other Zoho tools and third-party apps",
    ],
    bestFor: [
      "Small to medium businesses",
      "Quick dashboard setup without coding",
      "Teams already using Zoho products",
      "Affordable solution with great support",
    ],
    features: [
      "Drag-and-drop dashboard builder",
      "Automatic data insights and alerts",
      "Pre-built templates for a quick start",
      "Great for reporting and KPI tracking",
    ],
  },
  {
    n: "3",
    name: "Agency Analytics",
    does: [
      "Specialized tool for marketing agencies and businesses",
      "Tracks marketing campaign performance across platforms",
      "Consolidates data from Google Ads, Facebook, social media, etc.",
    ],
    bestFor: [
      "Marketing agencies managing multiple clients",
      "Tracking ROI on ad spend",
      "Client reporting and performance monitoring",
      "Social media and digital marketing metrics",
    ],
    features: [
      "Pulls data from all marketing platforms in one place",
      "Automated client reporting",
      "Budget tracking and ROI calculation",
      "Easy comparison of campaign performance",
    ],
  },
  {
    n: "4",
    name: "Claude AI",
    does: [
      "AI assistant for interpreting data and generating insight",
      "Explains trends, anomalies, and the \"why\" behind the numbers",
      "Turns raw metrics into clear, plain-language recommendations",
    ],
    bestFor: [
      "Instant data interpretation and summaries",
      "Drafting stakeholder-ready narratives",
      "Spotting outliers and opportunities fast",
      "Teams that want insight, not just charts",
    ],
    features: [
      "Natural-language questions over your data",
      "Fast, on-demand analysis",
      "Actionable next-step recommendations",
      "Pairs with any dashboard tool",
    ],
  },
];

export const SECTIONS = [
  { id: "why", label: "Why Dashboards" },
  { id: "structure", label: "Structure & KPIs" },
  { id: "interpret", label: "Interpretation" },
  { id: "reporting", label: "Reporting" },
  { id: "tools", label: "Tools" },
];
