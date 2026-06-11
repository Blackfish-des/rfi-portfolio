"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: { domain: string; shortName: string; level: number; color: string }[];
};

export default function SkillsRadar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="shortName"
          tick={{ fontSize: 10, fill: "#6B7280", fontWeight: 500 }}
        />
        <Radar
          name="Skill level"
          dataKey="level"
          stroke="#000054"
          fill="#000054"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ r: 3, fill: "#000054", strokeWidth: 0 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
                <p className="font-medium text-gray-900">{d.domain}</p>
                <p className="text-gray-500">Max level: {d.level} / 5</p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
