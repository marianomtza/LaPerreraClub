import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialPageBlocks } from "@/components/content/special-page-blocks";
import { getSpecialPage } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSpecialPage(slug);
  if (!page) return {};

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.description,
    alternates: {
      canonical: `/${page.slug}`
    }
  };
}

export default async function SpecialPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getSpecialPage(slug);
  if (!page) notFound();

  return (
    <main className="shell py-10">
      <SpecialPageBlocks blocks={page.blocks} />
    </main>
  );
}
