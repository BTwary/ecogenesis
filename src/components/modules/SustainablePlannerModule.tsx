import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Target, 
  Flame, 
  Calendar, 
  Plus, 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  Droplet, 
  Leaf, 
  Award,
  Zap,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SustainabilityGoal, SustainabilityChallenge, ActivityLog } from '../../types';
import { StorageService } from '../../services/storageService';

export const SustainablePlannerModule: React.FC = () => {
  const [goals, setGoals] = useState<SustainabilityGoal[]>(StorageService.getGoals());
  const [challenges, setChallenges] = useState<SustainabilityChallenge[]>(StorageService.getChallenges());
  const [activities, setActivities] = useState<ActivityLog[]>(StorageService.getActivities());

  // Form states for new goal & activity
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<SustainabilityGoal['category']>('energy');
  const [newGoalTarget, setNewGoalTarget] = useState(15);
  const [newGoalUnit, setNewGoalUnit] = useState('% reduction');

  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('Mobility');
  const [newActivityCarbon, setNewActivityCarbon] = useState(2.5);
  const [newActivityWater, setNewActivityWater] = useState(0);

  // Cumulative verified impact metrics
  const totalCarbonSavedKg = activities.reduce((acc, a) => acc + (a.verifiedImpact?.carbonSavedKg || 0), 0);
  const totalWaterSavedLitres = activities.reduce((acc, a) => acc + (a.verifiedImpact?.waterSavedLitres || 0), 0);

  const handleToggleGoal = (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        return { ...g, completed: nextState, currentValue: nextState ? g.targetValue : g.currentValue };
      }
      return g;
    });
    setGoals(updated);
    StorageService.saveGoals(updated);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: SustainabilityGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      category: newGoalCategory,
      targetValue: newGoalTarget,
      currentValue: 0,
      unit: newGoalUnit,
      deadline: '2026-12-31',
      completed: false
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    StorageService.saveGoals(updated);
    setNewGoalTitle('');
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityDesc.trim()) return;

    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      category: newActivityCategory,
      description: newActivityDesc,
      verifiedImpact: {
        carbonSavedKg: Number(newActivityCarbon),
        waterSavedLitres: Number(newActivityWater)
      }
    };

    StorageService.addActivity(newAct);
    setActivities(StorageService.getActivities());
    setNewActivityDesc('');
    
    confetti({
      particleCount: 40,
      spread: 40,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Target className="w-4 h-4" />
            <span>ACTIONABLE HABIT SYSTEM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Sustainable Living Planner & Tracker
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Set verified targets, join monthly collective sprints, and record daily verified savings.
          </p>
        </div>

        {/* Milestone Badge Pill */}
        <div className="flex items-center space-x-3 bg-emerald-950/70 border border-emerald-500/40 px-4 py-2 rounded-xl shadow-md">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="text-xs font-mono">
            <span className="text-gray-400 block text-[10px]">VERIFIED IMPACT LOGGED:</span>
            <span className="text-emerald-300 font-bold">{totalCarbonSavedKg.toFixed(1)} kg CO2e</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-blue-300 font-bold">{totalWaterSavedLitres.toLocaleString()} L water</span>
          </div>
        </div>
      </div>

      {/* Grid: Goals on Left, Challenges & Activities on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personalized Goals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">Active Sustainability Goals</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {goals.filter(g => g.completed).length} / {goals.length} Completed
              </span>
            </div>

            {/* Goals List */}
            <div className="space-y-3">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div 
                    key={goal.id}
                    className={`p-4 rounded-xl border transition-all ${
                      goal.completed 
                        ? 'bg-emerald-950/40 border-emerald-700/40 opacity-80' 
                        : 'bg-[#04110a] border-emerald-900/60 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleToggleGoal(goal.id)}
                          className={`mt-0.5 p-1 rounded-md border transition-colors cursor-pointer ${
                            goal.completed 
                              ? 'bg-emerald-500 border-emerald-400 text-gray-950' 
                              : 'border-emerald-700 hover:border-emerald-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>
                        <div>
                          <span className={`text-sm font-semibold block ${goal.completed ? 'line-through text-gray-400' : 'text-gray-100'}`}>
                            {goal.title}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                            Target: {goal.targetValue} {goal.unit} · Due: {goal.deadline}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">
                        {goal.completed ? '100%' : `${percent}%`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-900 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${goal.completed ? 100 : percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Goal Accordion/Form */}
            <form onSubmit={handleAddGoal} className="pt-4 border-t border-emerald-950 space-y-3">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Define a New Environmental Goal:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="e.g. Cut hot water heater runtime by 20%"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="sm:col-span-6 bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                />
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value as any)}
                  className="sm:col-span-3 bg-[#030c08] border border-emerald-900 rounded-lg px-2 py-2 text-emerald-300"
                >
                  <option value="energy">Energy</option>
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                  <option value="mobility">Mobility</option>
                  <option value="nature">Nature</option>
                </select>
                <button
                  type="submit"
                  className="sm:col-span-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Goal</span>
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Right Column: Monthly Challenges & Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Monthly Collective Sprints */}
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-emerald-950 pb-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-display">Active Monthly Sprints</h3>
            </div>

            <div className="space-y-3">
              {challenges.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-[#04110a] border border-emerald-950 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.title}</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800 font-mono">
                      {c.durationDays} Days
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{c.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 border-t border-emerald-950/60">
                    <span>{c.participantsCount.toLocaleString()} Participants</span>
                    <span className="text-emerald-400 font-bold">Active Sprint</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Activity Logging */}
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-emerald-950 pb-3">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-display">Log a Sustainable Action</h3>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="What action did you take today? (e.g. Took metro, planted sapling)"
                value={newActivityDesc}
                onChange={(e) => setNewActivityDesc(e.target.value)}
                className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 text-[10px] block">Estimated CO2 Saved (kg):</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newActivityCarbon}
                    onChange={(e) => setNewActivityCarbon(Number(e.target.value))}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded px-2 py-1 text-emerald-300 font-mono"
                  />
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Water Saved (Litres):</span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={newActivityWater}
                    onChange={(e) => setNewActivityWater(Number(e.target.value))}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded px-2 py-1 text-blue-300 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all cursor-pointer shadow-md"
              >
                Log Verified Action + Claim Points
              </button>
            </form>

            {/* Recent Logged Actions */}
            <div className="pt-3 border-t border-emerald-950 space-y-2">
              <span className="text-[11px] font-mono text-gray-400 block uppercase">Recent Verified Actions:</span>
              {activities.slice(0, 3).map((act) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-[#04110a] border border-emerald-950/70 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-gray-200 block font-medium">{act.description}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{act.date} · {act.category}</span>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    {act.verifiedImpact.carbonSavedKg > 0 && (
                      <span className="text-emerald-400 block">+{act.verifiedImpact.carbonSavedKg}kg CO2</span>
                    )}
                    {act.verifiedImpact.waterSavedLitres > 0 && (
                      <span className="text-blue-400 block">+{act.verifiedImpact.waterSavedLitres}L</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
