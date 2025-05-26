"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVCFundStore } from "@/lib/store";
import { toast } from "sonner";
import { Copy, Share2, Save, FileDown, FileUp, Download } from "lucide-react";

export function ShareDialog() {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { exportParameters, importParameters } = useVCFundStore();

  const generateShareUrl = () => {
    try {
      const params = exportParameters();
      const url = `${window.location.origin}${window.location.pathname}?params=${params}`;
      setShareUrl(url);
      return url;
    } catch (error) {
      console.error("Error generating share URL:", error);
      toast.error("Failed to generate share URL");
      return "";
    }
  };

  const handleOpen = () => {
    generateShareUrl();
    setOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleOpen}
        >
          <Share2 className="h-4 w-4" />
          <span>Share Parameters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Simulation Parameters</DialogTitle>
          <DialogDescription>
            Share this URL to allow others to run the same simulation with your
            exact parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-2">
          <div className="grid flex-1 gap-2">
            <Input value={shareUrl} readOnly className="w-full" />
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="text-sm text-muted-foreground mt-2">
            Anyone with this link can view and run your simulation with the exact
            same parameters.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LoadSharedParameters() {
  const { importParameters } = useVCFundStore();

  const loadFromUrl = () => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const params = url.searchParams.get("params");

        if (params) {
          const success = importParameters(params);
          if (success) {
            toast.success("Successfully loaded shared parameters");
            // Remove params from URL without reloading
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } else {
            toast.error("Failed to load shared parameters");
          }
        }
      }
    } catch (error) {
      console.error("Error loading shared parameters:", error);
    }
  };

  // Load parameters on mount
  if (typeof window !== "undefined") {
    // Run once after the component mounts
    useState(() => {
      loadFromUrl();
    });
  }

  return null;
}

export function SaveSimulationResults({
  resultsRef,
}: {
  resultsRef: React.RefObject<HTMLDivElement>;
}) {
  const {
    exportParameters,
    isPortfolioMode,
    simulationResults,
    portfolioSimulationResults,
  } = useVCFundStore();
  const results = isPortfolioMode ? portfolioSimulationResults : simulationResults;

  const saveAsImage = async () => {
    if (!resultsRef.current || !results) {
      toast.error("No simulation results to save");
      return;
    }

    try {
      toast.info("Preparing image, please wait...");
      
      // Dynamically load html2canvas library
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      html2canvasScript.async = true;
      
      html2canvasScript.onload = async () => {
        try {
          // We need to access the html2canvas function
          const html2canvas = (window as any).html2canvas;
          
          if (!html2canvas) {
            throw new Error("Failed to load html2canvas library");
          }
          
          // Get computed styles to preserve them in the canvas
          const element = resultsRef.current!;
          const computedStyle = window.getComputedStyle(element);
          
          // Create a clone to avoid modifying the original
          const clone = element.cloneNode(true) as HTMLElement;
          clone.style.backgroundColor = '#ffffff';
          clone.style.padding = '20px';
          clone.style.borderRadius = '0';
          clone.style.position = 'absolute';
          clone.style.left = '-9999px';
          clone.style.width = `${element.offsetWidth}px`;
          
          // Append to body to render it
          document.body.appendChild(clone);
          
          // Capture all images in the clone and mark them as crossOrigin='anonymous'
          const images = clone.querySelectorAll('img');
          images.forEach(img => {
            img.crossOrigin = 'anonymous';
            // Replace image URLs with data URLs if possible
            if (img.complete && img.naturalWidth > 0) {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  const dataURL = canvas.toDataURL('image/png');
                  img.src = dataURL;
                }
              } catch (e) {
                console.warn('Could not convert image to data URL', e);
              }
            }
          });
          
          // Use html2canvas with proper configuration
          const canvas = await html2canvas(clone, {
            backgroundColor: '#ffffff',
            allowTaint: true,
            useCORS: true,
            scale: 2, // Higher quality
            logging: false,
            onclone: (clonedDoc) => {
              // Additional opportunity to modify the cloned document
              const clonedElement = clonedDoc.getElementById(clone.id);
              if (clonedElement) {
                clonedElement.style.display = 'block';
                clonedElement.style.position = 'relative';
              }
            }
          });
          
          // Clean up
          document.body.removeChild(clone);
          
          // Get data URL and trigger download
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `srv-simulation-${new Date().toISOString().split('T')[0]}.png`;
          link.href = dataUrl;
          link.click();
          
          toast.success('Image saved successfully');
        } catch (error) {
          console.error("Failed to generate image:", error);
          toast.error("Failed to save image. Using fallback method...");
          
          // Use a fallback method - print the div
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            toast.error("Pop-up blocked. Please allow pop-ups and try again.");
            return;
          }
          
          printWindow.document.write(`
            <html>
              <head>
                <title>SRV Simulation Results</title>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; }
                  .container { max-width: 1000px; margin: 0 auto; }
                </style>
              </head>
              <body>
                <div class="container">
                  ${resultsRef.current!.innerHTML}
                </div>
                <script>
                  window.onload = function() { window.print(); }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      };
      
      html2canvasScript.onerror = () => {
        toast.error("Failed to load image generation library. Using fallback method...");
        window.print();
      };
      
      document.head.appendChild(html2canvasScript);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
    }
  };

  const saveAsJSON = () => {
    if (!results) {
      toast.error("No simulation results to save");
      return;
    }

    try {
      // Create an export object with both parameters and results
      const exportData = {
        parameters: JSON.parse(atob(exportParameters())),
        results: results,
        timestamp: new Date().toISOString(),
        mode: isPortfolioMode ? "portfolio" : "standard",
      };

      // Convert to JSON string
      const jsonStr = JSON.stringify(exportData, null, 2);

      // Create a blob and download
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `srv-simulation-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);

      toast.success("Simulation results saved as JSON");
    } catch (error) {
      console.error("Error saving results as JSON:", error);
      toast.error("Failed to save results as JSON");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={saveAsImage}
        disabled={!results}
      >
        <Download className="h-4 w-4" />
        Save as Image
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={saveAsJSON}
        disabled={!results}
      >
        <Save className="h-4 w-4" />
        Save Results
      </Button>
    </div>
  );
}
