"use client";

import { Code, Copy, FileCode, Terminal, Hash, Globe, Clock } from "lucide-react";
import { useState } from "react";

export function DeveloperToolsTab({ story, onCopy, copiedText }: any) {
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [pathSearch, setPathSearch] = useState("");

  // === Path Generator ===
  const generatePath = (obj: any, currentPath: string = "story.content", paths: string[] = []): string[] => {
    if (!obj || typeof obj !== "object") return paths;
    Object.entries(obj).forEach(([key, value]) => {
      if (!["_uid", "component", "_editable"].includes(key)) {
        const newPath = `${currentPath}.${key}`;
        paths.push(newPath);
        if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            if (item && typeof item === "object") {
              generatePath(item, `${newPath}[${idx}]`, paths);
            }
          });
        } else if (typeof value === "object" && value !== null) {
          generatePath(value, newPath, paths);
        }
      }
    });
    return paths;
  };

  const allPaths = generatePath(story.story.content).slice(0, 50);
  const filteredPaths = allPaths.filter((p) =>
      p.toLowerCase().includes(pathSearch.toLowerCase())
  );
  const STORYBLOK_TOKEN = process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN;

  // === Snippets ===
  const snippets = [
    {
      id: "rest-api",
      label: "REST API Call",
      language: "javascript",
      code: `// Fetch story using REST API
const response = await fetch(
  'https://api.storyblok.com/v2/cdn/stories/${story.story.full_slug}?token=${STORYBLOK_TOKEN}'
);
const data = await response.json();
console.log(data.story);`,
    },
    {
      id: "graphql",
      label: "GraphQL Query",
      language: "graphql",
      code: `# GraphQL query for this story
{
  StoryItem(id: "${story.story.id}") {
    name
    slug
    full_slug
    content
    published_at
    created_at
  }
}`,
    },
    {
      id: "typescript-interface",
      label: "TypeScript Interface",
      language: "typescript",
      code: `// Generated TypeScript interface
interface Story {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: {
    component: "${story.story.content.component}";
    _uid: string;
    // Add your custom fields here
  };
  published_at: string | null;
  created_at: string;
}`,
    },
    {
      id: "react-component",
      label: "React Component",
      language: "tsx",
      code: `// React component example
import { storyblokEditable } from "@storyblok/react";

export const ${story.story.content.component} = ({ blok }) => {
  return (
    <div {...storyblokEditable(blok)}>
      {/* Add your component logic */}
      <h1>{blok.title}</h1>
    </div>
  );
};`,
    },
    {
      id: "next-fetch",
      label: "Next.js Data Fetching",
      language: "typescript",
      code: `// Next.js App Router
export async function generateStaticParams() {
  const { data } = await getStoryblokApi().get('cdn/stories', {
    version: 'published',
  });

  return data.stories.map((story) => ({
    slug: story.slug,
  }));
}

export default async function Page({ params }) {
  const { data } = await getStoryblokApi().get(
    'cdn/stories/${story.story.full_slug}',
    { version: 'published' }
  );

  return <StoryblokComponent blok={data.story.content} />;
}`,
    },
    {
      id: "webhook",
      label: "Webhook Handler",
      language: "javascript",
      code: `// Webhook handler for story updates
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { story_id, action } = req.body;

    if (story_id === ${story.story.id}) {
      // Handle story update
      console.log('Story updated:', action);

      // Revalidate cache, trigger build, etc.
      await res.revalidate('/${story.story.full_slug}');
    }

    return res.status(200).json({ received: true });
  }
}`,
    },
  ];

  // === Story Meta ===
  const updatedAt = new Date(story.story.updated_at).toLocaleString();
  const createdAt = new Date(story.story.created_at).toLocaleString();

  return (
      <div className="p-4 space-y-6">
        {/* Story Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Hash className="h-4 w-4" /> ID: {story.story.id}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Globe className="h-4 w-4" /> Lang: {story.story.lang}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="h-4 w-4" /> Created: {createdAt}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="h-4 w-4" /> Updated: {updatedAt}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Code className="h-4 w-4" /> {story.story.name} ({story.story.full_slug})
          </div>
        </div>

        {/* Path Search */}
        <div className="mb-3">
          <input
              type="text"
              placeholder="Search paths..."
              value={pathSearch}
              onChange={(e) => setPathSearch(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Copy Paths */}
        <div className="p-4 bg-slate-800 bg-opacity-90 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-5 w-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100">Quick Copy Paths</h3>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filteredPaths.map((path, idx) => (
                <button
                    key={idx}
                    onClick={() => onCopy(path, `path-${idx}`)}
                    className="w-full flex items-center justify-between gap-2 p-2 bg-slate-900 bg-opacity-90 hover:bg-slate-700 border border-slate-700 rounded text-left transition-colors group"
                >
                  <code className="text-xs font-mono text-slate-300 truncate flex-1">{path}</code>
                  {copiedText === `path-${idx}` ? (
                      <span className="text-[10px] font-semibold text-green-400">Copied!</span>
                  ) : (
                      <Copy className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  )}
                </button>
            ))}
          </div>
        </div>

        {/* Snippets */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100">Code Snippets</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {snippets.map((snippet) => (
                <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippet(snippet.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSnippet === snippet.id
                            ? "border-cyan-500 bg-slate-800 bg-opacity-90 text-cyan-300"
                            : "border-slate-700 hover:border-slate-500 bg-slate-900 bg-opacity-90 text-slate-300"
                    }`}
                >
                  <FileCode className="h-4 w-4 mb-1 text-cyan-400" />
                  <div className="text-xs font-semibold">{snippet.label}</div>
                </button>
            ))}
          </div>

          {selectedSnippet && (
              <div className="space-y-2">
                {snippets
                    .filter((s) => s.id === selectedSnippet)
                    .map((snippet) => (
                        <div key={snippet.id} className="border border-slate-700 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-slate-800 text-slate-100">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-cyan-400" />
                              <span className="text-sm font-medium">{snippet.label}</span>
                            </div>
                            <button
                                onClick={() => onCopy(snippet.code, snippet.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                              {copiedText === snippet.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <pre className="p-4 bg-slate-900 bg-opacity-90 text-green-400 text-xs font-mono overflow-x-auto leading-relaxed">
                    {snippet.code}
                  </pre>
                        </div>
                    ))}
              </div>
          )}
        </div>

        {/* Pro Tip */}
        <div className="p-4 bg-slate-800 bg-opacity-90 border border-slate-700 rounded-lg">
          <div className="text-sm text-slate-300">
            <strong className="text-cyan-400">💡 Pro Tip:</strong> Use these snippets as starting points.
            Replace placeholders (<code className="text-cyan-300">YOUR_TOKEN</code>, slugs, etc.) with your actual config.
          </div>
        </div>

        <div className="flex gap-3 mt-3 text-xs">
          <a
              href="https://www.storyblok.com/docs/api/content-delivery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
          >
            REST API Docs
          </a>
          <a
              href="https://www.storyblok.com/docs/api/content-delivery/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
          >
            GraphQL Docs
          </a>
          <a
              href="https://www.storyblok.com/docs/guide/in-depth/sdk/client-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
          >
            JS Client Docs
          </a>
          <a
              href="https://www.storyblok.com/docs/guide/in-depth/react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
          >
            React SDK Docs
          </a>
        </div>
      </div>
  );
}
