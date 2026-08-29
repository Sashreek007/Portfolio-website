// Verified credentials, newest first. Same reasoning as experience.ts: this
// changes once or twice a year and nothing in /admin edits it.

export type Certification = {
  /** Certificate name without the issuer, which is printed separately. */
  name: string;
  issuer: string;
  /** Platform it was earned through, when that differs from the issuer. */
  via: string | null;
  issued: string;
  /** Credly public badge page — both the proof and the click target. */
  verifyUrl: string;
  /**
   * Local copy of the Credly artwork. Hotlinking images.credly.com would mean
   * a remotePatterns entry and a third-party round trip for a file we can
   * serve from /public.
   */
  badge: string;
  /** Alt text, and what the row says the certificate actually covered. */
  blurb: string;
};

export const CERTIFICATIONS: Certification[] = [
  {
    name: "AI Engineering Professional Certificate",
    issuer: "IBM",
    via: "Coursera",
    issued: "Sept 2023",
    verifyUrl:
      "https://www.credly.com/badges/76aa90d6-1658-4a56-af6e-f2d1f50689a4/public_url",
    badge: "/badges/ibm-ai-engineering.png",
    blurb:
      "Machine learning through regression, classification, clustering and recommender systems, then deep learning built and deployed with Keras, PyTorch and TensorFlow.",
  },
];
