'use client';

import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PillarScore } from '@/lib/types';

interface IkigaiRadarChartProps {
  scores: PillarScore[];
  /** Translated pillar labels: { love: "...", good: "...", need: "...", paid: "..." } */
  pillarLabels?: Record<string, string>;
}

/** Map pillar to display color */
const PILLAR_COLORS: Record<string, string> = {
  love: '#f472b6',
  good: '#818cf8',
  need: '#34d399',
  paid: '#fbbf24',
};

export default function IkigaiRadarChart({ scores, pillarLabels }: IkigaiRadarChartProps) {
  // Transform scores for Recharts — use translated labels if available
  const data = scores.map((s) => ({
    pillar: pillarLabels?.[s.pillar] || s.label,
    score: s.score,
    fullMark: s.max_score,
    color: PILLAR_COLORS[s.pillar] || '#f472b6',
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-sakura-500/5 blur-2xl" />

        <ResponsiveContainer width="100%" height={340}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
            {/* Grid lines */}
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />

            {/* Axis labels */}
            <PolarAngleAxis
              dataKey="pillar"
              tick={({ x, y, payload }) => {
                // Find original pillar key for coloring
                const matchedScore = scores.find((s) => {
                  const translatedLabel = pillarLabels?.[s.pillar] || s.label;
                  return translatedLabel === payload.value;
                });
                const color = matchedScore
                  ? PILLAR_COLORS[matchedScore.pillar]
                  : '#94a3b8';
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color}
                    fontSize={11}
                    fontWeight={500}
                    className="select-none"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            {/* Radius axis (score values) */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 15, 35, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 14px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              itemStyle={{ color: '#e2e8f0', fontSize: 13 }}
              labelStyle={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
            />

            {/* The radar shape */}
            <Radar
              name="Ikigai"
              dataKey="score"
              stroke="rgba(244, 122, 152, 0.8)"
              fill="url(#radarGradient)"
              fillOpacity={0.35}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#f47a98',
                stroke: '#fff',
                strokeWidth: 1.5,
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* Gradient definition */}
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.2} />
              </radialGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score pills below the chart */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {scores.map((s) => (
          <motion.div
            key={s.pillar}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + scores.indexOf(s) * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PILLAR_COLORS[s.pillar] }}
            />
            <span className="text-xs text-white/60">
              {pillarLabels?.[s.pillar] || s.label}
            </span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: PILLAR_COLORS[s.pillar] }}
            >
              {s.score}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
