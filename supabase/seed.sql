-- Seed: initial project data
-- Run after schema.sql in your Supabase SQL editor

INSERT INTO projects (name, description, github_url, demo_url, stack, status, year, is_best, is_current, sort_order)
VALUES
  (
    'Career Co-Pilot',
    'AI-assisted job workflow platform that matches roles to your profile, generates tailored resumes, and supports browser-assisted applications while keeping the user in control.',
    'https://github.com/Sashreek007/career-savers_CareerCo-Pilot',
    NULL,
    ARRAY['React','TypeScript','FastAPI','Python','Playwright','SQLite','Gemini API'],
    'shipped', 2025, true, false, 0
  ),
  (
    'DoomScroller',
    'Chrome extension that converts doomscrolling into measurable distance, coins, and multiplayer battles with local-first tracking, Supabase sync, and personalized AI feedback.',
    'https://github.com/Sashreek007/Doom-Scroller-by-Commit-and-Pray',
    NULL,
    ARRAY['TypeScript','React','TailwindCSS','Supabase','PostgreSQL','Chrome Extension'],
    'shipped', 2025, true, false, 1
  ),
  (
    'Streaks',
    'Social media productivity web app where people announce goals publicly and hold each other accountable to complete them.',
    'https://github.com/Sashreek007/Streaks',
    'https://streaks-cult-mode.vercel.app/dashboard',
    ARRAY['Next.js','TypeScript','Supabase','TailwindCSS'],
    'building', 2025, true, true, 2
  ),
  (
    'FluxAtlas — Economic Trading Engine',
    'Full-stack auction simulation platform modeling international resource trading with Vickrey auction mechanisms across 50+ simulated countries.',
    'https://github.com/Aarushb/NH25_flux_Atlas',
    NULL,
    ARRAY['FastAPI','React','PostgreSQL','Python','TypeScript'],
    'shipped', 2025, true, false, 3
  ),
  (
    'Spam Detection Discord Bot',
    'Deployed scam detection bot that identifies and removes malicious messages in real time with low-latency inference.',
    'https://github.com/UndergraduateArtificialIntelligenceClub/Spam-Detection-Discord-Bot',
    NULL,
    ARRAY['Python','Discord.py','Hugging Face'],
    'active', 2025, true, false, 4
  ),
  (
    'Balloon Popper — Gesture-Controlled Game',
    'Gesture-controlled arcade game with webcam-based hand tracking at 60 FPS and dynamic difficulty scaling.',
    'https://github.com/Sashreek007/fruit-ninja-hand-tracker',
    NULL,
    ARRAY['Python','MediaPipe','Pygame','OpenCV'],
    'shipped', 2024, true, false, 5
  ),
  (
    'LinkedIn Profile Summarizer',
    'Automated profile analysis pipeline combining web scraping and LLM processing to generate structured summaries.',
    'https://github.com/Sashreek007/Langchain_agent',
    NULL,
    ARRAY['Python','LangChain','OpenAI API'],
    'shipped', 2024, false, false, 6
  ),
  (
    'ClubMate AI',
    'Open-source automation platform for club operations, focused on intelligent task scheduling and document workflows.',
    'https://github.com/UndergraduateArtificialIntelligenceClub/Clubmate-AI',
    NULL,
    ARRAY['Python','LangChain','LangGraph','MCP'],
    'building', 2025, false, true, 7
  );
