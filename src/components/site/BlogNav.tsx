"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Blog-local nav — sits inside the /blog subtree and replaces the
// portfolio-wide Nav. The blog is presented as its own property, so
// the only link back to the portfolio is the explicit "portfolio ↗".
export default function BlogNav() {
  const pathname = usePathname();
  const onIndex = pathname === "/blog";

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onIndex) {
      // Navigate to the index with the hash; page will scroll on mount.
      window.location.href = "/blog#about";
      return;
    }
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="blog-nav">
      <div className="blog-nav-inner">
        <Link href="/blog" className="blog-nav-id">
          SA
        </Link>
        <nav className="blog-nav-links">
          <Link
            href="/blog"
            className={`blog-nav-link ${onIndex ? "on" : ""}`}
          >
            blog
          </Link>
          <a
            href="/blog#about"
            onClick={scrollToAbout}
            className="blog-nav-link"
          >
            about
          </a>
          <Link href="/" className="blog-nav-link">
            portfolio ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}
