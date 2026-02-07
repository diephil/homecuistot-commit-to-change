
import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, ChevronRight, Mic, RotateCcw, Check, Sparkles, MicOff, Loader2, Volume2, Trash2, BrainCircuit } from 'lucide-react';
import { OnboardingState, Step, VoiceUpdate } from './types';
import { SUGGESTED_DISHES, FRIDGE_ITEMS, PANTRY_ITEMS } from './constants';
import { processVoiceInput } from './geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [state, setState] = useState<OnboardingState>({
    dishes: [],
    fridge: [],
    pantry: [],
  });
  
  // Audio & UI States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioProcessing(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone Access Error:", err);
      alert("Please enable microphone access to use voice updates.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (blob: Blob) => {
    setIsProcessing(true);
    setProcessingStep('Sending audio...');
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = reader.result?.toString().split(',')[1];
      if (base64Audio) {
        setProcessingStep('Analyzing speech...');
        const result = await processVoiceInput(base64Audio, JSON.stringify(state));
        
        setProcessingStep('Updating inventory...');
        if (result) {
          applyVoiceUpdates(result);
        }
      }
      
      // Artificial slight delay for visual confirmation of the final step
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStep('');
      }, 400);
    };
  };

  const applyVoiceUpdates = (updates: VoiceUpdate) => {
    setState(prev => {
      const next = { ...prev };
      
      const add = (cat: keyof OnboardingState, items: string[]) => {
        const uniqueItems = items.filter(i => !next[cat].some(existing => existing.toLowerCase() === i.toLowerCase()));
        next[cat] = [...next[cat], ...uniqueItems];
      };
      
      add('dishes', updates.add.dishes);
      add('fridge', updates.add.fridge);
      add('pantry', updates.add.pantry);

      const remove = (cat: keyof OnboardingState, items: string[]) => {
        const targets = items.map(i => i.toLowerCase());
        next[cat] = next[cat].filter(i => !targets.includes(i.toLowerCase()));
      };
      
      remove('dishes', updates.remove.dishes);
      remove('fridge', updates.remove.fridge);
      remove('pantry', updates.remove.pantry);

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative flex flex-col min-h-[660px]">
        
        {/* Step 1: Welcome */}
        <div className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col items-center text-center ${step === 'welcome' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
            <ChefHat size={48} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-800 mb-4 tracking-tight">Meet HomeCuistot</h1>
          <p className="text-stone-600 leading-relaxed mb-8 px-4 text-lg">
            Your smart kitchen assistant that knows your fridge before you even open it.
          </p>
          <div className="bg-orange-50 p-5 rounded-2xl flex items-start text-left mb-12 border border-orange-100 shadow-sm">
            <div className="bg-orange-600 rounded-lg p-2 mr-4 shrink-0 shadow-md">
               <Mic className="text-white" size={20} />
            </div>
            <p className="text-sm text-orange-900 leading-snug">
              <span className="font-bold block mb-1">Ultra-Fast Voice Processing</span>
              We use lightning-fast AI to understand your kitchen in real-time. Just hold the mic and speak!
            </p>
          </div>
          <button 
            onClick={goToNext}
            className="mt-auto w-full py-5 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-2xl flex items-center justify-center transition-all group shadow-xl shadow-orange-100"
          >
            Get Started
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Step 2: Selections */}
        <div className={`transition-all duration-500 absolute inset-0 p-6 flex flex-col ${step === 'selection' ? 'translate-x-0 opacity-100' : (step === 'welcome' ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none')}`}>
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Quick Picks</h2>
          <p className="text-sm text-stone-500 mb-6">Select your kitchen staples to save time</p>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2 pb-4">
            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                <div className="w-1 h-3 bg-blue-500 mr-2 rounded-full" />
                Dishes you master
              </h3>
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
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                <div className="w-1 h-3 bg-emerald-500 mr-2 rounded-full" />
                In your fridge
              </h3>
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
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                <div className="w-1 h-3 bg-amber-500 mr-2 rounded-full" />
                Pantry staples
              </h3>
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

          <div className="pt-6 border-t border-stone-100 flex gap-4 bg-white">
            <button 
              onClick={resetSelection}
              className="px-6 py-4 bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold rounded-2xl flex items-center justify-center transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={goToNext}
              className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-orange-100"
            >
              Next Step
              <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>

        {/* Step 3: Fast Voice Addition */}
        <div className={`transition-all duration-500 absolute inset-0 p-6 flex flex-col ${step === 'voice' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Final Audit</h2>
              <p className="text-sm text-stone-500">Refine your list using rapid voice input</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl">
              <Sparkles className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50 border border-stone-100 rounded-3xl p-5 mb-4 shadow-inner">
            <div className="flex flex-wrap gap-2 content-start">
              {state.dishes.map(d => <MixedBadge key={d} label={d} type="dish" onRemove={() => toggleItem('dishes', d)} />)}
              {state.fridge.map(f => <MixedBadge key={f} label={f} type="fridge" onRemove={() => toggleItem('fridge', f)} />)}
              {state.pantry.map(p => <MixedBadge key={p} label={p} type="pantry" onRemove={() => toggleItem('pantry', p)} />)}
              
              {state.dishes.length === 0 && state.fridge.length === 0 && state.pantry.length === 0 && !isProcessing && (
                <div className="w-full text-center py-20">
                   <p className="text-stone-400 font-medium italic">Your kitchen is empty.<br/>Hold the mic and tell me what you have!</p>
                </div>
              )}

              {isProcessing && (
                <div className="w-full flex flex-col items-center py-10 gap-4 animate-pulse">
                  <BrainCircuit className="text-orange-400" size={48} />
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">{processingStep}</span>
                    <div className="w-48 h-1 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-1/2 animate-[progress_1s_infinite_linear]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] text-center">
                {isRecording ? "Listening to your kitchen..." : "Fast Voice Mode Enabled"}
              </p>
              <div className="flex items-center gap-1.5 h-6">
                 {isRecording && [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-red-500 rounded-full animate-bounce" 
                      style={{ height: `${Math.random() * 60 + 40}%`, animationDelay: `${i * 0.08}s` }} 
                    />
                 ))}
              </div>
            </div>
            
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${
                isProcessing ? 'bg-stone-50 border-stone-200 border-4' : 
                isRecording ? 'bg-red-500 scale-110 shadow-red-200 ring-8 ring-red-50' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="text-orange-500 animate-spin" size={48} />
              ) : isRecording ? (
                <MicOff className="text-white" size={48} />
              ) : (
                <Mic className="text-white" size={48} />
              )}
              
              {/* Tap hint for desktop */}
              {!isRecording && !isProcessing && (
                <div className="absolute -top-2 -right-2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded-full font-bold">HOLD</div>
              )}
            </button>
            
            <div className="h-6 flex items-center">
               <span className={`text-xs font-black tracking-widest transition-colors ${isRecording ? 'text-red-500' : 'text-stone-400'}`}>
                {isProcessing ? processingStep.toUpperCase() : isRecording ? "RECORDING..." : "PRESS & HOLD TO ADD ITEMS"}
              </span>
            </div>

            <button 
              onClick={() => alert("Welcome to HomeCuistot! Your digital kitchen is ready.")}
              className="w-full py-5 bg-stone-900 hover:bg-black text-white text-lg font-bold rounded-2xl flex items-center justify-center transition-all shadow-xl mt-2"
            >
              Confirm Inventory
              <Check className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className="mt-8 flex gap-3">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              (step === 'welcome' && i === 1) || (step === 'selection' && i === 2) || (step === 'voice' && i === 3)
              ? 'w-10 bg-orange-600' : 'w-2 bg-stone-300'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

// Sub-components
const Badge: React.FC<{label: string, selected: boolean, onClick: () => void}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
      selected 
      ? 'bg-orange-600 border-orange-600 text-white shadow-lg translate-y-[-2px]' 
      : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'
    }`}
  >
    {label}
  </button>
);

const MixedBadge: React.FC<{label: string, type: 'dish' | 'fridge' | 'pantry', onRemove: () => void}> = ({ label, type, onRemove }) => {
  const themes = {
    dish: 'bg-blue-600 text-white ring-blue-100',
    fridge: 'bg-emerald-600 text-white ring-emerald-100',
    pantry: 'bg-amber-600 text-white ring-amber-100'
  };
  return (
    <div className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ring-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${themes[type]}`}>
      <span className="capitalize">{label}</span>
      <button onClick={onRemove} className="ml-3 p-1 hover:bg-white/20 rounded-lg transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default App;
