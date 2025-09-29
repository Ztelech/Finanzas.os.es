import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";

interface FinancialData {
  units: number;
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
}

interface CalculationResults {
  fixedCostPerUnit: number;
  totalVariableCost: number;
  totalCost: number;
  totalCostPerUnit: number;
  salesRevenue: number;
  profitOrLoss: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}

interface ResultsTableProps {
  results: CalculationResults;
  data: FinancialData;
}

export const ResultsTable = ({ results, data }: ResultsTableProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const profitMargin = ((results.profitOrLoss / results.salesRevenue) * 100);
  const isProfit = results.profitOrLoss > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(results.salesRevenue)}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${
          isProfit 
            ? 'bg-success/5 border-success/10' 
            : 'bg-destructive/5 border-destructive/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isProfit ? (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Ganancia</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Pérdida</span>
              </>
            )}
          </div>
          <p className={`text-2xl font-bold ${
            isProfit ? 'text-success' : 'text-destructive'
          }`}>
            {formatCurrency(Math.abs(results.profitOrLoss))}
          </p>
        </div>
      </div>

      <Separator />

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Análisis Detallado
        </h3>
        
        <div className="space-y-3">
          <ResultRow
            label="Costo Fijo Unitario"
            value={formatCurrency(results.fixedCostPerUnit)}
            description="Costo fijo distribuido por unidad"
          />
          
          <ResultRow
            label="Costo Variable Total"
            value={formatCurrency(results.totalVariableCost)}
            description={`${formatNumber(data.units)} unidades × ${formatCurrency(data.variableCostPerUnit)}`}
          />
          
          <ResultRow
            label="Costo Total"
            value={formatCurrency(results.totalCost)}
            description="Costos fijos + variables"
          />
          
          <ResultRow
            label="Costo Total Unitario"
            value={formatCurrency(results.totalCostPerUnit)}
            description="Costo total ÷ unidades producidas"
          />
          
          <Separator className="my-4" />
          
          <ResultRow
            label="Margen de Ganancia"
            value={`${profitMargin.toFixed(1)}%`}
            description="Ganancia como % de ingresos"
            highlight={isProfit}
          />
        </div>
      </div>

      <Separator />

      {/* Break-even Analysis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Punto de Equilibrio</h3>
        
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unidades</p>
              <p className="text-xl font-bold text-accent">
                {formatNumber(results.breakEvenUnits)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ingresos</p>
              <p className="text-xl font-bold text-accent">
                {formatCurrency(results.breakEvenRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Necesitas vender <strong>{formatNumber(results.breakEvenUnits)}</strong> unidades 
            para cubrir todos tus costos y alcanzar el punto de equilibrio.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          {data.units >= results.breakEvenUnits ? (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              ✓ Por encima del punto de equilibrio
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
              ⚠ Por debajo del punto de equilibrio
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

interface ResultRowProps {
  label: string;
  value: string;
  description?: string;
  highlight?: boolean;
}

const ResultRow = ({ label, value, description, highlight = false }: ResultRowProps) => (
  <div className={`flex justify-between items-start p-3 rounded-lg transition-colors ${
    highlight ? 'bg-success/5 border border-success/10' : 'bg-muted/30'
  }`}>
    <div className="flex-1">
      <p className="font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    <p className={`font-bold text-lg ${
      highlight ? 'text-success' : 'text-foreground'
    }`}>
      {value}
    </p>
  </div>
);