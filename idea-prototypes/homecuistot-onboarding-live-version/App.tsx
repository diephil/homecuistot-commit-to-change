
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChefHat, ChevronRight, Mic, RotateCcw, Check, Sparkles, MicOff, Loader2, Volume2 } from 'lucide-react';
import { OnboardingState, Step } from './types';
import { SUGGESTED_DISHES, FRIDGE_ITEMS, PANTRY_ITEMS } from './constants';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [state, setState] = useState<OnboardingState>({
    dishes: [],
    fridge: [],
    pantry: [],
  });
  
  // Live API States
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Transitions
  const goToNext = () => {
    if (step === 'welcome') setStep('selection');
    else if (step === 'selection') setStep('voice');
  };

  const resetSelection = () => {
    setState({ dishes: [], fridge: [], pantry: [] });
  };

  const toggleItem = (category: keyof OnboardingState, item: string) => {
    setState(prev => {
      const current = prev[category];
      if (current.includes(item)) {
        return { ...prev, [category]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...current, item] };
      }
    });
  };

  // Live API Implementation
  const startLiveSession = async () => {
    if (isLive || isConnecting) return;
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inventoryTool = {
        name: 'modify_inventory',
        description: 'Add or remove items from the users kitchen inventory.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'The name of the ingredient or dish' },
                  action: { type: Type.STRING, enum: ['add', 'remove'] },
                  category: { type: Type.STRING, enum: ['dishes', 'fridge', 'pantry'] }
                },
                required: ['name', 'action', 'category']
              }
            }
          },
          required: ['changes']
        }
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are HomeCuistot, a helpful kitchen assistant. Use the modify_inventory tool whenever the user mentions adding or removing items. Be concise and friendly.',
          tools: [{ functionDeclarations: [inventoryTool] }],
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            setupMicrophone(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'modify_inventory') {
                  const { changes } = fc.args as any;
                  setState(prev => {
                    const next = { ...prev };
                    changes.forEach((c: any) => {
                      const cat = c.category as keyof OnboardingState;
                      if (c.action === 'add') {
                        if (!next[cat].includes(c.name)) next[cat] = [...next[cat], c.name];
                      } else {
                        next[cat] = next[cat].filter(i => i !== c.name);
                      }
                    });
                    return next;
                  });
                  
                  // Acknowledge to model
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                  }));
                }
              }
            }
          },
          onclose: () => setIsLive(false),
          onerror: () => {
            setIsLive(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const setupMicrophone = async (sessionPromise: Promise<any>) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = ctx;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm[i] = inputData[i] * 0x7FFF;
      }
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm.buffer)));
      sessionPromise.then(s => s.sendRealtimeInput({
        media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsLive(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col min-h-[600px]">
        
        {/* Step 1: Welcome */}
        <div className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col items-center text-center ${step === 'welcome' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
            <ChefHat size={40} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-4">Welcome to HomeCuistot</h1>
          <p className="text-stone-600 leading-relaxed mb-8">
            We're thrilled to help you manage your kitchen smarter. We'll guide you through a quick setup to get to know your fridge and pantry.
          </p>
          <div className="bg-orange-50 p-4 rounded-xl flex items-start text-left mb-12 border border-orange-100">
            <Volume2 className="text-orange-600 mr-3 shrink-0" size={20} />
            <p className="text-sm text-orange-800">
              <span className="font-semibold block">Hands-free Experience</span>
              HomeCuistot uses a Live Voice Assistant. You can talk to it naturally to add or remove items while you explore your kitchen.
            </p>
          </div>
          <button 
            onClick={goToNext}
            className="mt-auto w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl flex items-center justify-center transition-colors group shadow-lg shadow-orange-200"
          >
            Start Onboarding
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Step 2: Selections */}
        <div className={`transition-all duration-500 absolute inset-0 p-6 flex flex-col ${step === 'selection' ? 'translate-x-0 opacity-100' : (step === 'welcome' ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none')}`}>
          <h2 className="text-xl font-bold text-stone-800 mb-1">Initial Setup</h2>
          <p className="text-sm text-stone-500 mb-6">Select your staple items to get started</p>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Favorite Dishes</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DISHES.map(item => (
                  <Badge 
                    key={item.id} 
                    label={item.name} 
                    selected={state.dishes.includes(item.name)} 
                    onClick={() => toggleItem('dishes', item.name)} 
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Fresh Fridge Items</h3>
              <div className="flex flex-wrap gap-2">
                {FRIDGE_ITEMS.map(item => (
                  <Badge 
                    key={item.id} 
                    label={item.name} 
                    selected={state.fridge.includes(item.name)} 
                    onClick={() => toggleItem('fridge', item.name)} 
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">The Pantry</h3>
              <div className="flex flex-wrap gap-2">
                {PANTRY_ITEMS.map(item => (
                  <Badge 
                    key={item.id} 
                    label={item.name} 
                    selected={state.pantry.includes(item.name)} 
                    onClick={() => toggleItem('pantry', item.name)} 
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-stone-100 flex gap-4">
            <button 
              onClick={resetSelection}
              className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-2xl flex items-center justify-center transition-colors"
            >
              <RotateCcw size={18} className="mr-2" />
              Reset
            </button>
            <button 
              onClick={goToNext}
              className="flex-[2] py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-orange-200"
            >
              Continue
              <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>

        {/* Step 3: Live Voice Confirmation */}
        <div className={`transition-all duration-500 absolute inset-0 p-6 flex flex-col ${step === 'voice' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-800">Review & Talk</h2>
              <p className="text-sm text-stone-500">Live assistant is ready to help</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${isLive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
              {isLive ? 'Live Assistant Active' : 'Offline'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50 rounded-2xl p-4 mb-6">
            <div className="flex flex-wrap gap-2 content-start">
              {state.dishes.map(d => <SummaryBadge key={d} label={d} type="dish" onRemove={() => toggleItem('dishes', d)} />)}
              {state.fridge.map(f => <SummaryBadge key={f} label={f} type="fridge" onRemove={() => toggleItem('fridge', f)} />)}
              {state.pantry.map(p => <SummaryBadge key={p} label={p} type="pantry" onRemove={() => toggleItem('pantry', p)} />)}
              
              {state.dishes.length === 0 && state.fridge.length === 0 && state.pantry.length === 0 && (
                <div className="w-full text-center py-12">
                   <Sparkles className="mx-auto text-orange-200 mb-3" size={32} />
                   <p className="text-stone-400 text-sm italic">Nothing in your inventory yet.<br/>Start talking to the assistant!</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
             <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className={`w-1 bg-orange-500 rounded-full transition-all duration-300 ${isLive ? 'animate-bounce' : 'h-2 opacity-20'}`} 
                    style={{ 
                      height: isLive ? `${Math.random() * 20 + 10}px` : '8px',
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
             </div>

            <button 
              onClick={isLive ? stopLiveSession : startLiveSession}
              disabled={isConnecting}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl relative ${
                isConnecting ? 'bg-stone-200' : 
                isLive ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="text-white animate-spin" size={32} />
              ) : isLive ? (
                <MicOff className="text-white" size={32} />
              ) : (
                <Mic className="text-white" size={32} />
              )}
            </button>
            
            <p className="text-sm font-semibold text-stone-800">
              {isConnecting ? "Connecting to AI..." : isLive ? "Assistant is listening..." : "Tap to start conversation"}
            </p>

            <button 
              onClick={() => alert("Welcome to HomeCuistot!")}
              className="w-full py-4 bg-stone-900 hover:bg-black text-white font-semibold rounded-2xl flex items-center justify-center transition-colors shadow-lg"
            >
              Finish Setup
              <Check className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-stone-400 text-sm flex items-center gap-4">
        <span className={step === 'welcome' ? 'text-orange-600 font-bold' : ''}>Start</span>
        <div className="w-1 h-1 bg-stone-300 rounded-full" />
        <span className={step === 'selection' ? 'text-orange-600 font-bold' : ''}>Basics</span>
        <div className="w-1 h-1 bg-stone-300 rounded-full" />
        <span className={step === 'voice' ? 'text-orange-600 font-bold' : ''}>Live Chat</span>
      </footer>
    </div>
  );
};

const Badge: React.FC<{label: string, selected: boolean, onClick: () => void}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
      selected 
      ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
    }`}
  >
    {label}
  </button>
);

const SummaryBadge: React.FC<{label: string, type: 'dish' | 'fridge' | 'pantry', onRemove: () => void}> = ({ label, type, onRemove }) => {
  const styles = {
    dish: 'bg-blue-50 text-blue-700 border-blue-200',
    fridge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pantry: 'bg-amber-50 text-amber-700 border-amber-200'
  };
  return (
    <div className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-bold ${styles[type]}`}>
      <span className="capitalize">{label}</span>
      <button onClick={onRemove} className="ml-2 hover:scale-110 transition-transform">
        <RotateCcw size={12} className="opacity-50" />
      </button>
    </div>
  );
};

export default App;
