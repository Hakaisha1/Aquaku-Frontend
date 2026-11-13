import type { Metadata } from "next";
import { HomeContent, type HomeDirection } from "@/components/home-content";
import { PreviewSwitcher } from "@/components/preview-switcher";

export const metadata: Metadata = {
  title: "Studio arah desain",
  robots: { index: false, follow: false },
};
const directions: HomeDirection[] = [
  "pasar",
  "katalog",
  "jurnal",
  "tetangga",
  "komunitas",
];

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PreviewSwitcher
        previews={directions.map((direction) => (
          <HomeContent key={direction} direction={direction} />
        ))}
      />
    </div>
  );
}
