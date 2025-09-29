import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";
import { InputField } from "@/components/InputField";
import { ResultsTable } from "@/components/ResultsTable";
import { toast } from "@/hooks/use-toast";

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

const Index = () => {
  const [data, setData] = useState<FinancialData>({
    units: 1000,
    fixedCost: 50000,
    variableCostPerUnit: 20,
    sellingPricePerUnit: 35,
  });

  const calculateResults = useCallback((inputData: FinancialData): CalculationResults | null => {
    const { units, fixedCost, variableCostPerUnit, sellingPricePerUnit } = inputData;

    // Validation
    if (sellingPricePerUnit <= variableCostPerUnit) {
      toast({
        title: "Advertencia",
        description: "El precio de venta debe ser mayor al costo variable por unidad para alcanzar el punto de equilibrio.",
        variant: "destructive",
      });
      return null;
    }

    if (units <= 0 || fixedCost < 0 || variableCostPerUnit < 0 || sellingPricePerUnit <= 0) {
      return null;
    }

    // Calculations
    const fixedCostPerUnit = fixedCost / units;
    const totalVariableCost = variableCostPerUnit * units;
    const totalCost = fixedCost + totalVariableCost;
    const totalCostPerUnit = totalCost / units;
    const salesRevenue = sellingPricePerUnit * units;
    const profitOrLoss = salesRevenue - totalCost;
    const breakEvenUnits = fixedCost / (sellingPricePerUnit - variableCostPerUnit);
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

    return {
      fixedCostPerUnit,
      totalVariableCost,
      totalCost,
      totalCostPerUnit,
      salesRevenue,
      profitOrLoss,
      breakEvenUnits,
      breakEvenRevenue,
    };
  }, []);

  const handleInputChange = (field: keyof FinancialData, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const results = calculateResults(data);
  const isValidData = results !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Análisis de Costo-Volumen-Utilidad
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramienta profesional para el análisis de rentabilidad y determinación del punto de equilibrio
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                Parámetros de Análisis
              </h2>
            </div>

            <div className="space-y-6">
              <InputField
                label="Unidades a Producir"
                value={data.units}
                onChange={(value) => handleInputChange("units", value)}
                tooltip="Cantidad de unidades que planeas producir y vender"
                min={1}
              />

              <InputField
                label="Costo Fijo Total ($)"
                value={data.fixedCost}
                onChange={(value) => handleInputChange("fixedCost", value)}
                tooltip="Costos que no cambian con el nivel de producción (alquiler, salarios fijos, seguros, etc.)"
                min={0}
                step={100}
              />

              <InputField
                label="Costo Variable por Unidad ($)"
                value={data.variableCostPerUnit}
                onChange={(value) => handleInputChange("variableCostPerUnit", value)}
                tooltip="Costo que varía directamente con cada unidad producida (materiales, mano de obra directa, etc.)"
                min={0}
                step={0.01}
              />

              <InputField
                label="Precio de Venta por Unidad ($)"
                value={data.sellingPricePerUnit}
                onChange={(value) => handleInputChange("sellingPricePerUnit", value)}
                tooltip="Precio al que vendes cada unidad de tu producto"
                min={0.01}
                step={0.01}
              />
            </div>

            {!isValidData && (
              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-foreground">
                    Datos no válidos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    El precio de venta debe ser mayor al costo variable por unidad.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Results Section */}
          <Card className="p-6 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success/10 rounded-lg">
                <Calculator className="h-5 w-5 text-success" />
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                Resultados del Análisis
              </h2>
            </div>

            {isValidData && results ? (
              <ResultsTable results={results} data={data} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa datos válidos para ver los resultados</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;