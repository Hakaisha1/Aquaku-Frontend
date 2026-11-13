import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { filterProducts, products } from "../src/lib/marketplace-data";
import {
  appendForumComment,
  countForumComments,
  forumPosts,
  forumThreads,
} from "../src/lib/forum-data";

const threadPath = "/forum/trimming-rotala-tank-60-cm";
const productPath = "/marketplace/anubias-nana-petite";

test("home, local assets and responsive routes stay usable", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hutan kecilmu,mulai dari sini.",
  );
  await expect(
    page.getByRole("heading", { name: "Temuan di sekitar kamu" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Simpan Anubias nana petite — rimpang sehat",
    }),
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  for (const path of [
    "/",
    "/marketplace",
    productPath,
    "/forum",
    threadPath,
    "/preview",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      path + " must not overflow horizontally",
    ).toBe(true);
    const images = page.locator("main img");
    for (let index = 0; index < (await images.count()); index++) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate(
              (node) =>
                (node as HTMLImageElement).complete &&
                (node as HTMLImageElement).naturalWidth > 0,
            ),
          { message: "Image should load on " + path },
        )
        .toBe(true);
    }
  }
  if (testInfo.project.name === "desktop-light") {
    for (const width of [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [
        "/",
        "/marketplace",
        productPath,
        "/forum",
        threadPath,
      ]) {
        await page.goto(path);
        await expect(page.locator("main h1").first()).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${path} at ${width}px`,
        ).toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});

test("marketplace search, sorting, filters and empty state", async ({
  page,
}) => {
  await page.goto("/marketplace");
  await expect(page.locator("main article")).toHaveCount(8);
  await page.getByLabel("Urutkan barang").selectOption("price-asc");
  await expect(page.locator("main article").first()).toContainText("Java moss");
  await page.getByRole("button", { name: "Tanaman air", exact: true }).click();
  await expect(page.locator("main article")).toHaveCount(3);
  await page.getByLabel("Cari barang di marketplace").fill("rotala");
  await expect(page.locator("main article")).toHaveCount(1);
  await page
    .getByLabel("Cari barang di marketplace")
    .fill("tidak-ada-tanaman-ini");
  await expect(
    page.getByRole("heading", { name: "Belum ada yang cocok." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset pencarian", exact: true })
    .click();
  await expect(page.locator("main article")).toHaveCount(8);
  const filterToggle = page.getByRole("button", { name: /Filter barang/ });
  if (await filterToggle.isVisible()) await filterToggle.click();
  await page.getByLabel("Harga maksimal").fill("20000");
  await expect(page.locator("main article")).toHaveCount(2);
  await page.getByLabel("Kondisi barang").selectOption("Trimmingan");
  await expect(page.locator("main article")).toHaveCount(2);
});

test("global search and category deep links", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("search").getByRole("searchbox").fill("anubias");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page).toHaveURL(/marketplace\?q=anubias/);
  // Next keeps inactive routes mounted; role locators exclude their hidden content.
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(1);
  await page.goto("/marketplace?category=fauna");
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.locator("main article")).toContainText(
    "Udang yellow sakura",
  );
});

test("category filters stay in sync with links and reloads", async ({
  page,
}) => {
  await page.goto("/marketplace?category=tanaman");
  await page.getByRole("button", { name: "Ikan & udang", exact: true }).click();
  await expect(page).toHaveURL(/category=fauna/);
  await expect(page.locator("main article")).toHaveCount(1);
  const sidebar = page.getByRole("navigation", { name: "Kategori produk" });
  if (await sidebar.isVisible())
    await sidebar
      .getByRole("link", { name: "Tanaman air", exact: true })
      .click();
  else
    await page.evaluate(() =>
      window.history.pushState(null, "", "/marketplace?category=tanaman"),
    );
  await expect(
    page.getByRole("button", { name: "Tanaman air", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main article")).toHaveCount(3);
  await page
    .getByLabel("Cari barang di marketplace")
    .pressSequentially("anubias");
  await expect(page).toHaveURL(/q=anubias/);
  await expect(page.locator("main article")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Cari barang di marketplace")).toHaveValue(
    "anubias",
  );
  await expect(page.locator("main article")).toHaveCount(1);
});

test("header search preserves in-memory saves when storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Simpan Anubias nana petite — rimpang sehat",
      exact: true,
    })
    .click();
  await page.getByRole("search").getByRole("searchbox").fill("anubias");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page).toHaveURL(/marketplace\?q=anubias/);
  await expect(
    page.getByRole("button", {
      name: "Batal menyimpan Anubias nana petite — rimpang sehat",
      exact: true,
    }),
  ).toBeVisible();
});

test("saved items persist on reload and can be removed", async ({ page }) => {
  await page.goto("/marketplace?view=saved");
  await expect(
    page.getByRole("heading", { name: "Belum ada barang yang disimpan." }),
  ).toBeVisible();
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Simpan Anubias nana petite — rimpang sehat",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Batal menyimpan Anubias nana petite — rimpang sehat",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Batal menyimpan Anubias nana petite — rimpang sehat",
      exact: true,
    }),
  ).toBeEnabled();
  await page.goto("/marketplace?view=saved");
  await expect(
    page.getByRole("link", { name: /^(Tersimpan|Simpan)/ }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator("main article")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Batal menyimpan Anubias nana petite — rimpang sehat",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Belum ada barang yang disimpan." }),
  ).toBeVisible();
});

test("product gallery and honest chat preview", async ({ page }, testInfo) => {
  await page.goto(productPath);
  await page.screenshot({
    path: testInfo.outputPath("product.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Lihat gambar 2", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Lihat gambar 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Chat penjual", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Pratinjau chat WhatsApp" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("tidak ada pesan yang dikirim");
  await expect(dialog).toContainText("Halo Rimbun Aquatic");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("forum categories and nested local replies", async ({
  page,
}, testInfo) => {
  const main = page.getByRole("main");
  const fixture = forumPosts.find((post) => `/forum/${post.slug}` === threadPath)!;
  const total = fixture.comments + 2;
  await page.goto("/forum");
  await page.screenshot({
    path: testInfo.outputPath("forum.png"),
    fullPage: true,
  });
  await main.getByRole("button", { name: /^Alga & air/ }).click();
  await expect(main.getByRole("article")).toHaveCount(1);
  await page.goto(threadPath);
  await page
    .getByLabel("Tambahkan pengalamanmu", { exact: true })
    .fill("Saya coba pangkas bertahap di tank Tembalang.");
  await page
    .getByRole("button", { name: "Kirim komentar lokal", exact: true })
    .click();
  await expect(
    page.getByText("Saya coba pangkas bertahap di tank Tembalang.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Balas komentar Raka Aditya", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Balas Raka Aditya", { exact: true })
    .fill("Untuk batang bawah, saya pilih yang masih kokoh.");
  await page
    .getByRole("button", { name: "Kirim balasan lokal", exact: true })
    .click();
  await expect(
    page.getByText("Untuk batang bawah, saya pilih yang masih kokoh.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Ciutkan komentar Dimas Prasetyo dan balasannya",
      exact: true,
    })
    .first()
    .click();
  await expect(
    page.getByText("Untuk batang bawah, saya pilih yang masih kokoh.", {
      exact: true,
    }),
  ).not.toBeVisible();
  await page
    .getByRole("button", {
      name: "Perluas komentar Dimas Prasetyo dan balasannya",
      exact: true,
    })
    .first()
    .click();
  await expect(
    page.getByText("Untuk batang bawah, saya pilih yang masih kokoh.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("thread.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(
    main.getByText("Saya coba pangkas bertahap di tank Tembalang.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    main.getByText("Untuk batang bawah, saya pilih yang masih kokoh.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: `Obrolan (${total})`, exact: true }),
  ).toBeVisible();
  await main.getByRole("link", { name: "Semua diskusi", exact: true }).click();
  await expect(page).toHaveURL(/\/forum$/);
  await expect(
    main.getByRole("link", {
      name: `${total} komentar: ${fixture.title}`,
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    main.getByRole("link", {
      name: `${total} komentar: ${fixture.title}`,
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Aquaku, kembali ke beranda" }).click();
  await expect(page).toHaveURL(/\/$/);
  for (const post of forumPosts.slice(0, 2)) {
    await expect(
      main.getByRole("link", {
        name: `${post.slug === fixture.slug ? total : post.comments} komentar: ${post.title}`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page.reload();
  await expect(
    main.getByRole("link", {
      name: `${total} komentar: ${fixture.title}`,
      exact: true,
    }),
  ).toBeVisible();
});

test("theme choice persists and five real previews switch", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const initiallyDark = testInfo.project.name === "mobile-dark";
  await expect(page.locator("html")).toHaveClass(
    initiallyDark ? /dark/ : /light/,
  );
  await page
    .getByRole("button", { name: "Ganti mode terang atau gelap" })
    .click();
  await expect(page.locator("html")).toHaveClass(
    initiallyDark ? /light/ : /dark/,
  );
  await page.reload();
  await expect(page.locator("html")).toHaveClass(
    initiallyDark ? /light/ : /dark/,
  );
  await page.goto("/preview");
  for (const name of [
    "2. Katalog langsung",
    "3. Jurnal tank",
    "4. Pasar tetangga",
    "5. Ruang komunitas",
    "1. Pasar hijau",
  ]) {
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
});

test("key pages meet automated WCAG AA checks", async ({ page }) => {
  for (const path of ["/", "/marketplace", productPath, "/forum", threadPath]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      path +
        ": " +
        results.violations
          .map(
            (violation) =>
              violation.id +
              " " +
              violation.nodes.map((node) => node.target.join(" ")).join(", "),
          )
          .join("; "),
    ).toEqual([]);
  }
});

test("unknown product and thread show useful 404s", async ({ page }) => {
  for (const path of ["/marketplace/tidak-ada", "/forum/tidak-ada"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Sepertinya salah belok." }),
    ).toBeVisible();
  }
});

test("pure filters and immutable nested replies", () => {
  expect(filterProducts({ category: "tanaman" })).toHaveLength(3);
  expect(filterProducts({ query: "  ANUBIAS  " })).toHaveLength(1);
  expect(filterProducts({ query: "banyumanik" })).toHaveLength(2);
  expect(filterProducts({ saved: [] })).toHaveLength(0);
  expect(filterProducts({ sort: "price-asc" })[0].slug).toBe(
    "java-moss-porsi-kecil",
  );
  expect(products[0].slug).toBe("anubias-nana-petite");
  const comments = forumThreads["trimming-rotala-tank-60-cm"].comments;
  const original = JSON.stringify(comments);
  const count = countForumComments(comments);
  const next = appendForumComment(comments, "rotala-1-1", {
    id: "local-test",
    author: "Kamu",
    initials: "KM",
    body: "Balasan uji",
    time: "Baru saja",
    replies: [],
  });
  expect(JSON.stringify(comments)).toBe(original);
  expect(countForumComments(next)).toBe(count + 1);
  expect(
    appendForumComment(comments, "missing", {
      id: "unattached",
      author: "Kamu",
      initials: "KM",
      body: "Tidak terpasang",
      time: "Baru saja",
      replies: [],
    }),
  ).toBe(comments);
});
