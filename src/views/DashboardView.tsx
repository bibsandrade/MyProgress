import React, { useState } from 'react';
import {
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Calendar,
  Plus,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import {
  calculateWeightProgress,
  calculateMeasurementEvolution,
  calculateBmi,
  getBmiCategory,
} from '../services/calculations';
import {
  formatDatePt,
  formatWeight,
  formatCm,
  formatPercent,
  formatNumber,
} from '../utils/formatters';
import { InteractiveCharts } from '../components/InteractiveCharts';

interface Props {
  onOpenAssessmentModal: () => void;
  onOpenDailyModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  onOpenAssessmentModal,
  onOpenDailyModal,
  onNavigateToTab,
}) => {
  const { profile, assessments, dailyEntries, milestones, saveMilestone } = useApp();

  const weightProgress = calculateWeightProgress(profile, assessments, dailyEntries);

  // Measurement evolutions
  const waistEvolution = calculateMeasurementEvolution(assessments, 'waistCm');
  const abdomenEvolution = calculateMeasurementEvolution(assessments, 'abdomenCm');
  const hipEvolution = calculateMeasurementEvolution(assessments, 'hipCm');

  // BMI based on current weight
  const currentBmi =
    weightProgress.currentWeight && profile?.heightCm
      ? calculateBmi(weightProgress.currentWeight, profile.heightCm)
      : null;
  const bmiInfo = currentBmi ? getBmiCategory(currentBmi) : null;

  const hasAnyData = assessments.length > 0 || dailyEntries.length > 0;

  const handleToggleMilestone = async (id: string, currentlyAchieved: boolean) => {
    const target = milestones.find((m) => m.id === id);
    if (!target) return;

    const achievedAt = currentlyAchieved ? undefined : new Date().toISOString();
    await saveMilestone({ ...target, achievedAt });

    if (!currentlyAchieved) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F2BFD3', '#E99AB9', '#C86D93'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  if (!hasAnyData && !profile?.initialWeightKg) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-8 sm:p-12 text-center border border-[#F2BFD3]/40 dark:border-[#362A36] max-w-xl mx-auto my-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#39313A] dark:text-[#F7EFF5] mb-2">
          Bem-vinda ao My Progress!
        </h2>
        <p className="text-xs text-[#817782] dark:text-[#A69AA8] leading-relaxed max-w-md mx-auto mb-6">
          A tua aplicação pessoal e privada para acompanhar a evolução física, medidas, alimentação e hábitos com elegância e consistência.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAssessmentModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-6 py-3 text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Primeira Pesagem</span>
          </button>
          <button
            onClick={onOpenDailyModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-5 py-3 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
          >
            <span>Abrir Diário de Hoje</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Olá, {profile?.name || 'Bem-vinda'} 🌸
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Aqui está o teu panorama atualizado de progresso físico
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAssessmentModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Avaliação Corporal</span>
          </button>
          <button
            onClick={onOpenDailyModal}
            className="flex items-center gap-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-4 py-2.5 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
          >
            <span>+ Diário do Dia</span>
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Peso Atual */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Peso Atual
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {formatWeight(weightProgress.currentWeight)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#817782] dark:text-[#A69AA8]">
            <span>Última pesagem:</span>
            <span className="font-medium text-[#39313A] dark:text-[#F7EFF5]">
              {formatDatePt(weightProgress.lastWeightDate)}
            </span>
          </div>
        </div>

        {/* Card 2: Peso Inicial */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Peso Inicial
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {formatWeight(weightProgress.initialWeight)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#817782] dark:text-[#A69AA8]">
            <span>Início da jornada:</span>
            <span className="font-medium text-[#39313A] dark:text-[#F7EFF5]">
              {formatDatePt(profile?.startDate)}
            </span>
          </div>
        </div>

        {/* Card 3: Variação Total */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Variação Líquida
            </span>
            <div
              className={`p-1.5 rounded-lg ${
                weightProgress.weightChangeType === 'lost'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                  : weightProgress.weightChangeType === 'gained'
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                  : 'bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#817782]'
              }`}
            >
              {weightProgress.weightChangeType === 'lost' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : weightProgress.weightChangeType === 'gained' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {weightProgress.weightDiffKg !== null ? (
              weightProgress.weightChangeType === 'lost' ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  -{formatNumber(Math.abs(weightProgress.weightDiffKg), 1)} kg
                </span>
              ) : weightProgress.weightChangeType === 'gained' ? (
                <span className="text-[#39313A] dark:text-[#F7EFF5]">
                  +{formatNumber(weightProgress.weightDiffKg, 1)} kg
                </span>
              ) : (
                '0,0 kg'
              )
            ) : (
              '—'
            )}
          </div>
          <div className="mt-2 text-[10px] text-[#817782] dark:text-[#A69AA8]">
            {weightProgress.weightLostPercent !== null ? (
              <span>
                {weightProgress.weightLostPercent > 0
                  ? `${formatNumber(weightProgress.weightLostPercent, 1)}% do peso inicial perdido`
                  : `${formatNumber(Math.abs(weightProgress.weightLostPercent), 1)}% do peso inicial aumentado`}
              </span>
            ) : (
              'Sem dados históricos'
            )}
          </div>
        </div>

        {/* Card 4: Objetivo & Progresso */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Meta de Peso
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {formatWeight(weightProgress.goalWeight)}
          </div>
          <div className="mt-2">
            {weightProgress.goalWeight && weightProgress.currentWeight ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#817782] dark:text-[#A69AA8]">Progresso:</span>
                  <span className="font-bold text-[#C86D93]">
                    {weightProgress.goalProgressPercent !== null
                      ? `${formatNumber(weightProgress.goalProgressPercent, 1)}%`
                      : '—'}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-[#FFF8FB] dark:bg-[#140F15] h-1.5 rounded-full overflow-hidden border border-[#F2BFD3]/30">
                  <div
                    className="h-full bg-gradient-to-r from-[#F2BFD3] to-[#C86D93] rounded-full transition-all duration-500"
                    style={{ width: `${weightProgress.visualGoalProgressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#817782] dark:text-[#A69AA8] text-right">
                  {weightProgress.hasReachedGoal ? (
                    <span className="text-emerald-600 font-semibold">Meta alcançada! 🎉</span>
                  ) : (
                    <span>Faltam {formatNumber(weightProgress.remainingWeightKg, 1)} kg</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-[#817782]">Define a meta nas Definições</span>
            )}
          </div>
        </div>
      </div>

      {/* IMC & MEASUREMENT CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* IMC Card */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
              Índice de Massa Corporal (IMC)
            </span>
            <span className="text-xs font-bold text-[#C86D93]">
              {currentBmi !== null ? `${currentBmi}` : '—'}
            </span>
          </div>
          {bmiInfo ? (
            <div>
              <span className={`text-xs font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</span>
              <p className="text-[11px] text-[#817782] dark:text-[#A69AA8] mt-1 leading-relaxed">
                {bmiInfo.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
              Regista peso e altura para cálculo automático do IMC orientativo.
            </p>
          )}
        </div>

        {/* Measurements Summary Card */}
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
              Evolução das Medidas Principais
            </span>
            <button
              onClick={() => onNavigateToTab('measurements')}
              className="text-xs font-semibold text-[#C86D93] hover:underline flex items-center gap-0.5"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Cintura', data: waistEvolution },
              { label: 'Abdómen', data: abdomenEvolution },
              { label: 'Anca / Glúteos', data: hipEvolution },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]"
              >
                <span className="block text-[11px] text-[#817782] dark:text-[#A69AA8] truncate mb-0.5">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5]">
                  {formatCm(item.data.currentValue)}
                </span>
                <div className="mt-1 text-[10px]">
                  {item.data.hasData && item.data.diff !== null ? (
                    item.data.diff < 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatNumber(item.data.diff, 1)} cm
                      </span>
                    ) : item.data.diff > 0 ? (
                      <span className="text-rose-500 font-semibold">
                        +{formatNumber(item.data.diff, 1)} cm
                      </span>
                    ) : (
                      <span className="text-gray-400">0 cm</span>
                    )
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHARTS */}
      <InteractiveCharts assessments={assessments} dailyEntries={dailyEntries} />

      {/* MILESTONES / INTERMEDIATE GOALS WIDGET */}
      {milestones.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C86D93]" />
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                Metas Intermédias & Conquistas
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('settings')}
              className="text-xs font-medium text-[#817782] dark:text-[#A69AA8] hover:text-[#C86D93]"
            >
              Gerir Metas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {milestones.map((m) => {
              const isAchieved = !!m.achievedAt;
              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id, isAchieved)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isAchieved
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-[#FFF8FB] dark:bg-[#140F15] border-[#F2BFD3]/30 dark:border-[#362A36] hover:border-[#E99AB9]'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-semibold block ${
                        isAchieved
                          ? 'line-through text-[#817782] dark:text-[#A69AA8]'
                          : 'text-[#39313A] dark:text-[#F7EFF5]'
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="text-[11px] text-[#817782]">
                      Alvo: {m.targetValue} {m.unit}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                      isAchieved
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721]'
                    }`}
                  >
                    {isAchieved ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
