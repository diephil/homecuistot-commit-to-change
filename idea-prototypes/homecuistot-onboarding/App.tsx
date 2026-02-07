
import React, { useState, useCallback, useEffect } from 'react';
import { ChefHat, ChevronRight, Mic, RotateCcw, Check, Sparkles, MicOff, Loader2 } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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

  const handleVoiceProcess = async (audioBase64: string) => {
    setIsProcessing(true);
    const context = JSON.stringify(state);
    const updates = await processVoiceInput(audioBase64, context);
    
    if (updates) {
      setState(prev => {
        const newState = { ...prev };
        
        // Handle additions
        newState.dishes = Array.from(new Set([...newState.dishes, ...updates.add.dishes]));
        newState.fridge = Array.from(new Set([...newState.fridge, ...updates.add.fridge]));
        newState.pantry = Array.from(new Set([...newState.pantry, ...updates.add.pantry]));
        
        // Handle removals (case-insensitive for safety)
        const filterFn = (items: string[], toRemove: string[]) => 
          items.filter(i => !toRemove.map(r => r.toLowerCase()).includes(i.toLowerCase()));

        newState.dishes = filterFn(newState.dishes, updates.remove.dishes);
        newState.fridge = filterFn(newState.fridge, updates.remove.fridge);
        newState.pantry = filterFn(newState.pantry, updates.remove.pantry);

        return newState;
      });
    }
    setIsProcessing(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(',')[1];
          if (base64data) handleVoiceProcess(base64data);
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Please allow microphone access to use voice features.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
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
            <Mic className="text-orange-600 mr-3 shrink-0" size={20} />
            <p className="text-sm text-orange-800">
              <span className="font-semibold block">Hands-free Cooking</span>
              HomeCuistot uses voice commands. We'll ask for microphone permission so you can talk to your assistant while cooking!
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
          <h2 className="text-xl font-bold text-stone-800 mb-1">Set Up Your Kitchen</h2>
          <p className="text-sm text-stone-500 mb-6">Tap to select what you usually have</p>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
            {/* Dishes */}
            <section>
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">What can you cook?</h3>
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

            {/* Fridge */}
            <section>
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">What's in your fridge?</h3>
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

            {/* Pantry */}
            <section>
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">What's in your pantry?</h3>
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

        {/* Step 3: Voice Confirmation */}
        <div className={`transition-all duration-500 absolute inset-0 p-6 flex flex-col ${step === 'voice' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-800">Anything to add?</h2>
              <p className="text-sm text-stone-500">Review your inventory or use your voice</p>
            </div>
            <Sparkles className="text-orange-500" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50 rounded-2xl p-4 space-y-6">
            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Available Ingredients & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {state.dishes.map(d => <SummaryBadge key={d} label={d} type="dish" onRemove={() => toggleItem('dishes', d)} />)}
                {state.fridge.map(f => <SummaryBadge key={f} label={f} type="fridge" onRemove={() => toggleItem('fridge', f)} />)}
                {state.pantry.map(p => <SummaryBadge key={p} label={p} type="pantry" onRemove={() => toggleItem('pantry', p)} />)}
                
                {state.dishes.length === 0 && state.fridge.length === 0 && state.pantry.length === 0 && (
                  <p className="text-stone-400 italic text-sm py-4">Nothing added yet. Try speaking to me!</p>
                )}
              </div>
            </section>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-xs text-stone-400 text-center px-8">
              "Add avocado to the fridge", "Remove pasta", "I can also cook Lasagna"
            </p>
            
            <div className="relative group">
              {isRecording && (
                <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25 scale-125"></div>
              )}
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl relative z-10 ${
                  isProcessing ? 'bg-stone-300' : 
                  isRecording ? 'bg-red-500 scale-95' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="text-white animate-spin" size={32} />
                ) : isRecording ? (
                  <MicOff className="text-white" size={32} />
                ) : (
                  <Mic className="text-white" size={32} />
                )}
              </button>
            </div>
            
            <p className="text-sm font-medium text-stone-700">
              {isProcessing ? "Processing..." : isRecording ? "Listening..." : "Hold to speak"}
            </p>

            <button 
              onClick={() => alert("Welcome to HomeCuistot! Your profile is ready.")}
              className="w-full mt-4 py-4 bg-stone-800 hover:bg-black text-white font-semibold rounded-2xl flex items-center justify-center transition-colors"
            >
              Finish Setup
              <Check className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-stone-400 text-sm flex items-center gap-4">
        <span className={step === 'welcome' ? 'text-orange-600 font-bold' : ''}>Welcome</span>
        <div className="w-1 h-1 bg-stone-300 rounded-full" />
        <span className={step === 'selection' ? 'text-orange-600 font-bold' : ''}>Selection</span>
        <div className="w-1 h-1 bg-stone-300 rounded-full" />
        <span className={step === 'voice' ? 'text-orange-600 font-bold' : ''}>Confirmation</span>
      </footer>
    </div>
  );
};

// Sub-components defined outside for performance
interface BadgeProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Badge: React.FC<BadgeProps> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
      selected 
      ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-sm' 
      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
    }`}
  >
    {label}
  </button>
);

interface SummaryBadgeProps {
  label: string;
  type: 'dish' | 'fridge' | 'pantry';
  onRemove: () => void;
}

const SummaryBadge: React.FC<SummaryBadgeProps> = ({ label, type, onRemove }) => {
  const colors = {
    dish: 'bg-blue-50 text-blue-700 border-blue-100',
    fridge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pantry: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  return (
    <div className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold ${colors[type]}`}>
      {label}
      <button onClick={onRemove} className="ml-2 hover:opacity-50 transition-opacity">
        <RotateCcw size={12} />
      </button>
    </div>
  );
};

export default App;
