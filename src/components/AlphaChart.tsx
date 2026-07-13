import React, { useState } from 'react';
import { AlphaChartProps } from '../types';

export const AlphaChart: React.FC<AlphaChartProps> = ({
  id,
  type,
  data,
  height = 200,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG parameters
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const width = 500; // viewbox coordinates
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Max value calculation
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 10) * 1.1;

  // Coordinate mappers
  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + graphWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    return paddingTop + graphHeight - (val / maxVal) * graphHeight;
  };

  const renderLineChart = () => {
    // Generate Path points
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    
    // Gradient fill area
    const areaPoints = [
      `${getX(0)},${getY(0)}`,
      ...data.map((d, i) => `${getX(i)},${getY(d.value)}`),
      `${getX(data.length - 1)},${getY(0)}`
    ].join(' ');

    return (
      <g>
        {/* Fill Gradient Area under line */}
        <polygon
          points={areaPoints}
          fill="url(#chartGradient)"
          opacity="0.3"
        />

        {/* Glow behind the main line */}
        <polyline
          points={points}
          fill="none"
          stroke="#E94560"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="blur-[4px]"
          opacity="0.6"
        />

        {/* Crisp front line */}
        <polyline
          points={points}
          fill="none"
          stroke="#E94560"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interaction nodes */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.value)}
              r={hoveredIndex === i ? 7 : 4}
              fill={hoveredIndex === i ? '#FFD700' : '#E94560'}
              stroke="#0F0F1A"
              strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-all duration-150"
            />
            {hoveredIndex === i && (
              <g>
                <rect
                  x={getX(i) - 45}
                  y={getY(d.value) - 36}
                  width="90"
                  height="26"
                  rx="6"
                  fill="#16213E"
                  stroke="#FFD700"
                  strokeWidth="1"
                />
                <text
                  x={getX(i)}
                  y={getY(d.value) - 19}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="font-mono text-[10px] font-bold"
                >
                  {d.value} points
                </text>
              </g>
            )}
          </g>
        ))}
      </g>
    );
  };

  const renderBarChart = () => {
    const barWidth = Math.max(8, (graphWidth / data.length) * 0.5);

    return (
      <g>
        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * graphHeight;
          const x = getX(i) - barWidth / 2;
          const y = getY(d.value);

          return (
            <g 
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Backglow bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={hoveredIndex === i ? '#FFD700' : '#E94560'}
                opacity={hoveredIndex === i ? '0.4' : '0.15'}
                className="blur-[2px] transition-all duration-200"
              />
              {/* Crisp front bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={hoveredIndex === i ? '#FFD700' : 'url(#barGradient)'}
                className="transition-all duration-200"
              />
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={getX(i) - 45}
                    y={y - 36}
                    width="90"
                    height="26"
                    rx="6"
                    fill="#16213E"
                    stroke="#FFD700"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(i)}
                    y={y - 19}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="font-mono text-[10px] font-bold"
                  >
                    {d.value} pts
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  const renderRadarChart = () => {
    // Generate simple radar layout
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(graphWidth, graphHeight) / 2.2;
    const angles = data.map((_, i) => (i * 2 * Math.PI) / data.length);

    // Calculate radar vertices based on values
    const getRadarPoint = (angle: number, val: number) => {
      const distance = (val / maxVal) * radius;
      return {
        x: center.x + distance * Math.cos(angle - Math.PI / 2),
        y: center.y + distance * Math.sin(angle - Math.PI / 2),
      };
    };

    const radarPoints = data.map((d, i) => {
      const p = getRadarPoint(angles[i], d.value);
      return `${p.x},${p.y}`;
    }).join(' ');

    const outerPoints = data.map((_, i) => {
      const p = getRadarPoint(angles[i], maxVal * 0.9);
      return `${p.x},${p.y}`;
    }).join(' ');

    return (
      <g>
        {/* Radar concentric grids */}
        {[0.3, 0.6, 0.9].map((scale, sIdx) => {
          const gridPoints = data.map((_, i) => {
            const p = getRadarPoint(angles[i], maxVal * scale);
            return `${p.x},${p.y}`;
          }).join(' ');

          return (
            <polygon
              key={sIdx}
              points={gridPoints}
              fill="none"
              stroke="#5A5A5A"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Axes lines */}
        {data.map((_, i) => {
          const p = getRadarPoint(angles[i], maxVal * 0.95);
          return (
            <line
              key={i}
              x1={center.x}
              y1={center.y}
              x2={p.x}
              y2={p.y}
              stroke="#1A1A2E"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Colored radar polygon */}
        <polygon
          points={radarPoints}
          fill="url(#radarGradient)"
          stroke="#E94560"
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* Radar vertices and labels */}
        {data.map((d, i) => {
          const p = getRadarPoint(angles[i], d.value);
          const textPos = getRadarPoint(angles[i], maxVal * 1.1);

          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#FFD700"
                stroke="#0F0F1A"
                strokeWidth="1.5"
              />
              <text
                x={textPos.x}
                y={textPos.y + 4}
                textAnchor="middle"
                fill="#8E8E93"
                className="font-headline text-[9px] font-bold uppercase tracking-widest"
              >
                {d.label} ({d.value})
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div id={id} className={`w-full ${className}`}>
      <div className="relative w-full bg-[#16213E]/40 border border-[#1A1A2E]/50 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          {/* Defs for gradients and glow */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E94560" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E94560" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E94560" />
              <stop offset="100%" stopColor="#1A1A2E" />
            </linearGradient>

            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E94560" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grids and Axes for Cartesian Charts (Line / Bar) */}
          {type !== 'radar' && (
            <g>
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + graphHeight * ratio;
                const valueLabel = Math.round(maxVal * (1 - ratio));

                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#16213E"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#5A5A5A"
                      className="font-mono text-[9px]"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels */}
              {data.map((d, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fill="#8E8E93"
                  className="font-headline text-[9px] font-bold uppercase tracking-wider"
                >
                  {d.label}
                </text>
              ))}
            </g>
          )}

          {/* Core Chart Renderers */}
          {type === 'line' && renderLineChart()}
          {type === 'bar' && renderBarChart()}
          {type === 'radar' && renderRadarChart()}
        </svg>
      </div>
    </div>
  );
};

export const reactChartCode = `import React from 'react';

interface AlphaChartProps {
  type: 'line' | 'bar' | 'radar';
  data: { label: string; value: number }[];
  height?: number;
}

export const AlphaChart: React.FC<AlphaChartProps> = ({ type, data, height = 200 }) => {
  // Ultra clean modular SVG visual rendering of charts
  return (
    <div className="bg-[#16213E] p-4 rounded-2xl border border-[#1A1A2E]">
      <svg viewBox="0 0 500 200" className="w-full h-auto">
        <text x="250" y="100" textAnchor="middle" fill="#8E8E93" className="font-headline text-xs uppercase tracking-widest">
          SVG Chart: {type.toUpperCase()}
        </text>
        {/* Render paths & grid based on values */}
      </svg>
    </div>
  );
};`;

export const reactNativeChartCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';

interface AlphaChartProps {
  type: 'line' | 'bar';
  data: { label: string; value: number }[];
}

export const AlphaChart: React.FC<AlphaChartProps> = ({ type, data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alpha Analytics - {type.toUpperCase()}</Text>
      <Svg width="100%" height={180} style={{ marginVertical: 8 }}>
        <Rect width="100%" height="100%" fill="#16213E" rx={16} />
        {/* High performance SVG charts on React Native */}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#16213E', borderRadius: 16, padding: 16 },
  title: { color: '#8E8E93', fontFamily: 'Montserrat-Bold', fontSize: 11, textTransform: 'uppercase' },
});`;
