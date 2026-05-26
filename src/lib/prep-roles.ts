export type PrepLevel = "fresher" | "mid" | "senior";

export interface PrepRole {
  id: string;
  label: string;
  icon: string;
  category: string;
  color: string;
  bg: string;
  border: string;
  tags: string[];
}

export const PREP_CATEGORIES = [
  { id: "frontend",   label: "Frontend",        icon: "🖥️"  },
  { id: "backend",    label: "Backend",          icon: "⚙️"  },
  { id: "fullstack",  label: "Full Stack",       icon: "🔗"  },
  { id: "data",       label: "Data",             icon: "📊"  },
  { id: "devops",     label: "DevOps / Cloud",   icon: "☁️"  },
  { id: "ai",         label: "AI / ML",          icon: "🤖"  },
  { id: "design",     label: "Design",           icon: "🎨"  },
  { id: "mobile",     label: "Mobile",           icon: "📱"  },
  { id: "management", label: "Management",       icon: "📋"  },
];

export const PREP_ROLES: PrepRole[] = [
  // Frontend
  { id: "javascript",   label: "JavaScript",            icon: "🟨",  category: "frontend",   color: "text-[#92681A]",    bg: "bg-[#FEF9EE]",    border: "border-[#F5DFA0]",   tags: ["ES6+", "Closures", "Promises", "DOM", "Event Loop"] },
  { id: "typescript",   label: "TypeScript",            icon: "🔷",  category: "frontend",   color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["Types", "Generics", "Interfaces", "Decorators"] },
  { id: "react",        label: "React Developer",       icon: "⚛️",  category: "frontend",   color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["React", "Hooks", "Redux", "TypeScript"] },
  { id: "nextjs",       label: "Next.js Developer",     icon: "▲",   category: "frontend",   color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["Next.js", "SSR", "App Router", "React"] },
  { id: "angular",      label: "Angular Developer",     icon: "🅰️",  category: "frontend",   color: "text-[#9B3D38]",     bg: "bg-[#FDF0EF]",     border: "border-[#F5C6C3]",    tags: ["Angular", "RxJS", "TypeScript", "NgRx"] },
  { id: "vue",          label: "Vue.js Developer",      icon: "💚",  category: "frontend",   color: "text-[#4A7C59]",   bg: "bg-[#EEF4F0]",   border: "border-[#C8DDD0]",  tags: ["Vue 3", "Pinia", "Composition API"] },
  { id: "frontend-gen", label: "Frontend (General)",    icon: "🖥️",  category: "frontend",   color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["HTML", "CSS", "JS", "Performance", "A11y"] },

  // Backend
  { id: "nodejs",       label: "Node.js Developer",     icon: "🟢",  category: "backend",    color: "text-[#4A7C59]",   bg: "bg-[#EEF4F0]",   border: "border-[#C8DDD0]",  tags: ["Node.js", "Express", "REST", "GraphQL"] },
  { id: "python",       label: "Python Developer",      icon: "🐍",  category: "backend",    color: "text-[#92681A]",  bg: "bg-[#FEF9EE]",  border: "border-[#F5DFA0]", tags: ["Python", "FastAPI", "Django", "Flask"] },
  { id: "java",         label: "Java Developer",        icon: "☕",  category: "backend",    color: "text-[#9B5A38]",  bg: "bg-[#FEF3EE]",  border: "border-[#F5D4C3]", tags: ["Java", "Spring Boot", "JVM", "Microservices"] },
  { id: "golang",       label: "Go Developer",          icon: "🐹",  category: "backend",    color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["Go", "Goroutines", "gRPC", "REST"] },

  // Full Stack
  { id: "mern",         label: "MERN Stack",            icon: "🔗",  category: "fullstack",  color: "text-[#5B4B8A]",  bg: "bg-[#F3F0FA]",  border: "border-[#D4C8F0]", tags: ["MongoDB", "Express", "React", "Node.js"] },
  { id: "fullstack-gen",label: "Full Stack (General)",  icon: "⚡",  category: "fullstack",  color: "text-[#5B4B8A]",  bg: "bg-[#F3F0FA]",  border: "border-[#D4C8F0]", tags: ["REST API", "DB Design", "Auth", "Deploy"] },

  // Data
  { id: "data-engineer",label: "Data Engineer",         icon: "🔧",  category: "data",       color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["Spark", "Kafka", "Airflow", "SQL", "ETL"] },
  { id: "data-analyst", label: "Data Analyst",          icon: "📊",  category: "data",       color: "text-[#4A7C59]",    bg: "bg-[#EEF4F0]",    border: "border-[#C8DDD0]",   tags: ["SQL", "Python", "Tableau", "Statistics"] },
  { id: "data-scientist",label:"Data Scientist",        icon: "🔬",  category: "data",       color: "text-[#5B4B8A]",  bg: "bg-[#F3F0FA]",  border: "border-[#D4C8F0]", tags: ["ML", "Python", "Statistics", "Deep Learning"] },

  // DevOps
  { id: "devops",       label: "DevOps Engineer",       icon: "🔄",  category: "devops",     color: "text-[#9B5A38]",  bg: "bg-[#FEF3EE]",  border: "border-[#F5D4C3]", tags: ["CI/CD", "Docker", "Kubernetes", "Linux"] },
  { id: "aws",          label: "AWS Cloud Engineer",    icon: "☁️",  category: "devops",     color: "text-[#92681A]",  bg: "bg-[#FEF9EE]",  border: "border-[#F5DFA0]", tags: ["EC2", "S3", "Lambda", "RDS", "IAM"] },
  { id: "sre",          label: "SRE / Platform Eng",    icon: "🛡️",  category: "devops",     color: "text-[#9B3D38]",     bg: "bg-[#FDF0EF]",     border: "border-[#F5C6C3]",    tags: ["SLO/SLA", "Observability", "Incident Mgmt"] },

  // AI/ML
  { id: "ml-engineer",  label: "ML Engineer",           icon: "🧠",  category: "ai",         color: "text-[#5B4B8A]",  bg: "bg-[#F3F0FA]",  border: "border-[#D4C8F0]", tags: ["PyTorch", "TensorFlow", "MLOps", "Feature Eng"] },
  { id: "llm-engineer", label: "LLM / AI Agent Eng",    icon: "🤖",  category: "ai",         color: "text-[#9B3D38]",    bg: "bg-[#FDF0EF]",    border: "border-[#F5C6C3]",   tags: ["LangChain", "RAG", "Prompt Eng", "Fine-tuning"] },
  { id: "ai-gen",       label: "AI/ML (General)",       icon: "✨",  category: "ai",         color: "text-[#5B4B8A]",  bg: "bg-[#F3F0FA]",  border: "border-[#D4C8F0]", tags: ["ML Fundamentals", "Python", "Math", "NLP"] },

  // Design
  { id: "ux-designer",  label: "UX Designer",           icon: "🎨",  category: "design",     color: "text-[#9B3D38]",    bg: "bg-[#FDF0EF]",    border: "border-[#F5C6C3]",   tags: ["Figma", "User Research", "Wireframing", "Usability"] },
  { id: "ui-designer",  label: "UI Designer",           icon: "🖌️",  category: "design",     color: "text-[#9B3D38]",    bg: "bg-[#FDF0EF]",    border: "border-[#F5C6C3]",   tags: ["Design Systems", "Figma", "Typography", "Color"] },

  // Mobile
  { id: "react-native", label: "React Native",          icon: "📱",  category: "mobile",     color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["React Native", "Expo", "Navigation", "Native Modules"] },
  { id: "flutter",      label: "Flutter Developer",     icon: "🦋",  category: "mobile",     color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]",    border: "border-[#E8E8E4]",   tags: ["Flutter", "Dart", "Widgets", "State Mgmt"] },

  // Management
  { id: "product-manager",label:"Product Manager",      icon: "📋",  category: "management", color: "text-[#92681A]",   bg: "bg-[#FEF9EE]",   border: "border-[#F5DFA0]",  tags: ["Roadmap", "Metrics", "Stakeholders", "Agile"] },
  { id: "eng-manager",  label: "Engineering Manager",   icon: "👥",  category: "management", color: "text-[#4A7C59]",   bg: "bg-[#EEF4F0]",   border: "border-[#C8DDD0]",  tags: ["Leadership", "1:1s", "Hiring", "Delivery"] },
];

export const LEVELS: { id: PrepLevel; label: string; desc: string; emoji: string }[] = [
  { id: "fresher", label: "Fresher",  desc: "0–1 years, campus placements, first job",  emoji: "🌱" },
  { id: "mid",     label: "Mid",      desc: "2–5 years, switching roles or companies",   emoji: "🚀" },
  { id: "senior",  label: "Senior",   desc: "5+ years, lead/staff/principal roles",      emoji: "⭐" },
];
