"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import moment from "moment";

const ScoreTrendChart = ({ data }) => {
  const trend = data || [];

  const width = 500;
  const height = 200;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getY = (val) => {
    const clamped = Math.min(10, Math.max(0, Number(val) || 0));
    return paddingTop + ((10 - clamped) / 10) * chartHeight;
  };

  const getX = (idx, total) => {
    if (total <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (total - 1)) * chartWidth;
  };

  const points = trend.map((item, idx) => ({
    x: getX(idx, trend.length),
    y: getY(item.score),
    score: item.score,
    role: item.jobPosition,
    date: item.createdAt ? moment(item.createdAt).format("MMM D") : "",
    type: item.type,
  }));

  const pathD =
    points.length > 1
      ? points.reduce(
          (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
          ""
        )
      : "";

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : "";

  const yTicks = [10, 7.5, 5, 2.5, 0];

  return (
    <Card className="border border-border/60 bg-card shadow-sm rounded-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Score Trend
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            Scale: 0 – 10
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Average performance score across chronological interview sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        {trend.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg">
            <p className="text-sm font-medium text-foreground">No scored interviews yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Complete an interview session with recorded answers to see your score trajectory.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Score trend chart showing average scores from 0 to 10"
            >
              <title>Interview Score Trend</title>

              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and Y labels */}
              {yTicks.map((val) => {
                const y = getY(val);
                return (
                  <g key={val} className="text-muted-foreground/40">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={paddingLeft + chartWidth}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray={val === 0 ? "" : "3 3"}
                      strokeWidth={val === 0 ? "1.5" : "1"}
                    />
                    <text
                      x={paddingLeft - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-muted-foreground text-[10px] font-medium"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area gradient under line */}
              {areaD && <path d={areaD} fill="url(#scoreAreaGradient)" />}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={points.length === 1 ? "6" : "4.5"}
                    className="fill-background stroke-primary"
                    strokeWidth="2.5"
                  />
                  {/* Score label above point */}
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-bold"
                  >
                    {pt.score}
                  </text>
                  {/* Date label along X axis */}
                  {pt.date && (
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 16}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[9px] font-medium"
                    >
                      {pt.date}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {trend.length === 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40">
                <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Complete 1 more interview to see your improvement trend line.</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreTrendChart;
