import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { spacing, typography } from '../theme/tokens';

type ChartSeries = {
  id: string;
  label: string;
  color: string;
  totalLabel: string;
  values: number[];
};

type InsightsLineChartProps = {
  labels: string[];
  series: ChartSeries[];
};

type Point = {
  x: number;
  y: number;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 196;
const PADDING_X = 16;
const TOP_PADDING = 18;
const BOTTOM_PADDING = 46;

function getSmoothLinePath(points: Point[]) {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

function buildAreaPath(points: Point[], baseline: number) {
  if (points.length === 0) {
    return '';
  }

  const linePath = getSmoothLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

export function InsightsLineChart({ labels, series }: InsightsLineChartProps) {
  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 1);
  const chartBottom = CHART_HEIGHT - BOTTOM_PADDING;
  const innerWidth = CHART_WIDTH - PADDING_X * 2;
  const innerHeight = chartBottom - TOP_PADDING;
  const hasSinglePoint = labels.length <= 1;

  const seriesPoints = series.map((item) => ({
    ...item,
    points: item.values.map((value, index) => {
      const x = hasSinglePoint ? CHART_WIDTH / 2 : PADDING_X + (innerWidth / (labels.length - 1)) * index;
      const y = chartBottom - (value / maxValue) * innerHeight;
      return { x, y };
    }),
  }));

  return (
    <View>
      <View style={styles.chartWrap}>
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <Defs>
            <LinearGradient id="chart-shell" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </LinearGradient>
            {series.map((item) => (
              <LinearGradient key={item.id} id={`fill-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={item.color} stopOpacity="0.34" />
                <Stop offset="100%" stopColor={item.color} stopOpacity="0.03" />
              </LinearGradient>
            ))}
          </Defs>

          <Rect
            x={0}
            y={0}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            rx={24}
            fill="url(#chart-shell)"
          />

          {[0.25, 0.5, 0.75].map((step) => {
            const y = TOP_PADDING + innerHeight * step;
            return (
              <Line
                key={`horizontal-${step}`}
                x1={PADDING_X}
                y1={y}
                x2={CHART_WIDTH - PADDING_X}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
            );
          })}

          {labels.map((_, index) => {
            const x = hasSinglePoint ? CHART_WIDTH / 2 : PADDING_X + (innerWidth / (labels.length - 1)) * index;
            return (
              <Line
                key={`grid-${index}`}
                x1={x}
                y1={TOP_PADDING}
                x2={x}
                y2={chartBottom}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1}
              />
            );
          })}

          <Line
            x1={PADDING_X}
            y1={chartBottom}
            x2={CHART_WIDTH - PADDING_X}
            y2={chartBottom}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.2}
          />

          {seriesPoints.map((item) => (
            <Path
              key={`area-${item.id}`}
              d={buildAreaPath(item.points, chartBottom)}
              fill={`url(#fill-${item.id})`}
            />
          ))}

          {seriesPoints.map((item) => (
            <Path
              key={`line-${item.id}`}
              d={getSmoothLinePath(item.points)}
              fill="none"
              stroke={item.color}
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {seriesPoints.map((item) =>
            item.points.map((point, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                <Circle cx={point.x} cy={point.y} r={7} fill={item.color} fillOpacity={0.18} />
                <Circle cx={point.x} cy={point.y} r={3.6} fill={item.color} />
              </React.Fragment>
            ))
          )}
        </Svg>

        <View style={styles.axisRow}>
          {labels.map((label) => (
            <Text key={label} style={styles.axisLabel}>
              {label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.legendWrap}>
        {series.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendCopy}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>{item.totalLabel}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    borderRadius: 24,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  axisRow: {
    marginTop: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  axisLabel: {
    fontSize: typography.caption,
    color: 'rgba(248, 251, 255, 0.86)',
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  legendWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  legendCopy: {
    gap: 2,
  },
  legendLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#f8fbff',
    fontWeight: '700',
  },
  legendValue: {
    fontSize: 13,
    lineHeight: 16,
    color: 'rgba(248, 251, 255, 0.8)',
    fontWeight: '800',
  },
});
