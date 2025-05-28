"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Comprehensive technology options
const PREDEFINED_TECH_OPTIONS = [
  // Frontend Frameworks & Libraries
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Nuxt.js",
  "Svelte",
  "SvelteKit",
  "Gatsby",
  "Remix",
  "Solid.js",
  "Preact",
  "Lit",
  "Stencil",
  "Alpine.js",
  "Ember.js",
  "Backbone.js",
  "jQuery",

  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "C",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "Scala",
  "Clojure",
  "F#",
  "Haskell",
  "Erlang",
  "Elixir",
  "R",
  "MATLAB",
  "Julia",
  "Perl",
  "Lua",
  "Shell",
  "PowerShell",

  // CSS & Styling
  "CSS",
  "HTML",
  "Sass",
  "SCSS",
  "Less",
  "Stylus",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Ant Design",
  "Chakra UI",
  "Semantic UI",
  "Bulma",
  "Foundation",
  "Styled Components",
  "Emotion",
  "CSS Modules",
  "PostCSS",

  // Backend Frameworks
  "Node.js",
  "Express",
  "Koa",
  "Fastify",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Tornado",
  "Pyramid",
  "Ruby on Rails",
  "Sinatra",
  "Spring Boot",
  "Spring Framework",
  "Quarkus",
  "Micronaut",
  "ASP.NET Core",
  "ASP.NET",
  ".NET Framework",
  "Laravel",
  "Symfony",
  "CodeIgniter",
  "CakePHP",
  "Gin",
  "Echo",
  "Fiber",
  "Actix",
  "Rocket",
  "Phoenix",
  "Cowboy",

  // Databases
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MariaDB",
  "Redis",
  "Elasticsearch",
  "CouchDB",
  "Cassandra",
  "DynamoDB",
  "Firebase Firestore",
  "Realtime Database",
  "Neo4j",
  "InfluxDB",
  "TimescaleDB",
  "ClickHouse",
  "Apache Spark",
  "BigQuery",
  "Snowflake",
  "Oracle Database",
  "SQL Server",
  "IBM Db2",
  "Amazon RDS",
  "Azure SQL",
  "CockroachDB",
  "PlanetScale",
  "Supabase",
  "FaunaDB",

  // Mobile Development
  "React Native",
  "Flutter",
  "Ionic",
  "Xamarin",
  "Cordova",
  "PhoneGap",
  "Unity",
  "SwiftUI",
  "UIKit",
  "Android SDK",
  "Kotlin Multiplatform",
  "Capacitor",

  // Cloud Platforms
  "AWS",
  "Amazon Web Services",
  "Azure",
  "Google Cloud Platform",
  "GCP",
  "Heroku",
  "Vercel",
  "Netlify",
  "DigitalOcean",
  "Linode",
  "Vultr",
  "Railway",
  "Render",
  "Fly.io",
  "Cloudflare",
  "Firebase",
  "Oracle Cloud",
  "IBM Cloud",
  "Alibaba Cloud",

  // DevOps & Containerization
  "Docker",
  "Kubernetes",
  "Docker Compose",
  "Podman",
  "Vagrant",
  "Ansible",
  "Terraform",
  "Pulumi",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "CircleCI",
  "Travis CI",
  "TeamCity",
  "Azure DevOps",
  "Bamboo",
  "Chef",
  "Puppet",
  "SaltStack",

  // API Technologies
  "REST API",
  "GraphQL",
  "Apollo GraphQL",
  "Relay",
  "gRPC",
  "tRPC",
  "WebSockets",
  "Socket.IO",
  "Server-Sent Events",
  "OpenAPI",
  "Swagger",
  "JSON API",
  "JSON-RPC",
  "XML-RPC",
  "SOAP",

  // Testing
  "Jest",
  "Mocha",
  "Jasmine",
  "Cypress",
  "Playwright",
  "Puppeteer",
  "Selenium",
  "WebDriver",
  "Testing Library",
  "Enzyme",
  "Vitest",
  "Karma",
  "Protractor",
  "Cucumber",
  "PyTest",
  "JUnit",
  "TestNG",
  "NUnit",
  "xUnit",
  "RSpec",
  "Minitest",

  // Build Tools
  "Webpack",
  "Vite",
  "Rollup",
  "Parcel",
  "esbuild",
  "SWC",
  "Babel",
  "ESLint",
  "Prettier",
  "TypeScript Compiler",
  "Grunt",
  "Gulp",
  "Browserify",
  "Snowpack",

  // State Management
  "Redux",
  "MobX",
  "Zustand",
  "Recoil",
  "Jotai",
  "Valtio",
  "Context API",
  "Vuex",
  "Pinia",
  "NgRx",
  "Akita",

  // Machine Learning & AI
  "TensorFlow",
  "PyTorch",
  "Keras",
  "Scikit-learn",
  "OpenCV",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Jupyter",
  "Anaconda",
  "MLflow",
  "Kubeflow",
  "Apache Airflow",
  "Spark MLlib",
  "XGBoost",
  "LightGBM",
  "Hugging Face",
  "OpenAI",
  "LangChain",

  // Content Management
  "WordPress",
  "Drupal",
  "Joomla",
  "Strapi",
  "Contentful",
  "Sanity",
  "Ghost",
  "Directus",
  "Keystone",
  "Forestry",
  "Netlify CMS",

  // Game Development
  "Unity",
  "Unreal Engine",
  "Godot",
  "Phaser",
  "Three.js",
  "Babylon.js",
  "PixiJS",
  "Cocos2d",
  "GameMaker Studio",
  "Construct",

  // Version Control
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Mercurial",
  "SVN",
  "Perforce",

  // Monitoring & Analytics
  "Google Analytics",
  "Mixpanel",
  "Amplitude",
  "Hotjar",
  "LogRocket",
  "Sentry",
  "Bugsnag",
  "Rollbar",
  "New Relic",
  "DataDog",
  "Grafana",
  "Prometheus",
  "Kibana",
  "Splunk",

  // Authentication
  "Auth0",
  "Firebase Auth",
  "AWS Cognito",
  "Okta",
  "Keycloak",
  "NextAuth",
  "Passport.js",
  "JWT",
  "OAuth",
  "SAML",
  "LDAP",

  // Message Queues
  "RabbitMQ",
  "Apache Kafka",
  "Redis Pub/Sub",
  "Amazon SQS",
  "Google Pub/Sub",
  "Apache Pulsar",
  "NATS",
  "ZeroMQ",

  // Blockchain & Web3
  "Ethereum",
  "Solidity",
  "Web3.js",
  "Ethers.js",
  "Hardhat",
  "Truffle",
  "Ganache",
  "MetaMask",
  "IPFS",
  "Polygon",
  "Solana",
  "Bitcoin",

  // Design Tools
  "Figma",
  "Sketch",
  "Adobe XD",
  "InVision",
  "Zeplin",
  "Framer",
  "Principle",
  "Adobe Photoshop",
  "Adobe Illustrator",

  // Documentation
  "Gitbook",
  "Notion",
  "Confluence",
  "Docsify",
  "VuePress",
  "Docusaurus",
  "Sphinx",
  "MkDocs",
  "GitBook",

  // Other Tools & Technologies
  "Electron",
  "Tauri",
  "PWA",
  "WebAssembly",
  "Service Workers",
  "IndexedDB",
  "Web Workers",
  "WebRTC",
  "WebGL",
  "Canvas API",
  "Geolocation API",
  "Payment Request API",
  "Push Notifications",
  "Yarn",
  "npm",
  "pnpm",
  "Bower",
  "Composer",
  "pip",
  "Maven",
  "Gradle",
  "NuGet",
  "CocoaPods",
  "Carthage",
  "Swift Package Manager",
];

interface TechStackSelectorProps {
  selectedTech: string[];
  onChange: (technologies: string[]) => void;
}

export function TechStackSelector({
  selectedTech,
  onChange,
}: TechStackSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter technologies based on input and exclude already selected ones
  // Prioritize technologies that start with the input (prefix match)
  const filteredSuggestions = (() => {
    if (inputValue.trim().length === 0) return [];

    const input = inputValue.toLowerCase();
    const available = PREDEFINED_TECH_OPTIONS.filter(
      (tech) => !selectedTech.includes(tech)
    );

    // Technologies that start with the input (prefix match)
    const prefixMatches = available.filter((tech) =>
      tech.toLowerCase().startsWith(input)
    );

    // Technologies that contain the input but don't start with it
    const containsMatches = available.filter(
      (tech) =>
        tech.toLowerCase().includes(input) &&
        !tech.toLowerCase().startsWith(input)
    );

    // Combine prefix matches first, then contains matches, limit to 10
    return [...prefixMatches, ...containsMatches].slice(0, 10);
  })();

  // Add technology
  const handleAddTech = (techToAdd?: string) => {
    const tech = techToAdd || inputValue.trim();
    if (tech && !selectedTech.includes(tech)) {
      onChange([...selectedTech, tech]);
      setInputValue(""); // Clear input
      setShowSuggestions(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  };

  // Handle pressing Enter in the input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddTech();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Remove a technology
  const handleRemoveTech = (techToRemove: string) => {
    onChange(selectedTech.filter((tech) => tech !== techToRemove));
  };

  // Handle suggestion click
  const handleSuggestionClick = (tech: string) => {
    handleAddTech(tech);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {selectedTech.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="bg-secondary-background border border-divider py-1.5 px-2.5"
          >
            {tech}
            <button
              type="button"
              onClick={() => handleRemoveTech(tech)}
              className="ml-1.5 text-secondary-text hover:text-primary-text focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
        {selectedTech.length === 0 && (
          <p className="text-secondary-text text-sm">
            No technologies selected
          </p>
        )}
      </div>

      <div className="relative">
        <div className="flex">
          <div className="flex-1 relative">
            <Input
              placeholder="Search and add technology"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking on them
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              className="bg-primary-background"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-secondary-background border border-divider rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                {filteredSuggestions.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleSuggestionClick(tech)}
                    className="w-full text-left px-3 py-2 hover:bg-hover-active text-sm transition-colors"
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => handleAddTech()}
            disabled={!inputValue.trim()}
            className="ml-2 text-primary-cta/90 hover:text-primary-cta border border-divider hover:bg-secondary-background h-10"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
