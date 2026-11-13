import type { Metadata } from "next";
import { ForumFeed } from "@/components/forum/forum-feed";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { forumPosts } from "@/lib/forum-data";

export const metadata: Metadata = {
  title: "Forum aquascape Semarang | Aquaku",
  description:
    "Cerita tank, perawatan tanaman, dan tanya jawab aquascape bersama komunitas Semarang. Forum demo Aquaku tanpa voting.",
};

export default function ForumPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ForumFeed posts={forumPosts} sidebar={<ForumSidebar />} />
    </div>
  );
}
