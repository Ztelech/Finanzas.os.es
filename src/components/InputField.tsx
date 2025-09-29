import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  min?: number;
  step?: number;
}

export const InputField = ({ label, value, onChange, tooltip, min = 0, step = 1 }: InputFieldProps) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="relative">
        <Input
          id={label}
          type="number"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          step={step}
          className={`transition-all duration-200 ${
            focused 
              ? 'ring-2 ring-primary/20 border-primary shadow-md' 
              : 'hover:border-primary/50'
          } bg-background/50 backdrop-blur-sm`}
        />
        {focused && (
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-md animate-pulse" />
        )}
      </div>
    </div>
  );
};