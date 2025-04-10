"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { usePredictionStore } from "@/store/prediction-store";

interface SensorInfo {
  station_id: number | string;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  elevation: number;
  alert: number;
  alarm: number;
  critical: number;
  available_params: string;
}

export default function D3Component({
  sensorInfo,
}: {
  sensorInfo: SensorInfo;
}) {
  const predictionStore = usePredictionStore((state) => state);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 600,
    height: 400,
  });

  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height: height || 400 });
      }
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    // Get prediction data from store
    const predictionData = predictionStore.getPredictionData();
    if (!predictionData) return;

    // Clear previous SVG
    d3.select(chartRef.current).select("svg").remove();

    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Combine previous and forecast data
    const previousData = predictionData.previous.waterlevels.map((level, i) => {
      const isAscending =
        i > 0 && level > predictionData.previous.waterlevels[i - 1];
      return {
        waterlevel: level,
        datetime: new Date(predictionData.previous.datetimes[i]),
        type: `previous water levels ${isAscending ? "🔼" : "🔽"}`,
      };
    });

    const forecastData = predictionData.forecast.waterlevels.map((level, i) => {
      const isAscending =
        i > 0 && level > predictionData.forecast.waterlevels[i - 1];
      return {
        waterlevel: level,
        datetime: new Date(predictionData.forecast.datetimes[i]),
        type: `forecast water levels ${isAscending ? "🔼" : "🔽"}`,
      };
    });

    const combinedData = [...previousData, ...forecastData];

    // X axis (time)
    const x = d3
      .scaleTime()
      .domain(d3.extent(combinedData, (d) => d.datetime) as [Date, Date])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M") as any))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add X axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Time");

    // Y axis (water level)
    const yExtent = d3.extent(combinedData, (d) => d.waterlevel) as [
      number,
      number
    ];
    const yPadding = Math.abs(yExtent[1] - yExtent[0]) * 0.1;

    // Calculate initial Y axis range based on data values with padding
    let minY = yExtent[0] - yPadding;
    let maxY = yExtent[1] + yPadding;

    // Check if any thresholds are within or close to the data range
    // and adjust min/max to include nearby thresholds
    const thresholds = [
      { value: sensorInfo.alert, color: "#FFD700", label: "Alert" },
      { value: sensorInfo.alarm, color: "#FFA500", label: "Alarm" },
      { value: sensorInfo.critical, color: "#FF0000", label: "Critical" },
    ];

    // Include thresholds that are within the padded range or very close to it
    const extraPadding = Math.abs(yExtent[1] - yExtent[0]) * 0.2; // Additional padding for near-range thresholds
    const extendedMinY = minY - extraPadding;
    const extendedMaxY = maxY + extraPadding;

    const visibleThresholds = thresholds.filter(
      (threshold) =>
        threshold.value >= extendedMinY && threshold.value <= extendedMaxY
    );

    // Update min/max if needed to include visible thresholds
    if (visibleThresholds.length > 0) {
      minY = Math.min(minY, ...visibleThresholds.map((t) => t.value));
      maxY = Math.max(maxY, ...visibleThresholds.map((t) => t.value));
    }

    const y = d3.scaleLinear().domain([minY, maxY]).range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    // Add Y axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .text("Water level (m)");

    // Only draw threshold lines that are in the visible range
    visibleThresholds.forEach((threshold) => {
      // Add threshold line
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", y(threshold.value))
        .attr("x2", width)
        .attr("y2", y(threshold.value))
        .attr("stroke", threshold.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3");

      // Add threshold label
      svg
        .append("text")
        .attr("x", 5)
        .attr("y", y(threshold.value))
        .attr("dy", "-0.5em")
        .attr("font-size", "10px")
        .attr("fill", threshold.color)
        .text(`${threshold.label} (${threshold.value}m)`);
    });

    // Add previous data line
    svg
      .append("path")
      .datum(previousData)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line<any>()
          .x((d) => x(d.datetime))
          .y((d) => y(d.waterlevel))
      );

    // Add forecast data line
    svg
      .append("path")
      .datum(forecastData)
      .attr("fill", "none")
      .attr("stroke", "#4169E1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr(
        "d",
        d3
          .line<any>()
          .x((d) => x(d.datetime))
          .y((d) => y(d.waterlevel))
      );

    // Add legend at the left side
    const legend = svg.append("g").attr("transform", `translate(10, 10)`);

    // Previous data legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 10)
      .attr("x2", 20)
      .attr("y2", 10)
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text(() => {
        const previousData =
          predictionStore.getPredictionData()?.previous.waterlevels || [];
        if (previousData.length > 1) {
          // Check if the trend is ascending or descending
          const firstValue = previousData[0];
          const lastValue = previousData[previousData.length - 1];
          return `Previous water levels ${
            firstValue <= lastValue ? "📈" : "📉"
          }`;
        }
        return "Previous";
      })
      .style("font-size", "12px");

    // Forecast data legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 20)
      .attr("y2", 30)
      .attr("stroke", "#4169E1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 35)
      .text(() => {
        const forecastData =
          predictionStore.getPredictionData()?.forecast.waterlevels || [];
        if (forecastData.length > 1) {
          // Check if the trend is ascending or descending
          const firstValue = forecastData[0];
          const lastValue = forecastData[forecastData.length - 1];
          return `Forecast water levels ${
            firstValue <= lastValue ? "📈" : "📉"
          }`;
        }
        return "Forecast";
      })
      .style("font-size", "12px");
  }, [dimensions, predictionStore]);

  return (
    <div ref={chartRef} className="w-full h-full" style={{ height: "100%" }} />
  );
}
