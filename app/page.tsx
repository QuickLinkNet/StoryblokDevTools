"use client";

import dynamic from 'next/dynamic';

const StoryblokDevTools = dynamic(
  () => import('@/components/storyblok/StoryblokDevTools').then(mod => ({ default: mod.StoryblokDevTools })),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoryblokDevTools />
    </div>
  );
}
