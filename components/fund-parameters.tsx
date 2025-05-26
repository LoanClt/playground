"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVCFundStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function FundParameters() {
  const {
    fundSize,
    setFundSize,
    initialStage,
    setInitialStage,
    managementFeePct,
    setManagementFeePct,
    managementFeeYears,
    setManagementFeeYears,
    deploymentYears,
    setDeploymentYears,
    numSimulations,
    setNumSimulations,
    totalMgmtFee,
    deployableCapital,
    setSimulationResults,
  } = useVCFundStore();

  const stages = ["Pre-Seed", "Seed", "Series A", "Series B"];

  // Reset simulation results when parameters change
  useEffect(() => {
    setSimulationResults(null);
    console.log("Parameters updated:", {
      fundSize,
      managementFeePct,
      managementFeeYears,
      totalMgmtFee,
      deployableCapital,
    });
  }, [
    fundSize,
    initialStage,
    managementFeePct,
    managementFeeYears,
    deploymentYears,
    numSimulations,
    setSimulationResults,
    totalMgmtFee,
    deployableCapital,
  ]);

  const handleFundSizeChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 500) {
      setFundSize(numValue);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fund Parameters</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fund Size ($MM)</label>
        <Input
          type="number"
          min={1}
          max={500}
          value={fundSize}
          onChange={(e) => handleFundSizeChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Initial Investment Stage</label>
        <Select value={initialStage} onValueChange={setInitialStage}>
          <SelectTrigger>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">Annual Management Fee</label>
          <span className="text-sm font-medium">{managementFeePct.toFixed(1)}%</span>
        </div>
        <Slider
          value={managementFeePct ? [managementFeePct] : [0]}
          min={0}
          max={5}
          step={0.1}
          onValueChange={(values) => {
            if (values.length > 0) {
              console.log("Setting management fee:", values[0]);
              setManagementFeePct(values[0]);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">Management Fee Years</label>
          <span className="text-sm font-medium">{managementFeeYears}</span>
        </div>
        <Slider
          value={[managementFeeYears]}
          min={1}
          max={10}
          step={1}
          onValueChange={(values) => {
            if (values.length > 0) {
              console.log("Setting management fee years:", values[0]);
              setManagementFeeYears(values[0]);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">Deployment Years</label>
          <span className="text-sm font-medium">{deploymentYears}</span>
        </div>
        <Slider
          value={[deploymentYears]}
          min={1}
          max={10}
          step={1}
          onValueChange={(values) => {
            if (values.length > 0) {
              console.log("Setting deployment years:", values[0]);
              setDeploymentYears(values[0]);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">Number of Simulations</label>
          <span className="text-sm font-medium">{numSimulations}</span>
        </div>
        <Slider
          value={[numSimulations]}
          min={1}
          max={1000}
          step={10}
          onValueChange={(values) => {
            if (values.length > 0) {
              console.log("Setting number of simulations:", values[0]);
              setNumSimulations(values[0]);
            }
          }}
        />
      </div>

      <div className="mt-6 p-3 bg-muted rounded-md">
        <div className="flex justify-between text-sm">
          <span>Total Management Fee:</span>
          <span className="font-medium">${totalMgmtFee.toFixed(2)}MM</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Deployable Capital:</span>
          <span className="font-medium">${deployableCapital.toFixed(2)}MM</span>
        </div>
      </div>
    </div>
  );
}
