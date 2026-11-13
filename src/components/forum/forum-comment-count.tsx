"use client";

import type { ForumPost } from "@/lib/forum-data";
import { useForumSession } from "./forum-provider";

export function ForumCommentCount({ post }: { post: ForumPost }) {
  const { getCommentCount } = useForumSession();
  return <>{getCommentCount(post)} komentar</>;
}
