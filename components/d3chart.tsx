"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { usePredictionStore } from "@/store/prediction-store";

interface Data {
  Country: string;
  Value: number;
}

export default function D3Component() {
  const predictionStore = usePredictionStore((state) => state);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
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
    const previousData = predictionData.previous.waterlevels.map((level, i) => ({
      waterlevel: level,
      datetime: new Date(predictionData.previous.datetimes[i]),
      type: "previous"
    }));
    
    const forecastData = predictionData.forecast.waterlevels.map((level, i) => ({
      waterlevel: level,
      datetime: new Date(predictionData.forecast.datetimes[i]),
      type: "forecast"
    }));
    
    const combinedData = [...previousData, ...forecastData];
    
    // X axis (time)
    const x = d3.scaleTime()
      .domain(d3.extent(combinedData, d => d.datetime) as [Date, Date])
      .range([0, width]);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%H:%M") as any))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
    
    // Add X axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Time");
    
    // Y axis (water level)
    const yExtent = d3.extent(combinedData, d => d.waterlevel) as [number, number];
    const yPadding = Math.abs(yExtent[1] - yExtent[0]) * 0.1;
    
    const y = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0]);
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add Y axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .text("Water Level (m)");
    
    // Create line generator
    const line = d3.line<any>()
      .x(d => x(d.datetime))
      .y(d => y(d.waterlevel));
    
    // Add previous data line
    svg.append("path")
      .datum(previousData)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add forecast data line
    svg.append("path")
      .datum(forecastData)
      .attr("fill", "none")
      .attr("stroke", "#4169E1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", line);
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 0)`);
    
    // Previous data legend
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 10)
      .attr("x2", 20)
      .attr("y2", 10)
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text("Previous")
      .style("font-size", "12px");
    
    // Forecast data legend
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 20)
      .attr("y2", 30)
      .attr("stroke", "#4169E1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 35)
      .text("Forecast")
      .style("font-size", "12px");
    
  }, [dimensions, predictionStore]);

  return <div ref={chartRef} className="w-full h-full" style={{ height: "100%" }} />;
};
