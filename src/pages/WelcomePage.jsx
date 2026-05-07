import React from 'react';
import { Sparkles, ArrowRight, Zap, Target, Star } from 'lucide-react';
import { Button } from '../components/ui';
import SupportBot from '../components/bot/SupportBot';

export default function WelcomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-900 text-white text-xs font-bold mb-8 animate-fade-in shadow-md">
          <Sparkles size={12} />
          <span>HELP US SHAPE THE FUTURE</span>
        </div>
        
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6 animate-slide-up">
          What features should we build <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-400">next?</span>
        </h1>
        
        <p className="text-xl text-gray-500 mb-12 animate-slide-up animation-delay-500 leading-relaxed">
          Your feedback drives our roadmap. Use the assistant below to suggest a new feature or explore what others have requested.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-1000">
          <div className="flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-2">
                <Star size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">High Impact</span>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-2">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fast Iteration</span>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-2">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Goal Oriented</span>
            </div>
          </div>
        </div>

        {/* Floating elements to draw eye to the bot */}
        <div className="absolute -bottom-8 -right-8 animate-bounce animation-delay-2000">
          <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-900 flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700">Talk to me! 👇</span>
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* The Bot */}
      <SupportBot />
    </div>
  );
}
