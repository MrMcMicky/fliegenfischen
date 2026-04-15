import type { Metadata } from "next";

import HomePage from "@/app/page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Frontpage Preview",
    description: "Alternative Frontpage-Vorschau der Fliegenfischerschule.",
    path: "/test",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default HomePage;
