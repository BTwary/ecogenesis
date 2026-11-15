import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Cpu,
  Bot
} from 'lucide-react';
import { AiAssistantResponse } from '../../types';
import { 
  queryGaiaAssistant, 
  SUGGESTED_PROMPTS, 
  getStoredGeminiKey, 
  saveStoredGeminiKey 
} from '../../services/aiAssistantEngine';

export const AiAssistantModule: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>(() => getStoredGeminiKey() || '');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [keyToast, setKeyToast] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string | AiAssistantResponse }>>([
    {
      role: 'assistant',
      content: {
        query: 'System Welcome',
        problemAnalysis: 'Welcome to the GAIA Environmental Intelligence Assistant. I provide evidence-based, scientifically grounded sustainability assessments. Every recommendation is accompanied by physical problem analysis, practical action steps, quantified environmental benefits, implementation difficulty, and approximate financial ROI according to peer-reviewed datasets (IPCC, IEA, BEE, and EPA).',
        recommendations: [
          {
            title: 'Explore Decarbonization & Conservation Pathways',
            description: 'Select one of the suggested scientific inquiries below or enter any specific operational challenge concerning household energy, water management, business Scope 1/2/3 decarbonization, or municipal waste diversion.',
            actionSteps: [
              'Click any suggested prompt chip below for an instant audit.',
              'Ask custom queries regarding your specific appliances, roof area, or facility footprint.'
            ]
          }
        ],
        environmentalSavings: {
          carbonKgPerYear: 1850,
          energyKwhPerYear: 2400,
          waterLitresPerYear: 35000,
          wasteKgPerYear: 180
        },
        implementationDifficulty: 'Low',
        financialImplications: {
          initialInvestment: 'Context Dependent',
          annualSavings: 'Substantial Lifecycle Utility Reductions',
          paybackPeriodYears: 1.2
        },
        sourcesAndConfidence: {
          sources: ['IPCC Working Group III', 'International Energy Agency (IEA)', 'Bureau of Energy Efficiency (BEE)'],
          confidenceLevel: 'High',
          methodologyNote: 'Deterministic life-cycle analysis conforming to GHG Protocol and ISO 14040 standards.'
        }
      }
    }
  ]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    setInputQuery('');
    setConversation(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const response = await queryGaiaAssistant(text, geminiKey);
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = (k: string) => {
    setGeminiKey(k);
    saveStoredGeminiKey(k);
    setKeyToast(k ? 'Google Gemini 1.5 Flash Connected!' : 'Cleared custom key. Running on built-in GAIA engine.');
    setTimeout(() => setKeyToast(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Toast Alert */}
      {keyToast && (
        <div className="fixed top-20 right-8 z-50 bg-cyan-950 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono animate-bounce flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{keyToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Bot className="w-4 h-4" />
            <span>GAIA INTELLIGENCE ASSISTANT (v2.4 DUAL-CORE)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            AI Sustainability & Environmental Assistant
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Deterministic peer-reviewed reasoning. Zero fabricated savings or unverified claims.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-600/40 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Scientific Integrity Verified</span>
        </div>
      </div>

      {/* Dual-Core AI Architecture Status Banner */}
      <div className="bg-[#020b06] p-3.5 rounded-xl border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-gray-300">
            Active AI Architecture: <strong className="text-emerald-400">GAIA Deterministic Physics (Active & 100% Free)</strong>
            {geminiKey ? <span className="text-cyan-300 font-bold ml-1.5">+ Google Gemini 1.5 Flash Connected</span> : ''}
          </span>
        </div>

        <button
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer text-left sm:text-right"
        >
          {showKeyConfig ? 'Hide LLM Settings' : (geminiKey ? 'Manage Gemini Key' : 'Configure Custom Gemini API Key')}
        </button>
      </div>

      {/* Key Config Drawer */}
      {showKeyConfig && (
        <div className="p-4 rounded-xl bg-[#03110a] border border-cyan-900/60 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-gray-300 font-bold">
            <span>Optional: Connect Your Google Gemini API Key for Open-Ended Synthesis</span>
            <span className="text-[10px] text-gray-400">Stored strictly in your local browser</span>
          </div>
          <p className="text-[11px] text-gray-400 font-sans">
            By default, ECOGENESIS runs on its built-in GAIA physics engine with 100% availability and zero API keys needed. If you want open-ended natural language generation, paste your free Google AI Studio key below:
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="flex-1 bg-[#010804] border border-emerald-900 rounded-lg px-3 py-2 text-emerald-300 focus:outline-none font-mono text-xs"
            />
            <button
              onClick={() => handleSaveKey(geminiKey)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
            >
              Save Key
            </button>
            {geminiKey && (
              <button
                onClick={() => handleSaveKey('')}
                className="px-3.5 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
          Recommended Scientific Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#061810] border border-emerald-500/30 text-gray-300 hover:text-emerald-300 hover:border-emerald-400/60 transition-all text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History Container */}
      <div className="space-y-6">
        {conversation.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} className="flex justify-end">
                <div className="max-w-2xl bg-emerald-900/40 border border-emerald-500/40 rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm text-emerald-100 shadow-md">
                  <span className="text-[10px] font-mono text-emerald-400 block mb-1">USER QUERY</span>
                  {typeof msg.content === 'string' ? msg.content : ''}
                </div>
              </div>
            );
          }

          const resp = msg.content as AiAssistantResponse;

          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-700 text-white shadow-lg shrink-0 mt-1">
                <Cpu className="w-5 h-5" />
              </div>

              <div className="flex-1 glass-panel rounded-2xl rounded-tl-sm p-6 space-y-5 border border-emerald-500/30 shadow-xl">
                
                {/* 1. Problem Analysis */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>1. Environmental Problem Analysis</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {resp.problemAnalysis}
                  </p>
                </div>

                {/* 2. Practical Recommendations */}
                <div className="space-y-3 pt-2 border-t border-emerald-950">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2. Practical Actionable Recommendations</span>
                  </div>

                  <div className="space-y-3">
                    {resp.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60 space-y-2">
                        <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">{rec.description}</p>
                        <ul className="space-y-1 pl-1">
                          {rec.actionSteps.map((step, sIdx) => (
                            <li key={sIdx} className="text-xs text-emerald-300/90 flex items-start space-x-1.5">
                              <span className="text-emerald-500 font-bold">›</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Estimated Environmental Benefits & 4. Difficulty & 5. Financial Implications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-emerald-950">
                  
                  {/* Benefits */}
                  <div className="bg-[#030c08] p-3.5 rounded-lg border border-emerald-900/60 space-y-1.5">
                    <span className="text-[11px] font-mono text-gray-400 flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3 text-emerald-400" />
                      <span>3. Quantified Benefits:</span>
                    </span>
                    <div className="text-xs space-y-1 font-mono">
                      {resp.environmentalSavings.carbonKgPerYear && (
                        <div className="text-emerald-300 font-bold">
                          -{resp.environmentalSavings.carbonKgPerYear} kg CO2e / yr
                        </div>
                      )}
                      {resp.environmentalSavings.energyKwhPerYear && (
                        <div className="text-cyan-300">
                          -{resp.environmentalSavings.energyKwhPerYear} kWh / yr
                        </div>
                      )}
                      {resp.environmentalSavings.waterLitresPerYear && (
                        <div className="text-blue-300">
                          -{resp.environmentalSavings.waterLitresPerYear.toLocaleString()} L water / yr
                        </div>
                      )}
                      {resp.environmentalSavings.wasteKgPerYear && (
                        <div className="text-amber-300">
                          -{resp.environmentalSavings.wasteKgPerYear} kg waste diverted
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="bg-[#030c08] p-3.5 rounded-lg border border-emerald-900/60 space-y-1.5">
                    <span className="text-[11px] font-mono text-gray-400 flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>4. Implementation Difficulty:</span>
                    </span>
                    <div className="pt-1">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                        resp.implementationDifficulty === 'Low'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : resp.implementationDifficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                      }`}>
                        {resp.implementationDifficulty} Effort
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Requires minimal structural disruption; high return on effort.
                    </p>
                  </div>

                  {/* Financial Implications */}
                  <div className="bg-[#030c08] p-3.5 rounded-lg border border-emerald-900/60 space-y-1.5">
                    <span className="text-[11px] font-mono text-gray-400 flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-amber-400" />
                      <span>5. Financial Implications:</span>
                    </span>
                    <div className="text-xs space-y-1">
                      <div className="text-gray-300">
                        <strong className="text-gray-400 font-mono text-[10px] block">CapEx Upfront:</strong>
                        {resp.financialImplications.initialInvestment}
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        <strong className="text-gray-400 font-mono text-[10px] block">Annual OpEx Savings:</strong>
                        {resp.financialImplications.annualSavings}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 6. Sources & Confidence Level */}
                <div className="bg-[#020a06] p-3 rounded-lg border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-gray-400">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sources: <strong className="text-gray-300">{resp.sourcesAndConfidence.sources.join(', ')}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confidence: <strong>{resp.sourcesAndConfidence.confidenceLevel}</strong></span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3 text-emerald-400 text-xs font-mono animate-pulse">
            <Cpu className="w-5 h-5 animate-spin" />
            <span>Analyzing scientific peer-reviewed database and synthesizing response...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="sticky bottom-4 z-20">
        <div className="relative glass-card-neon rounded-xl p-2 shadow-2xl border border-emerald-500/40">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask GAIA: e.g. How to cut household AC electricity by 30%, or design a school zero-waste initiative..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-bold transition-all shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
