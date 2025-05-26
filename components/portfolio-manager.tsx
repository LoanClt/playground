"use client";

import { useState } from "react";
import { useVCFundStore, type PortfolioCompany } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Edit, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge"; 
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

// Stage badge variants - more subtle colors
export const getStageBadgeVariant = (stage: string) => {
  switch (stage) {
    case "Pre-Seed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Seed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Series A":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Series B":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "Series C":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <Badge className={`font-medium ${getStageBadgeVariant(stage)}`}>
      {stage}
    </Badge>
  );
}

export function PortfolioManager() {
  const { 
    portfolioCompanies, 
    addPortfolioCompany, 
    removePortfolioCompany, 
    updatePortfolioCompany 
  } = useVCFundStore();
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState<Omit<PortfolioCompany, 'id'>>({
    name: "",
    stage: "Seed",
    valuation: 10,
    checkSize: 1,
    ownership: 10,
    entryDate: new Date()
  });
  
  const [editCompany, setEditCompany] = useState<PortfolioCompany | null>(null);
  
  const stages = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C"];
  
  const handleAddCompany = () => {
    if (!newCompany.name) {
      toast.error("Please enter a company name");
      return;
    }
    
    if (newCompany.valuation <= 0) {
      toast.error("Valuation must be greater than 0");
      return;
    }
    
    if (newCompany.checkSize <= 0) {
      toast.error("Check size must be greater than 0");
      return;
    }
    
    if (newCompany.ownership <= 0 || newCompany.ownership > 100) {
      toast.error("Ownership percentage must be between 0 and 100");
      return;
    }
    
    addPortfolioCompany(newCompany);
    
    // Reset form
    setNewCompany({
      name: "",
      stage: "Seed",
      valuation: 10,
      checkSize: 1,
      ownership: 10,
      entryDate: new Date()
    });
    
    toast.success("Company added to portfolio");
  };
  
  const handleEditStart = (company: PortfolioCompany) => {
    setEditMode(company.id);
    setEditCompany({ ...company });
  };
  
  const handleEditCancel = () => {
    setEditMode(null);
    setEditCompany(null);
  };
  
  const handleEditSave = () => {
    if (!editCompany) return;
    
    if (!editCompany.name) {
      toast.error("Please enter a company name");
      return;
    }
    
    if (editCompany.valuation <= 0) {
      toast.error("Valuation must be greater than 0");
      return;
    }
    
    if (editCompany.checkSize <= 0) {
      toast.error("Check size must be greater than 0");
      return;
    }
    
    if (editCompany.ownership <= 0 || editCompany.ownership > 100) {
      toast.error("Ownership percentage must be between 0 and 100");
      return;
    }
    
    updatePortfolioCompany(editCompany.id, {
      name: editCompany.name,
      stage: editCompany.stage,
      valuation: editCompany.valuation,
      checkSize: editCompany.checkSize,
      ownership: editCompany.ownership,
      entryDate: editCompany.entryDate
    });
    
    setEditMode(null);
    setEditCompany(null);
    
    toast.success("Company updated");
  };
  
  const handleRemoveCompany = (id: string) => {
    removePortfolioCompany(id);
    toast.success("Company removed from portfolio");
  };
  
  return (
    <div className="space-y-4">
      {/* Add new company form */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Add New Company</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <label htmlFor="company-name" className="text-xs font-medium block mb-1">
              Company Name
            </label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="company-stage" className="text-xs font-medium block mb-1">
              Stage
            </label>
            <Select
              value={newCompany.stage}
              onValueChange={(value) => setNewCompany({ ...newCompany, stage: value })}
            >
              <SelectTrigger id="company-stage">
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
          
          <div>
            <label htmlFor="company-valuation" className="text-xs font-medium block mb-1">
              Valuation ($MM)
            </label>
            <Input
              id="company-valuation"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Enter valuation"
              value={newCompany.valuation}
              onChange={(e) => setNewCompany({ ...newCompany, valuation: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <label htmlFor="company-check" className="text-xs font-medium block mb-1">
              Check Size ($MM)
            </label>
            <Input
              id="company-check"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Enter check size"
              value={newCompany.checkSize}
              onChange={(e) => setNewCompany({ ...newCompany, checkSize: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <label htmlFor="company-ownership" className="text-xs font-medium block mb-1">
              Ownership (%)
            </label>
            <Input
              id="company-ownership"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              placeholder="Enter ownership %"
              value={newCompany.ownership}
              onChange={(e) => setNewCompany({ ...newCompany, ownership: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAddCompany}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </Card>
      
      {/* Portfolio companies list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">
          Portfolio Companies ({portfolioCompanies.length})
        </h3>
        
        {portfolioCompanies.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-muted rounded-md">
            No companies in your portfolio yet.
          </div>
        ) : (
          <div className="space-y-2">
            {portfolioCompanies.map((company) => (
              <Card key={company.id} className="p-3">
                {editMode === company.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-xs font-medium block mb-1">
                          Company Name
                        </label>
                        <Input
                          placeholder="Enter company name"
                          value={editCompany?.name || ""}
                          onChange={(e) => 
                            setEditCompany(
                              editCompany ? { ...editCompany, name: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">
                          Stage
                        </label>
                        <Select
                          value={editCompany?.stage || "Seed"}
                          onValueChange={(value) => 
                            setEditCompany(
                              editCompany ? { ...editCompany, stage: value } : null
                            )
                          }
                        >
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
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">
                          Valuation ($MM)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Enter valuation"
                          value={editCompany?.valuation || 0}
                          onChange={(e) => 
                            setEditCompany(
                              editCompany 
                                ? { ...editCompany, valuation: parseFloat(e.target.value) || 0 } 
                                : null
                            )
                          }
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">
                          Check Size ($MM)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Enter check size"
                          value={editCompany?.checkSize || 0}
                          onChange={(e) => 
                            setEditCompany(
                              editCompany 
                                ? { ...editCompany, checkSize: parseFloat(e.target.value) || 0 } 
                                : null
                            )
                          }
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium block mb-1">
                          Ownership (%)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          placeholder="Enter ownership %"
                          value={editCompany?.ownership || 0}
                          onChange={(e) => 
                            setEditCompany(
                              editCompany 
                                ? { ...editCompany, ownership: parseFloat(e.target.value) || 0 } 
                                : null
                            )
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleEditSave}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{company.name}</h4>
                        <StageBadge stage={company.stage} />
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditStart(company)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveCompany(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valuation:</span>
                        <span>${company.valuation}MM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check Size:</span>
                        <span>${company.checkSize}MM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ownership:</span>
                        <span>{company.ownership}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
