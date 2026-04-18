import BlogNav from "@/components/site/BlogNav";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogNav />
      {children}
    </>
  );
}
