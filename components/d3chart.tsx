"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Data {
  Country: string;
  Value: number;
}

export default function D3Component() {
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

    d3.csv<Data>(
      "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv",
      (d) => ({
        Country: d.Country,
        Value: +d.Value,
      })
    ).then((data) => {
      if (!data) return;

      // X axis
      const x = d3.scaleBand().range([0, width]).domain(data.map((d) => d.Country)).padding(0.2);
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Y axis
      const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.Value) || 13000]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Bars
      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.Country) ?? 0)
        .attr("y", (d) => y(d.Value) ?? 0)
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - (y(d.Value) ?? 0))
        .attr("fill", "#69b3a2");
    });
  }, [dimensions]);

  return <div ref={chartRef} className="w-full h-[400px]" />;
};
