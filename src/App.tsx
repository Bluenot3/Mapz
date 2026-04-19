import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Zap, Crosshair, MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { generateMapInfographic } from './services/ai';

export default function App() {
  const [hasKey, setHasKey] = useState(true);
  const [prompt, setPrompt] = useState('A scenic evening bike loop around the Tidal Basin in Washington D.C., passing the Jefferson and FDR Memorials, showing the best parking spots nearby.');
  const [loadingGraphic, setLoadingGraphic] = useState(false);
  const [generatedGraphic, setGeneratedGraphic] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
      setApiError(null);
    }
  };

  const renderGraphic = async () => {
    if (!prompt.trim()) return;
    setLoadingGraphic(true);
    setApiError(null);
    
    try {
      const image = await generateMapInfographic(prompt);
      if (image) {
        setGeneratedGraphic(image);
      } else {
        setApiError("Failed to generate HQ graphic: No image returned.");
      }
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('EXHAUSTED') || err?.message?.includes('credits')) {
        setApiError("BILLING REQUIRED: Your Google Cloud project has depleted its predictive API credits for generating image assets. Please switch to an API Key linked to a funded billing account.");
      } else {
        setApiError("API ERROR: " + err.message);
      }
    }
    setLoadingGraphic(false);
  };

  return (
    <div className="relative w-full h-screen bg-[#08080C] text-[#F0F0F0] font-sans flex overflow-hidden map-canvas-bg border-box">
      {!hasKey && (
        <div className="absolute inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex items-center justify-center">
          <div className="bg-[rgba(20,20,25,0.8)] border border-[#00FF9C] p-8 rounded-2xl max-w-md text-center shadow-[0_0_50px_rgba(0,255,156,0.2)]">
            <h2 className="text-[#00FF9C] text-2xl font-bold mb-4 uppercase tracking-[2px]">Authorization Required</h2>
            <p className="text-[#9090A0] mb-6">Generating high-resolution 4K infographic maps requires a paid Google Cloud project API key to access gemini-3.1-flash-image-preview.</p>
            <button onClick={handleSelectKey} className="w-full bg-[#00FF9C] text-black font-bold py-3 rounded uppercase tracking-[2px] hover:bg-[#00ccaa] transition-colors">
              Link API Key
            </button>
            <p className="text-xs text-gray-500 mt-4"><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-[#00FF9C]">Read Billing Documentation</a></p>
          </div>
        </div>
      )}
      
      {/* Background Effect layer */}
      <div className="absolute inset-0 z-0 opacity-40">
         <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a2a44] via-[#08080C] to-[#08080C]"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row p-6 gap-6">
        {/* Left Input Panel */}
        <div className="w-full md:w-[420px] flex flex-col bg-[rgba(20,20,25,0.7)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.12)] rounded-[18px] p-6 shadow-2xl flex-shrink-0">
          
          <div className="flex items-center space-x-3 mb-6">
            <h1 className="text-[20px] font-black tracking-[2px] text-[#F0F0F0]">TRAIL<span className="text-[#00FF9C]">GEN</span>.N2</h1>
          </div>

          <div className="flex-1 flex flex-col">
            <h2 className="text-[11px] uppercase tracking-[2px] text-[#9090A0] mb-4">Mission Parameters</h2>
            
            <p className="text-[#9090A0] text-sm mb-4 leading-relaxed">
              Describe your route, destination, or what you are doing. The AI will generate a hyper-realistic, 3D isometric infographic map complete with metrics, glowing routes, and accurate parking spots.
            </p>

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A scenic evening run through Central Park past the reservoir including parking locations..."
              className="w-full h-40 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg p-4 text-[14px] text-[#F0F0F0] placeholder-[#9090A0] focus:outline-none focus:border-[#00FF9C] transition-colors resize-none mb-6"
            />
            
            <button 
              onClick={renderGraphic}
              disabled={loadingGraphic || !prompt.trim()}
              className="w-full mt-auto bg-[rgba(0,255,156,0.1)] border border-[#00FF9C] hover:bg-[rgba(0,255,156,0.2)] text-[#00FF9C] font-bold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-[12px] uppercase tracking-[2px] disabled:opacity-30"
            >
              {loadingGraphic ? <Zap className="w-5 h-5 animate-pulse" /> : <ImageIcon className="w-5 h-5" />}
              <span>{loadingGraphic ? 'Rendering Museum-Grade 4K Map...' : 'Generate 4K Infographic'}</span>
            </button>
          </div>
          
          {/* Top Right Status Badge on Panel */}
          <div className="flex items-center space-x-2 text-[10px] text-[#9090A0] mt-8 opacity-70">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/></svg>
            <span>POWERED BY GEMINI NANO BANANA 2 PRO</span>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="flex-1 rounded-[18px] border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.4)] backdrop-blur-sm overflow-hidden relative flex items-center justify-center shadow-inner">
           {loadingGraphic ? (
              <div className="flex flex-col items-center text-[#00FF9C] animate-pulse">
                <Crosshair className="w-16 h-16 mb-4 opacity-50 animate-spin-slow" />
                <p className="font-mono text-sm tracking-[3px] uppercase">Acquiring Satellite Imagery & Rendering Terrain...</p>
              </div>
           ) : apiError ? (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center max-w-lg text-center p-8 border border-red-500/20 bg-red-500/5 rounded-2xl"
              >
                 <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
                 <h3 className="text-red-400 font-bold tracking-[2px] uppercase mb-4 text-xl">Generation Blocked</h3>
                 <p className="text-red-200/80 leading-relaxed text-sm mb-6">{apiError}</p>
                 <button onClick={handleSelectKey} className="border border-red-500/50 hover:bg-red-500/10 text-red-400 font-bold py-2 px-6 rounded text-xs uppercase tracking-[2px] transition-colors">
                    Manage API Key
                 </button>
              </motion.div>
           ) : generatedGraphic ? (
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={generatedGraphic} 
                alt="Generated Cinematic Map" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
           ) : (
              <div className="flex flex-col items-center text-[#9090A0] opacity-50">
                <MapPin className="w-16 h-16 mb-4" />
                <p className="font-sans text-sm tracking-[2px] uppercase">Awaiting Mission Parameters</p>
              </div>
           )}

           {generatedGraphic && !loadingGraphic && !apiError && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-2 border border-[#333] rounded font-mono text-xs text-[#00ffcc] animate-pulse">
                4K RENDER COMPLETE
              </div>
           )}
        </div>
      </div>
    </div>
  );
}

