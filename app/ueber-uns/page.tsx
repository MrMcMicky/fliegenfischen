import { redirect } from "next/navigation";

export const metadata = {
  title: "Über uns",
  description: "Über die Fliegenfischerschule, Philosophie und Instruktor.",
};

export const dynamic = "force-dynamic";

export default async function UeberUnsPage() {
  redirect("/#ueber");
}
