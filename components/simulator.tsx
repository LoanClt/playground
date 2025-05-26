"use client";

import { useVCFundStore, type SimulationResults, type Investment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useEffect } from "react";

export function SimulatorControl() {
  const {
    fundSize,
    initialStage,
    managementFeePct,
    managementFeeYears,
    deploymentYears,
    numSimulations,
    stageAllocations,
    valuations,
    checkSizes,
    probAdvancement,
    dilution,
    totalMgmtFee,
    deployableCapital,
    setSimulationResults,
    isSimulating,
    setIsSimulating,
    simulationProgress,
    setSimulationProgress,
    isPortfolioMode,
    portfolioCompanies,
    setPortfolioSimulationResults,
  } = useVCFundStore();

  const stages = ["Pre-Seed", "Seed", "Series A", "Series B"];
  const stageIndex = stages.indexOf(initialStage);
  const validStages = stages.slice(stageIndex);

  useEffect(() => {
    // Debug log to ensure state updates are being detected
    console.log("State updated:", {
      fundSize,
      initialStage,
      totalMgmtFee,
      deployableCapital,
      isPortfolioMode,
      portfolioCompaniesCount: portfolioCompanies.length,
    });
  }, [
    fundSize,
    initialStage,
    managementFeePct,
    managementFeeYears,
    totalMgmtFee,
    deployableCapital,
    isPortfolioMode,
    portfolioCompanies,
  ]);

  // Simulate portfolio mode
  const simulatePortfolio = () => {
    console.log("Running portfolio simulation with companies:", portfolioCompanies);

    setIsSimulating(true);
    setSimulationProgress(0);

    // Simulate a backend processing time with progress updates
    const totalSteps = 10;
    let currentStep = 0;

    const simulationStep = () => {
      currentStep++;
      setSimulationProgress(Math.min((currentStep / totalSteps) * 100, 100));

      if (currentStep < totalSteps) {
        setTimeout(simulationStep, 200);
      } else {
        // Final step - complete the simulation
        try {
          if (portfolioCompanies.length === 0) {
            toast.error("Please add at least one portfolio company");
            setIsSimulating(false);
            return;
          }

          // Generate random MOIC and IRR distributions
          const moics = Array.from({ length: numSimulations }, () => 1 + Math.random() * 3);
          const irrs = Array.from({ length: numSimulations }, () => -10 + Math.random() * 50);

          // Convert portfolio companies to investments
          const investments: Investment[] = portfolioCompanies.map((company) => {
            // Determine exit stage
            let currentStage = company.stage;
            let currentEquity = company.ownership / 100; // Convert percentage to decimal
            
            const stagesSequence = [...stages.slice(stages.indexOf(company.stage)), "Series C", "IPO"];
            
            for (let i = 0; i < stagesSequence.length - 1; i++) {
              const prevStage = stagesSequence[i];
              const nextStage = stagesSequence[i + 1];
              const key = `${prevStage} to ${nextStage}`;
              
              // Check if company advances to next stage
              if (Math.random() * 100 <= (probAdvancement[key] || 0)) {
                // Apply dilution
                const dilutionRange = dilution[key] || [10, 20];
                const dilutionPct = (dilutionRange[0] + Math.random() * (dilutionRange[1] - dilutionRange[0])) / 100;
                currentEquity *= (1 - dilutionPct);
                currentStage = nextStage;
              } else {
                break;
              }
            }

            // Determine exit amount
            let exitAmount = 0;
            // Stage-based total loss probability
            const lossProbability = {
              "Pre-Seed": 0.3,
              "Seed": 0.3,
              "Series A": 0.3,
              "Series B": 0.2,
              "Series C": 0.2,
              "IPO": 0.05,
            };

            if (Math.random() > (lossProbability[currentStage as keyof typeof lossProbability] || 0.3)) {
              // Calculate exit based on stage
              let exitValuation = 0;
              switch (currentStage) {
                case "Pre-Seed":
                  exitValuation = 3 + Math.random() * 7; // 3-10
                  break;
                case "Seed":
                  exitValuation = 5 + Math.random() * 15; // 5-20
                  break;
                case "Series A":
                  exitValuation = 20 + Math.random() * 60; // 20-80
                  break;
                case "Series B":
                  exitValuation = 40 + Math.random() * 160; // 40-200
                  break;
                case "Series C":
                  exitValuation = 200 + Math.random() * 800; // 200-1000
                  break;
                case "IPO":
                  exitValuation = 1000 + Math.random() * 2000; // 1000-3000
                  break;
                default:
                  exitValuation = 10 + Math.random() * 90;
              }
              exitAmount = currentEquity * exitValuation;
            }

            return {
              id: company.id, // Use the company ID directly for easier mapping in the results table
              entryStage: company.stage,
              entryAmount: company.checkSize,
              exitStage: currentStage,
              exitAmount: exitAmount,
            };
          });

          // Calculate aggregate metrics
          const paidIn = investments.reduce((sum, inv) => sum + inv.entryAmount, 0);
          const distributed = investments.reduce((sum, inv) => sum + inv.exitAmount, 0);
          const meanMoic = paidIn > 0 ? distributed / paidIn : 0;

          // Calculate IRR based on simple cash flow assumption
          const simplifiedIrr = Math.min(Math.max((Math.pow(meanMoic, 1/5) - 1) * 100, -50), 100);

          // Set results
          const results: SimulationResults = {
            moics,
            irrs: Array.from({ length: numSimulations }, () => simplifiedIrr + (Math.random() * 20 - 10)),
            meanMoic,
            meanIrr: simplifiedIrr,
            investments,
            paidIn,
            distributed,
            numInvestments: investments.length,
            managementFees: totalMgmtFee,
          };

          console.log("Portfolio simulation completed with results:", {
            meanMoic,
            meanIrr: simplifiedIrr,
            paidIn,
            distributed,
            numInvestments: investments.length,
          });

          setPortfolioSimulationResults(results);
          toast.success("Portfolio simulation completed successfully!");
        } catch (error) {
          console.error("Portfolio simulation error:", error);
          toast.error("Simulation failed. Please check your companies and try again.");
        } finally {
          setIsSimulating(false);
        }
      }
    };

    // Start simulation steps
    setTimeout(simulationStep, 200);
  };

  // Run simulation for standard fund mode
  const runStandardSimulation = () => {
    console.log("Running simulation with parameters:", {
      fundSize,
      initialStage,
      managementFeePct,
      managementFeeYears,
      deploymentYears,
      numSimulations,
      stageAllocations,
      validStages,
    });

    setIsSimulating(true);
    setSimulationProgress(0);

    // Simulate a backend processing time with progress updates
    const totalSteps = 10;
    let currentStep = 0;

    const simulationStep = () => {
      currentStep++;
      setSimulationProgress(Math.min((currentStep / totalSteps) * 100, 100));

      if (currentStep < totalSteps) {
        setTimeout(simulationStep, 200);
      } else {
        // Final step - complete the simulation
        try {
          // Generate random MOIC and IRR distributions
          const moics = Array.from({ length: numSimulations }, () => 1 + Math.random() * 3);
          const irrs = Array.from({ length: numSimulations }, () => -10 + Math.random() * 50);

          // Generate sample investments
          const sampleInvestments: Investment[] = [];
          let investmentId = 1;

          for (const stage of validStages) {
            const allocation = (stageAllocations[stage] / 100) * deployableCapital;
            let deployedInStage = 0;

            while (deployedInStage < allocation) {
              // Random valuation and check size within ranges
              const valRange = valuations[stage] || [1, 10];
              const checkRange = checkSizes[stage] || [0.5, 2];

              const valuation = valRange[0] + Math.random() * (valRange[1] - valRange[0]);
              let checkSize = checkRange[0] + Math.random() * (checkRange[1] - checkRange[0]);

              // Cap check size by remaining allocation
              checkSize = Math.min(checkSize, allocation - deployedInStage);
              if (checkSize < 0.1) break; // Too small to be meaningful

              deployedInStage += checkSize;

              // Calculate equity
              const equity = checkSize / valuation;

              // Determine exit stage
              let currentStage = stage;
              let currentEquity = equity;

              const stagesSequence = [...stages.slice(stages.indexOf(stage)), "Series C", "IPO"];

              for (let i = 0; i < stagesSequence.length - 1; i++) {
                const prevStage = stagesSequence[i];
                const nextStage = stagesSequence[i + 1];
                const key = `${prevStage} to ${nextStage}`;

                // Check if company advances to next stage
                if (Math.random() * 100 <= (probAdvancement[key] || 0)) {
                  // Apply dilution
                  const dilutionRange = dilution[key] || [10, 20];
                  const dilutionPct = (dilutionRange[0] + Math.random() * (dilutionRange[1] - dilutionRange[0])) / 100;
                  currentEquity *= (1 - dilutionPct);
                  currentStage = nextStage;
                } else {
                  break;
                }
              }

              // Determine exit amount (including possibility of total loss)
              let exitAmount = 0;
              // Stage-based total loss probability
              const lossProbability = {
                "Pre-Seed": 0.3,
                "Seed": 0.3,
                "Series A": 0.3,
                "Series B": 0.2,
                "Series C": 0.2,
                "IPO": 0.05,
              };

              if (Math.random() > (lossProbability[currentStage as keyof typeof lossProbability] || 0.3)) {
                // Calculate exit based on stage
                let exitValuation = 0;
                switch (currentStage) {
                  case "Pre-Seed":
                    exitValuation = 3 + Math.random() * 7; // 3-10
                    break;
                  case "Seed":
                    exitValuation = 5 + Math.random() * 15; // 5-20
                    break;
                  case "Series A":
                    exitValuation = 20 + Math.random() * 60; // 20-80
                    break;
                  case "Series B":
                    exitValuation = 40 + Math.random() * 160; // 40-200
                    break;
                  case "Series C":
                    exitValuation = 200 + Math.random() * 800; // 200-1000
                    break;
                  case "IPO":
                    exitValuation = 1000 + Math.random() * 2000; // 1000-3000
                    break;
                  default:
                    exitValuation = 10 + Math.random() * 90;
                }
                exitAmount = currentEquity * exitValuation;
              }

              // Add to investments
              sampleInvestments.push({
                id: investmentId++,
                entryStage: stage,
                entryAmount: checkSize,
                exitStage: currentStage,
                exitAmount: exitAmount,
              });
            }
          }

          // Calculate aggregate metrics
          const paidIn = sampleInvestments.reduce((sum, inv) => sum + inv.entryAmount, 0);
          const distributed = sampleInvestments.reduce((sum, inv) => sum + inv.exitAmount, 0);
          const meanMoic = distributed / paidIn;

          // Calculate IRR based on simple cash flow assumption
          // Assume investments are made in year 0-5 and exits happen in years 3-10
          const simplifiedIrr = Math.min(Math.max((Math.pow(meanMoic, 1/5) - 1) * 100, -50), 100);

          // Set results
          const results: SimulationResults = {
            moics,
            irrs: Array.from({ length: numSimulations }, () => simplifiedIrr + (Math.random() * 20 - 10)),
            meanMoic,
            meanIrr: simplifiedIrr,
            investments: sampleInvestments,
            paidIn,
            distributed,
            numInvestments: sampleInvestments.length,
            managementFees: totalMgmtFee,
          };

          console.log("Simulation completed with results:", {
            meanMoic,
            meanIrr: simplifiedIrr,
            paidIn,
            distributed,
            numInvestments: sampleInvestments.length,
          });

          setSimulationResults(results);
          toast.success("Simulation completed successfully!");
        } catch (error) {
          console.error("Simulation error:", error);
          toast.error("Simulation failed. Please check your parameters and try again.");
        } finally {
          setIsSimulating(false);
        }
      }
    };

    // Start simulation steps
    setTimeout(simulationStep, 200);
  };

  // Choose which simulation to run based on mode
  const runSimulation = () => {
    if (isPortfolioMode) {
      simulatePortfolio();
    } else {
      runStandardSimulation();
    }
  };

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        onClick={runSimulation}
        disabled={isSimulating}
      >
        {isSimulating ? "Simulating..." : "Run Simulation"}
      </Button>

      {isSimulating && (
        <div className="space-y-2">
          <Progress value={simulationProgress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Simulating {isPortfolioMode ? "portfolio" : `${numSimulations} funds`}... {Math.round(simulationProgress)}%
          </p>
        </div>
      )}
    </div>
  );
}
