export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          github_url: string | null;
          demo_url: string | null;
          image_url: string | null;
          video_url: string | null;
          stack: string[];
          status: "active" | "shipped" | "building";
          year: number | null;
          is_best: boolean;
          is_current: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: Json | null;
          excerpt: string | null;
          cover_image_url: string | null;
          is_published: boolean;
          published_at: string | null;
          title_accent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
    };
  };
};
