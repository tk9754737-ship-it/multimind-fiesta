"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🌌 GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none"></div>

      {/* 🌌 TOP NAVBAR */}
     <div className="w-full flex justify-between items-center px-10 py-4 relative z-10">

         <div className="flex items-center gap-3">
          {/* Your spark logo */}
          <div className="flex justify-center mb-6">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-purple-500/60">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Project Name */}
          <span className="text-2xl font-bold tracking-tight">MultiMind</span>
        </div>

        {/* Login Button */}
        <Link
          href="/auth"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold shadow-lg"
        >
          Log In →
        </Link>
      </div>

      {/* 🌌 HERO SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 items-center px-10 pt-10 relative z-10 gap-10">

        {/* LEFT TEXT SECTION */}
        <div>
          <p className="inline-block px-3 py-1 bg-gray-900/50 border border-gray-700 rounded-full text-sm mb-6">
            Built by MultiMind
          </p>

          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            World’s Most  
            <br />
            Powerful AIs.
            <br />
            One Platform.
          </h1>

          <p className="text-gray-300 text-lg mb-10 max-w-lg">
           Stop juggling tabs and subscriptions - Multimind gives you access to all 
           best-in-class AI models for just $12/month.
            That's almost half of what you'd pay for a single premium AI chat subscription.
          </p>

          <Link
            href="/auth"
            className="inline-block px-7 py-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold shadow-xl"
          >
            Get Started Now →
          </Link>
        </div>

        {/* RIGHT SIDE — HERO MOCKUP */}
        <div className="relative">
          <div className="absolute -inset-8 bg-teal-300/20 blur-3xl rounded-3xl"></div>

          <div className="relative rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
           <div className="flex flex-col h-[456px] w-full p-6 bg-white/5 backdrop-blur-xl">

  {/* Chat Message Area */}
  <div className="flex-1 space-y-4 overflow-hidden">

    {/* User bubble */}
    <div className="flex justify-end">
      <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-white/10 text-white border border-white/10">
        Hey! Can you help me with something?
      </div>
    </div>

    {/* AI bubble */}
    <div className="flex justify-start">
      <div className="max-w-[70%] px-2 py-2 rounded-2xl bg-black/30 text-white/90 border border-white/10">
        Absolutely! You can compare AI models in real-time using MultiMind.
      </div>
    </div>

    <div className="flex justify-start">
      <div className="max-w-[70%] px-2 py-2 rounded-2xl bg-black/30 text-white/90 border border-white/10">
        Ask anything — coding, reasoning, images, documents & more.
      </div>
    </div>

  </div>

  {/* Fake Input Box */}
  <div className="mt-6 w-full flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-2 py-3">
    <p className="text-white/50 flex-1">Ask me anything...</p>
    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
  </div>

</div>

          </div>
        </div>

      </div>
    </div>
    
  );
}
