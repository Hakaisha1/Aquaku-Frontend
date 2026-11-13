import { expect, test, type Page } from "@playwright/test";
import {
  countForumComments,
  forumPosts,
  forumThreads,
} from "@/lib/forum-data";
import {
  FORUM_LIMITS,
  FORUM_STORAGE_KEY,
  getSessionComments,
  isLocalForumSlug,
  normalizeForumCommentBody,
  normalizeLocalForumPost,
  parseForumSession,
} from "@/lib/forum-session";

const fixtureSlug = "trimming-rotala-tank-60-cm";
const publishedAt = "2026-11-04T08:15:00+07:00";
const localPathPattern =
  /^\/forum\/local-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const localBody =
  "Tank 60 cm di Tembalang berusia empat bulan. Saya mencoba memangkas rumpun secara bertahap.";

function localId(index: number) {
  return `local-00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
}

function storedPost(index = 1) {
  return {
    slug: localId(index),
    title: `Catatan trimming lokal ${index}`,
    body: localBody,
    category: "Perawatan",
    publishedAt,
  };
}

function storedReply(
  index: number,
  slug = fixtureSlug,
  parentId: string | null = null,
) {
  return {
    slug,
    parentId,
    comment: {
      id: localId(index),
      body: `Pengalaman lokal nomor ${index}`,
      time: publishedAt,
    },
  };
}

function discussionCard(page: Page, title: string) {
  return page.getByRole("main").getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

function discussionLink(page: Page, title: string) {
  return discussionCard(page, title).getByRole("link").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

async function createDiscussion(page: Page, title: string) {
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Tulis diskusi", exact: true }).click();
  await main.getByLabel("Judul diskusi", { exact: true }).fill(title);
  await main.getByLabel("Kategori", { exact: true }).selectOption("Perawatan");
  await main.getByLabel("Ceritakan konteksnya", { exact: true }).fill(localBody);
  await main
    .getByRole("button", { name: "Tambahkan diskusi lokal", exact: true })
    .click();
  const link = discussionLink(page, title);
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", localPathPattern);
  await expect(discussionCard(page, title)).toContainText("Diskusi lokal");
  const path = await link.getAttribute("href");
  return path!;
}

async function addComment(page: Page, body: string) {
  const main = page.getByRole("main");
  await main.getByLabel("Tambahkan pengalamanmu", { exact: true }).fill(body);
  await main
    .getByRole("button", { name: "Kirim komentar lokal", exact: true })
    .click();
  await expect(main.getByRole("article").getByText(body, { exact: true })).toBeVisible();
}

async function addNestedReply(page: Page, parentBody: string, body: string) {
  const main = page.getByRole("main");
  const parent = main.getByRole("article", {
    name: "Komentar Kamu (demo)",
    exact: true,
  }).filter({ has: page.getByText(parentBody, { exact: true }) });
  await parent
    .getByRole("button", { name: "Balas komentar Kamu (demo)", exact: true })
    .click();
  await parent.getByLabel("Balas Kamu (demo)", { exact: true }).fill(body);
  await parent
    .getByRole("button", { name: "Kirim balasan lokal", exact: true })
    .click();
  await expect(parent.getByText(body, { exact: true })).toBeVisible();
}

async function expectComments(page: Page, total: number) {
  await expect(
    page.getByRole("main").getByRole("heading", {
      name: `Obrolan (${total})`,
      exact: true,
    }),
  ).toBeVisible();
}

async function expectCardCount(page: Page, title: string, count: number) {
  await expect(
    discussionCard(page, title).getByRole("link", {
      name: `${count} komentar: ${title}`,
      exact: true,
    }),
  ).toBeVisible();
}

async function backToFeed(page: Page) {
  await page.getByRole("main")
    .getByRole("link", { name: "Semua diskusi", exact: true })
    .click();
  await expect(page).toHaveURL(/\/forum$/);
}

async function expectPrivateMetadata(page: Page) {
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /\bnoindex\b/);
  await expect(robots).toHaveAttribute("content", /\bnofollow\b/);
}

test("local discussions have reloadable details, persistent nested replies and sortable counts", async ({ page }) => {
  const main = page.getByRole("main");
  const title = "Trimming bertahap di tank lokal Tembalang";
  const detail = main.getByRole("article").filter({
    has: page.getByRole("heading", { level: 1, name: title, exact: true }),
  });
  const quietTitle = "Catatan pembanding tanpa komentar lokal";
  const comment = "Pangkas sepertiga rumpun agar jalur renang tetap terbuka.";
  const nested = "Saya lanjutkan bagian berikutnya setelah satu minggu.";
  await page.goto("/forum");
  await createDiscussion(page, quietTitle);
  const path = await createDiscussion(page, title);
  await expect(main.getByRole("article")).toHaveCount(forumPosts.length + 2);
  await discussionLink(page, title).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(detail.getByText(localBody, { exact: true })).toBeVisible();
  await expectPrivateMetadata(page);
  await page.reload();
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(detail.getByText(localBody, { exact: true })).toBeVisible();
  await expectComments(page, 0);
  await addComment(page, comment);
  await expectComments(page, 1);
  await addNestedReply(page, comment, nested);
  await expectComments(page, 2);
  await page.reload();
  await expect(main.getByRole("article").getByText(comment, { exact: true })).toBeVisible();
  await expect(main.getByRole("article").getByText(nested, { exact: true })).toBeVisible();
  await expectComments(page, 2);
  await backToFeed(page);
  await expectCardCount(page, title, 2);
  await expectCardCount(page, quietTitle, 0);
  await main.getByLabel("Urutkan diskusi", { exact: true })
    .selectOption({ label: "Paling dibahas" });
  // Check the complete order, not a one-result search that cannot exercise sorting.
  const session = parseForumSession(await page.evaluate(
    (key) => localStorage.getItem(key), FORUM_STORAGE_KEY,
  ));
  const expectedOrder = [...forumPosts, ...session.posts]
    .map((post) => ({
      ...post,
      count: countForumComments(getSessionComments(session, post.slug)),
    }))
    .sort((a, b) => b.count - a.count || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  for (let index = 0; index < expectedOrder.length; index++) {
    await expect(main.getByRole("article").nth(index).getByRole("link").first())
      .toHaveAttribute("href", `/forum/${expectedOrder[index].slug}`);
  }
  await main.getByLabel("Cari diskusi di forum", { exact: true })
    .fill("  TRIMMING BERTAHAP DI TANK LOKAL  ");
  await expect(main.getByRole("article")).toHaveCount(1);
  await expectCardCount(page, title, 2);
  await main.getByRole("button", { name: /^Alga & air/ }).click();
  await expect(main.getByRole("article")).toHaveCount(0);
  await main.getByRole("button", { name: /^Perawatan/ }).click();
  await expect(main.getByRole("article")).toHaveCount(1);
  await page.reload();
  await expectCardCount(page, title, 2);
  await expectCardCount(page, quietTitle, 0);
});

test("local URLs are private to their browser, missing UUIDs do not leak content and are noindex", async ({ page, browser }) => {
  const title = "Cerita privat browser tentang trimming lokal";
  const main = page.getByRole("main");
  await page.goto("/forum");
  const path = await createDiscussion(page, title);
  // Server-rendered responses cannot contain content stored only in localStorage.
  const response = await page.request.get(path);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html.includes(title), "Server HTML must not expose a local title").toBe(false);
  expect(html.includes(localBody), "Server HTML must not expose a local body").toBe(false);
  await page.goto(`/forum/${localId(9999)}`);
  await expect(main.getByRole("heading", { level: 1 }))
    .toHaveText("Diskusi lokal tidak ditemukan.");
  await expect(main.getByText(title, { exact: true })).toHaveCount(0);
  await expect(main.getByText(localBody, { exact: true })).toHaveCount(0);
  await expect(main.getByLabel("Tambahkan pengalamanmu", { exact: true }))
    .toHaveCount(0);
  await expectPrivateMetadata(page);

  const isolated = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const other = await isolated.newPage();
    await other.goto(path);
    await expect(other.getByRole("main").getByRole("heading", { level: 1 }))
      .toHaveText("Diskusi lokal tidak ditemukan.");
    await expect(other.getByRole("main")).not.toContainText(title);
    await expect(other.getByRole("main")).not.toContainText(localBody);
    await expectPrivateMetadata(other);
  } finally {
    await isolated.close();
  }
  await page.goto(path);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(title);
  await expectPrivateMetadata(page);
});

test("malformed storage does not crash the forum and is replaced by a usable session", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, "{broken-json");
  }, FORUM_STORAGE_KEY);
  await page.goto("/forum");
  await expect(page.getByRole("main").getByRole("article"))
    .toHaveCount(forumPosts.length);
  const title = "Diskusi baru setelah penyimpanan rusak";
  const path = await createDiscussion(page, title);
  const raw = await page.evaluate((key) => localStorage.getItem(key), FORUM_STORAGE_KEY);
  expect(parseForumSession(raw).posts.map((post) => post.title)).toEqual([title]);
  await discussionLink(page, title).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await page.reload();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 }))
    .toHaveText(title);
  await expectComments(page, 0);
  expect(errors).toEqual([]);
});

for (const blockReads of [true, false]) {
  test(`forum memory fallback survives client navigation when ${blockReads ? "reads and writes are blocked" : "writes exceed quota"}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(({ key, blockReads }) => {
      const getItem = Storage.prototype.getItem;
      const setItem = Storage.prototype.setItem;
      Storage.prototype.getItem = function (name) {
        if (name === key && blockReads) {
          throw new DOMException("Storage blocked", "SecurityError");
        }
        return getItem.call(this, name);
      };
      Storage.prototype.setItem = function (name, value) {
        if (name === key) {
          throw new DOMException("Storage full or blocked", "QuotaExceededError");
        }
        return setItem.call(this, name, value);
      };
    }, { key: FORUM_STORAGE_KEY, blockReads });
    await page.goto("/forum");
    const title = "Diskusi dalam memori saat storage tidak tersedia";
    const comment = "Komentar sementara tetap terbaca saat navigasi client.";
    const nested = "Balasan sementara juga tidak dikirim ke server.";
    const path = await createDiscussion(page, title);
    const main = page.getByRole("main");
    const notice = main.getByRole("status").filter({
      hasText: "Penyimpanan browser tidak tersedia.",
    });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("perubahan bisa hilang saat refresh");
    await expect(notice).not.toContainText("termasuk setelah refresh");
    // A full document navigation would erase this marker and the memory-only data.
    await page.evaluate(() => {
      document.documentElement.dataset.forumNavigation = "memory-session";
    });
    await discussionLink(page, title).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(notice).toBeVisible();
    await addComment(page, comment);
    await addNestedReply(page, comment, nested);
    await expectComments(page, 2);
    await backToFeed(page);
    await expectCardCount(page, title, 2);
    await expect(notice).toBeVisible();
    await discussionLink(page, title).click();
    await expect(main.getByRole("article").getByText(comment, { exact: true })).toBeVisible();
    await expect(main.getByRole("article").getByText(nested, { exact: true })).toBeVisible();
    await expect(page.locator("html"))
      .toHaveAttribute("data-forum-navigation", "memory-session");
    expect(errors).toEqual([]);
    // Intentionally no refresh: this mode promises only a live client session.
  });
}

test("tabs receive new discussions, reply counts and storage clear without reloading", async ({ page, context }) => {
  const title = "Diskusi lokal tersinkron di dua tab browser";
  const comment = "Komentar dari tab pertama untuk diskusi bersama.";
  const nested = "Balasan dari tab kedua langsung memperbarui jumlah.";
  await page.goto("/forum");
  const other = await context.newPage();
  try {
    await other.goto("/forum");
    await expect(other.getByRole("main").getByRole("article"))
      .toHaveCount(forumPosts.length);
    const path = await createDiscussion(page, title);
    await expectCardCount(other, title, 0);
    await discussionLink(other, title).click();
    await expectComments(other, 0);
    await discussionLink(page, title).click();
    await addComment(page, comment);
    await expectComments(other, 1);
    await expect(other.getByRole("main").getByRole("article").getByText(comment, { exact: true }))
      .toBeVisible();
    await addNestedReply(other, comment, nested);
    await expectComments(page, 2);
    await expect(page.getByRole("main").getByRole("article").getByText(nested, { exact: true }))
      .toBeVisible();
    await backToFeed(page);
    await expectCardCount(page, title, 2);
    await backToFeed(other);
    await expectCardCount(other, title, 2);
    await discussionLink(page, title).click();
    await expectComments(page, 2);
    // Use a real second-tab clear, not a synthetic StorageEvent on its writer.
    await other.evaluate(() => localStorage.clear());
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }))
      .toHaveText("Diskusi lokal tidak ditemukan.");
    await expect(page.getByRole("main").getByText(comment, { exact: true }))
      .toHaveCount(0);
    await backToFeed(page);
    await expect(page.getByRole("main").getByRole("article"))
      .toHaveCount(forumPosts.length);
    await expect(discussionCard(page, title)).toHaveCount(0);
    for (const post of forumPosts) {
      await expectCardCount(page, post.title, post.comments);
    }
    // The writer does not receive its own storage event; reload it explicitly.
    await other.reload();
    await expect(other.getByRole("main").getByRole("article"))
      .toHaveCount(forumPosts.length);
    await other.goto(path);
    await expect(other.getByRole("main").getByRole("heading", { level: 1 }))
      .toHaveText("Diskusi lokal tidak ditemukan.");
  } finally {
    await other.close();
  }
});

test.describe("pure forum session parser", () => {
  test("malformed JSON and malformed shapes produce an empty session", () => {
    for (const raw of [
      null, "", "{", "null", "[]", "42", '"text"',
      JSON.stringify({ posts: {}, replies: "wrong" }),
      JSON.stringify({ posts: [null, [], {}, 42], replies: [null, [], {}, false] }),
    ]) {
      expect(parseForumSession(raw)).toEqual({ posts: [], replies: [] });
    }
  });

  test("only strict UUIDv4 local slugs are accepted", () => {
    expect(isLocalForumSlug(localId(1))).toBe(true);
    expect(isLocalForumSlug(localId(15).toUpperCase())).toBe(true);
    for (const slug of [
      "local-test", "local-", "__proto__", "constructor", "toString",
      localId(1).replace("-4000-", "-1000-"),
      localId(1).replace("-8000-", "-7000-"),
      `${localId(1)}/extra`, ` ${localId(1)}`, `${localId(1)} `,
    ]) {
      expect(isLocalForumSlug(slug), slug).toBe(false);
      expect(parseForumSession(JSON.stringify({
        posts: [{ ...storedPost(), slug }],
        replies: [storedReply(100, slug)],
      }))).toEqual({ posts: [], replies: [] });
    }
  });

  test("duplicate posts and reply IDs keep only their first valid event", () => {
    const first = storedPost();
    const reply = storedReply(100, first.slug);
    const data = parseForumSession(JSON.stringify({
      posts: [first, { ...first, title: "Judul duplikat yang diabaikan" }],
      replies: [
        reply,
        { ...reply, comment: { ...reply.comment, body: "Isi duplikat diabaikan" } },
        { ...reply, slug: fixtureSlug },
      ],
    }));
    expect(data.posts).toHaveLength(1);
    expect(data.posts[0].title).toBe(first.title);
    expect(data.replies).toHaveLength(1);
    expect(data.replies[0].comment.body).toBe(reply.comment.body);
    expect(countForumComments(getSessionComments(data, first.slug))).toBe(1);
    expect(countForumComments(getSessionComments(data, fixtureSlug)))
      .toBe(forumPosts[0].comments);
  });

  test("orphans, self references, cycles and cross-thread parents are discarded", () => {
    const post = storedPost();
    const data = parseForumSession(JSON.stringify({
      posts: [post],
      replies: [
        storedReply(100, post.slug, localId(999)),
        storedReply(101, post.slug, localId(101)),
        storedReply(102, post.slug, localId(103)),
        storedReply(103, post.slug, localId(102)),
        storedReply(104, post.slug, "rotala-1"),
        storedReply(105, fixtureSlug, localId(106)),
        storedReply(106, post.slug),
        storedReply(107, localId(999)),
        storedReply(108, "__proto__"),
      ],
    }));
    expect(data.replies.map((reply) => reply.comment.id)).toEqual([localId(106)]);
    expect(countForumComments(getSessionComments(data, post.slug))).toBe(1);
    expect(getSessionComments(data, localId(999))).toEqual([]);
    expect(getSessionComments(data, "__proto__")).toEqual([]);
  });

  test("valid out-of-order replies rebuild nested trees without mutating fixtures or events", () => {
    const fixtureBefore = JSON.stringify({ forumPosts, forumThreads });
    const post = storedPost();
    const data = parseForumSession(JSON.stringify({
      posts: [post],
      replies: [
        storedReply(102, post.slug, localId(101)),
        storedReply(101, post.slug, localId(100)),
        storedReply(100, post.slug),
        storedReply(103, fixtureSlug, "rotala-1-1"),
      ],
    }));
    const sessionBefore = JSON.stringify(data);
    expect(data.replies).toHaveLength(4);
    const comments = getSessionComments(data, post.slug);
    expect(comments).toHaveLength(1);
    expect(comments[0].id).toBe(localId(100));
    expect(comments[0].replies[0].id).toBe(localId(101));
    expect(comments[0].replies[0].replies[0].id).toBe(localId(102));
    expect(countForumComments(comments)).toBe(3);
    const fixtureComments = getSessionComments(data, fixtureSlug);
    expect(countForumComments(fixtureComments)).toBe(forumPosts[0].comments + 1);
    expect(fixtureComments[0].replies[0].replies.at(-1)?.id).toBe(localId(103));
    expect(getSessionComments(data, post.slug)).toEqual(comments);
    expect(JSON.stringify(data)).toBe(sessionBefore);
    expect(JSON.stringify({ forumPosts, forumThreads })).toBe(fixtureBefore);
  });

  test("invalid dates are rejected for both posts and replies", () => {
    for (const time of [
      "not-a-date", "2026-11-04", "2026-02-30T08:15:00Z",
      "2026-02-29T08:15:00Z", "2026-13-01T08:15:00Z",
      "2026-11-04T24:00:00Z", "2026-11-04T08:60:00Z",
      "2026-11-04T08:15:60Z", "2026-11-04T08:15:00+24:00",
      "2026-11-04T08:15:00", ` ${publishedAt}`, `${publishedAt} `,
    ]) {
      const reply = storedReply(100);
      expect(parseForumSession(JSON.stringify({
        posts: [{ ...storedPost(), publishedAt: time }],
        replies: [{ ...reply, comment: { ...reply.comment, time } }],
      })), time).toEqual({ posts: [], replies: [] });
    }
  });

  test("valid timestamps and text are normalized, persisted display fields are not trusted", () => {
    const post = storedPost();
    const reply = storedReply(100, post.slug);
    const data = parseForumSession(JSON.stringify({
      posts: [{
        ...post,
        title: `  ${post.title}  `,
        body: `  ${"x".repeat(171)}  `,
        author: "Spoofed identity", initials: "XX", comments: 999,
        excerpt: "Spoofed excerpt", image: "https://example.invalid/tracker.png",
        location: "Spoofed location", time: "Spoofed time",
      }],
      replies: [{
        ...reply,
        comment: {
          ...reply.comment, body: `  ${reply.comment.body}  `,
          author: "Spoofed identity", initials: "XX", isLocal: false,
          replies: [{ ...reply.comment, id: localId(101) }],
        },
      }],
    }));
    expect(data.posts[0]).toMatchObject({
      title: post.title, body: "x".repeat(171),
      excerpt: `${"x".repeat(170)}…`, author: "Kamu (demo)",
      initials: "KM", comments: 0, location: "Semarang · demo lokal",
      publishedAt: "2026-11-04T01:15:00.000Z",
    });
    expect(data.posts[0]).not.toHaveProperty("image");
    expect(data.replies[0].comment).toEqual({
      id: reply.comment.id, body: reply.comment.body,
      time: "2026-11-04T01:15:00.000Z", author: "Kamu (demo)",
      initials: "KM", isLocal: true, replies: [],
    });
    expect(countForumComments(getSessionComments(data, post.slug))).toBe(1);
    expect(normalizeLocalForumPost({ ...post, publishedAt: "2024-02-29T23:59:59.123Z" }))
      .not.toBeNull();
  });

  test("trimmed text bounds and valid categories are enforced", () => {
    const post = storedPost();
    for (const [field, minimum, maximum] of [
      ["title", FORUM_LIMITS.titleMin, FORUM_LIMITS.titleMax],
      ["body", FORUM_LIMITS.bodyMin, FORUM_LIMITS.bodyMax],
    ] as const) {
      for (const length of [minimum, maximum]) {
        expect(normalizeLocalForumPost({ ...post, [field]: `  ${"x".repeat(length)}  ` })?.[field])
          .toBe("x".repeat(length));
      }
      for (const value of [" ".repeat(minimum), "x".repeat(minimum - 1), "x".repeat(maximum + 1), null, 42]) {
        expect(normalizeLocalForumPost({ ...post, [field]: value })).toBeNull();
      }
    }
    for (const category of ["Unknown", "perawatan", " Perawatan ", null]) {
      expect(normalizeLocalForumPost({ ...post, category })).toBeNull();
    }
    for (const length of [FORUM_LIMITS.commentMin, FORUM_LIMITS.commentMax]) {
      expect(normalizeForumCommentBody(`  ${"x".repeat(length)}  `))
        .toBe("x".repeat(length));
    }
    for (const body of ["   ", "xx", "x".repeat(FORUM_LIMITS.commentMax + 1), null, {}]) {
      expect(normalizeForumCommentBody(body)).toBeNull();
    }
  });

  test("only the bounded prefix of persisted entries is considered", () => {
    const posts = Array.from({ length: FORUM_LIMITS.posts + 1 }, (_, index) => storedPost(index));
    const replies = Array.from({ length: FORUM_LIMITS.replies + 1 }, (_, index) => storedReply(index + 100));
    const data = parseForumSession(JSON.stringify({ posts, replies }));
    expect(data.posts).toHaveLength(FORUM_LIMITS.posts);
    expect(data.replies).toHaveLength(FORUM_LIMITS.replies);
    expect(data.posts.at(-1)?.slug).toBe(posts[FORUM_LIMITS.posts - 1].slug);
    expect(data.replies.at(-1)?.comment.id).toBe(replies[FORUM_LIMITS.replies - 1].comment.id);
    const invalidFirst = parseForumSession(JSON.stringify({
      posts: [null, ...posts.slice(1)],
      replies: [null, ...replies.slice(1)],
    }));
    expect(invalidFirst.posts).toHaveLength(FORUM_LIMITS.posts - 1);
    expect(invalidFirst.replies).toHaveLength(FORUM_LIMITS.replies - 1);
  });
});
