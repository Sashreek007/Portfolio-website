import BlogNav from "@/components/site/BlogNav";
import VimKeys from "@/components/site/VimKeys";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogNav />
      <VimKeys />
      {children}
    </>
  );
}
