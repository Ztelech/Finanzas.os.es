import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Printer, Calculator, SlidersHorizontal, BarChart3 } from "lucide-react";

// Interfaces for data types
interface FormData {
  units: number;
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  taxRate: number;
}
interface CalculationResults {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  totalRevenue: number;
  totalCost: number;
  profitBeforeTax: number;
  netProfit: number;
}
interface TableData {
  cantidad: number;
  costoFijoTotal: number;
  costoVariableTotal: number;
  costoTotal: number;
  ingresoTotal: number;
  gananciaOPerdida: number;
  utilidadNeta: number;
}
interface ChartData {
  cantidad: number;
  costoTotal: number;
  ingresoTotal: number;
  costoFijo: number;
  utilidadAntesImpuestos: number;
  utilidadNeta: number;
}
const AnalysisDashboard = () => {
  // State for form inputs
  const [formData, setFormData] = useState<FormData>({
    units: 100,
    fixedCost: 10000,
    variableCostPerUnit: 15,
    sellingPricePerUnit: 25,
    taxRate: 30
  });

  // State for calculated results
  const [results, setResults] = useState<CalculationResults>({
    breakEvenUnits: 0,
    breakEvenRevenue: 0,
    totalRevenue: 0,
    totalCost: 0,
    profitBeforeTax: 0,
    netProfit: 0
  });

  // State for table data
  const [tableData, setTableData] = useState<TableData[]>([]);

  // State for chart data
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // State for sensitivity analysis
  const [sensitivityChanges, setSensitivityChanges] = useState({
    priceChange: 0,
    variableCostChange: 0,
    fixedCostChange: 0,
    taxRateChange: 0
  });

  // Number formatter for large numbers
  const formatLargeNumber = (value: number): string => {
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  // Currency formatter
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Effect to recalculate results when form data or sensitivity changes
  useEffect(() => {
    const {
      units,
      fixedCost,
      variableCostPerUnit,
      sellingPricePerUnit,
      taxRate
    } = formData;

    // Apply sensitivity adjustments
    const adjustedSellingPrice = sellingPricePerUnit * (1 + sensitivityChanges.priceChange / 100);
    const adjustedVariableCost = variableCostPerUnit * (1 + sensitivityChanges.variableCostChange / 100);
    const adjustedFixedCost = fixedCost * (1 + sensitivityChanges.fixedCostChange / 100);
    const adjustedTaxRate = taxRate * (1 + sensitivityChanges.taxRateChange / 100);

    // Validate inputs to avoid division by zero
    const contributionMargin = adjustedSellingPrice - adjustedVariableCost;
    if (contributionMargin > 0) {
      // Calculate main results using adjusted values
      const breakEvenUnits = adjustedFixedCost / contributionMargin;
      const breakEvenRevenue = breakEvenUnits * adjustedSellingPrice;
      const totalRevenue = units * adjustedSellingPrice;
      const totalCost = adjustedFixedCost + units * adjustedVariableCost;
      const profitBeforeTax = totalRevenue - totalCost;
      const netProfit = profitBeforeTax * (1 - adjustedTaxRate / 100);
      setResults({
        breakEvenUnits,
        breakEvenRevenue,
        totalRevenue,
        totalCost,
        profitBeforeTax,
        netProfit
      });

      // Generate table data (quantities 1-10, plus user input if > 10)
      const tableRows: TableData[] = [];
      const maxQuantity = Math.max(10, units);

      // Add rows for quantities 1-10
      for (let i = 1; i <= Math.min(10, maxQuantity); i++) {
        const costoVariableTotal = i * adjustedVariableCost;
        const costoTotal = adjustedFixedCost + costoVariableTotal;
        const ingresoTotal = i * adjustedSellingPrice;
        const gananciaOPerdida = ingresoTotal - costoTotal;
        const utilidadNeta = gananciaOPerdida * (1 - adjustedTaxRate / 100);
        tableRows.push({
          cantidad: i,
          costoFijoTotal: adjustedFixedCost,
          costoVariableTotal,
          costoTotal,
          ingresoTotal,
          gananciaOPerdida,
          utilidadNeta
        });
      }

      // Add user input quantity if > 10
      if (units > 10) {
        const costoVariableTotal = units * adjustedVariableCost;
        const costoTotal = adjustedFixedCost + costoVariableTotal;
        const ingresoTotal = units * adjustedSellingPrice;
        const gananciaOPerdida = ingresoTotal - costoTotal;
        const utilidadNeta = gananciaOPerdida * (1 - adjustedTaxRate / 100);
        tableRows.push({
          cantidad: units,
          costoFijoTotal: adjustedFixedCost,
          costoVariableTotal,
          costoTotal,
          ingresoTotal,
          gananciaOPerdida,
          utilidadNeta
        });
      }
      setTableData(tableRows);

      // Generate chart data (extended range for better visualization) using adjusted values
      const maxUnits = Math.max(units, breakEvenUnits);
      const chartRange = Math.ceil(maxUnits * 1.2); // Extend 20% beyond the maximum
      const step = Math.max(1, Math.floor(chartRange / 20)); // Generate ~20 data points

      const chartPoints: ChartData[] = [];

      // Generate points from 0 to chartRange
      for (let quantity = 0; quantity <= chartRange; quantity += step) {
        const costoTotal = adjustedFixedCost + quantity * adjustedVariableCost;
        const ingresoTotal = quantity * adjustedSellingPrice;
        const utilidadAntesImpuestos = ingresoTotal - costoTotal;
        const utilidadNeta = utilidadAntesImpuestos * (1 - adjustedTaxRate / 100);
        chartPoints.push({
          cantidad: quantity,
          costoTotal,
          ingresoTotal,
          costoFijo: adjustedFixedCost,
          utilidadAntesImpuestos,
          utilidadNeta
        });
      }

      // Ensure we have the exact break-even and user input points
      if (!chartPoints.some(p => Math.abs(p.cantidad - breakEvenUnits) < step / 2)) {
        const costoTotal = adjustedFixedCost + breakEvenUnits * adjustedVariableCost;
        const ingresoTotal = breakEvenUnits * adjustedSellingPrice;
        const utilidadAntesImpuestos = ingresoTotal - costoTotal;
        const utilidadNeta = utilidadAntesImpuestos * (1 - adjustedTaxRate / 100);
        chartPoints.push({
          cantidad: breakEvenUnits,
          costoTotal,
          ingresoTotal,
          costoFijo: adjustedFixedCost,
          utilidadAntesImpuestos,
          utilidadNeta
        });
      }
      if (!chartPoints.some(p => Math.abs(p.cantidad - units) < step / 2)) {
        chartPoints.push({
          cantidad: units,
          costoTotal: totalCost,
          ingresoTotal: totalRevenue,
          costoFijo: adjustedFixedCost,
          utilidadAntesImpuestos: profitBeforeTax,
          utilidadNeta: netProfit
        });
      }

      // Sort points by quantity
      chartPoints.sort((a, b) => a.cantidad - b.cantidad);
      setChartData(chartPoints);
    } else {
      // Reset if break-even is not achievable
      setResults({
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        totalRevenue: 0,
        totalCost: 0,
        profitBeforeTax: 0,
        netProfit: 0
      });
      setTableData([]);
      setChartData([]);
    }
  }, [formData, sensitivityChanges]);

  // Handle form input changes with validation
  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Limit input to 12 digits max
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // Handle sensitivity slider changes
  const handleSensitivityChange = (field: keyof typeof sensitivityChanges) => (value: number[]) => {
    setSensitivityChanges(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  // Reset all data to defaults
  const handleReset = () => {
    setFormData({
      units: 100,
      fixedCost: 10000,
      variableCostPerUnit: 15,
      sellingPricePerUnit: 25,
      taxRate: 30
    });
    setSensitivityChanges({
      priceChange: 0,
      variableCostChange: 0,
      fixedCostChange: 0,
      taxRateChange: 0
    });
  };

  // Calculate adjusted values for validation
  const {
    fixedCost,
    variableCostPerUnit,
    sellingPricePerUnit,
    taxRate
  } = formData;
  const adjustedSellingPrice = sellingPricePerUnit * (1 + sensitivityChanges.priceChange / 100);
  const adjustedVariableCost = variableCostPerUnit * (1 + sensitivityChanges.variableCostChange / 100);
  const adjustedTaxRate = taxRate * (1 + sensitivityChanges.taxRateChange / 100);
  const isValidBreakEven = adjustedSellingPrice > adjustedVariableCost;
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Análisis de Rentabilidad Pro
          </h1>
          <p className="text-lg text-muted-foreground">Herramienta completa para análisis de costo-volumen-utilidad con tabla detallada y gráfico interactivo hecho por Jeff Kenneth Maldonado A.</p>
          <div className="mt-4">
            <Button onClick={() => window.print()} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir / Guardar como PDF
            </Button>
          </div>
        </div>

        {/* NEW LAYOUT: Two Vertical Sections */}
        
        {/* SECTION 1: Controls Section - Two cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Card - Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ingrese sus Datos
              </CardTitle>
              <CardDescription>Complete los campos para el análisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="units">Unidades (o Cantidad)</Label>
                <Input id="units" type="number" value={formData.units} onChange={handleInputChange('units')} min="1" max="9999999999" maxLength={12} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fixedCost">Costo Fijo Total</Label>
                <Input id="fixedCost" type="number" value={formData.fixedCost} onChange={handleInputChange('fixedCost')} min="0" max="9999999999" maxLength={12} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variableCost">Costo Variable Unitario</Label>
                <Input id="variableCost" type="number" value={formData.variableCostPerUnit} onChange={handleInputChange('variableCostPerUnit')} min="0" max="9999999999" step="0.01" maxLength={12} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Precio de Venta Unitario</Label>
                <Input id="sellingPrice" type="number" value={formData.sellingPricePerUnit} onChange={handleInputChange('sellingPricePerUnit')} min="0.01" max="9999999999" step="0.01" maxLength={12} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tasa de Impuestos (%)</Label>
                <Input id="taxRate" type="number" value={formData.taxRate} onChange={handleInputChange('taxRate')} min="0" max="100" step="0.1" maxLength={12} />
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Sensitivity Analysis */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Análisis de Sensibilidad
              </CardTitle>
              <CardDescription>Ajuste los parámetros para ver el impacto en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Cambio en Precio de Venta (%)</Label>
                    <span className="text-sm font-medium text-primary">
                      {sensitivityChanges.priceChange > 0 ? '+' : ''}{sensitivityChanges.priceChange}%
                    </span>
                  </div>
                  <Slider value={[sensitivityChanges.priceChange]} onValueChange={handleSensitivityChange('priceChange')} min={-50} max={50} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Cambio en Costos Variables (%)</Label>
                    <span className="text-sm font-medium text-destructive">
                      {sensitivityChanges.variableCostChange > 0 ? '+' : ''}{sensitivityChanges.variableCostChange}%
                    </span>
                  </div>
                  <Slider value={[sensitivityChanges.variableCostChange]} onValueChange={handleSensitivityChange('variableCostChange')} min={-50} max={50} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Cambio en Costos Fijos (%)</Label>
                    <span className="text-sm font-medium text-destructive">
                      {sensitivityChanges.fixedCostChange > 0 ? '+' : ''}{sensitivityChanges.fixedCostChange}%
                    </span>
                  </div>
                  <Slider value={[sensitivityChanges.fixedCostChange]} onValueChange={handleSensitivityChange('fixedCostChange')} min={-50} max={50} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Cambio en Tasa de Impuestos (%)</Label>
                    <span className="text-sm font-medium text-warning">
                      {sensitivityChanges.taxRateChange > 0 ? '+' : ''}{sensitivityChanges.taxRateChange}%
                    </span>
                  </div>
                  <Slider value={[sensitivityChanges.taxRateChange]} onValueChange={handleSensitivityChange('taxRateChange')} min={-50} max={50} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-6">
                <Button onClick={handleReset} variant="outline" className="w-full">
                  Reiniciar Ajustes
                </Button>
              </div>

              {/* Current Adjusted Values Display */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Valores Ajustados</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Precio de Venta:</span>
                    <span className="font-medium">{formatCurrency(adjustedSellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo Variable Unit.:</span>
                    <span className="font-medium">{formatCurrency(adjustedVariableCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo Fijo Total:</span>
                    <span className="font-medium">{formatCurrency(fixedCost * (1 + sensitivityChanges.fixedCostChange / 100))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa de Impuestos:</span>
                    <span className="font-medium">{adjustedTaxRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2: Data Visualization Section */}
        <div className="space-y-8">
          {isValidBreakEven ? <>
              {/* Results Cards - Horizontal Layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Punto de Equilibrio (Unidades)</h4>
                  <p className="text-2xl font-bold text-primary">{Math.ceil(results.breakEvenUnits)}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Punto de Equilibrio ($)</h4>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(results.breakEvenRevenue)}</p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Ingreso Total</h4>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Costo Total</h4>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalCost)}</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground">Utilidad Antes de Impuestos (UAI)</h4>
                  <p className={`text-xl font-bold ${results.profitBeforeTax >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {formatCurrency(results.profitBeforeTax)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${results.netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    {results.netProfit >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'}
                  </h4>
                  <p className={`text-3xl font-bold ${results.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(Math.abs(results.netProfit))}
                  </p>
                </div>
              </div>

              {/* NEW VERTICAL LAYOUT: Table and Chart stacked */}
              {/* Table Section - Full Width */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tabla Detallada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Costo Fijo</TableHead>
                          <TableHead>Costo Variable</TableHead>
                          <TableHead>Costo Total</TableHead>
                          <TableHead>Ingresos</TableHead>
                          <TableHead>Utilidad</TableHead>
                          <TableHead>Utilidad Neta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row, index) => <TableRow key={index}>
                            <TableCell className="font-medium">{row.cantidad}</TableCell>
                            <TableCell>{formatCurrency(row.costoFijoTotal)}</TableCell>
                            <TableCell>{formatCurrency(row.costoVariableTotal)}</TableCell>
                            <TableCell>{formatCurrency(row.costoTotal)}</TableCell>
                            <TableCell>{formatCurrency(row.ingresoTotal)}</TableCell>
                            <TableCell className={row.gananciaOPerdida >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {formatCurrency(row.gananciaOPerdida)}
                            </TableCell>
                            <TableCell className={row.utilidadNeta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {formatCurrency(row.utilidadNeta)}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Chart Section - Full Width */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gráfico del Punto de Equilibrio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                        <XAxis dataKey="cantidad" stroke="hsl(var(--muted-foreground))" label={{
                      value: 'Cantidad (Unidades)',
                      position: 'insideBottom',
                      offset: -10
                    }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={value => `$${formatLargeNumber(value)}`} label={{
                      value: 'Valor ($)',
                      angle: -90,
                      position: 'insideLeft'
                    }} />
                        <Tooltip formatter={(value: number, name: string) => {
                      if (name === 'utilidadNeta') {
                        return [`${value >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'}: ${formatCurrency(Math.abs(value))}`, value >= 0 ? '💰 Ganancia' : '📉 Pérdida'];
                      }
                      return [formatCurrency(value), name];
                    }} labelFormatter={label => `Cantidad: ${Math.round(Number(label))} unidades`} contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }} />
                        <Legend verticalAlign="top" height={40} formatter={value => {
                      if (value === 'Costo Fijo') {
                        return '--- Costo Fijo';
                      }
                      return value;
                    }} iconType="line" />
                        
                        {/* Cost Lines */}
                        <Line type="linear" dataKey="costoTotal" stroke="hsl(var(--destructive))" strokeWidth={3} name="Costo Total" dot={false} strokeDasharray="" />
                        <Line type="linear" dataKey="costoFijo" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" name="Costo Fijo" dot={false} />
                        
                        {/* Revenue Line */}
                        <Line type="linear" dataKey="ingresoTotal" stroke="hsl(var(--success))" strokeWidth={3} name="Ingreso Total" dot={false} />
                        
                        {/* User target quantity marker */}
                        <ReferenceLine x={formData.units} stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="8 4" label={{
                      value: `Objetivo: ${formData.units} unidades`,
                      position: 'top'
                    }} />
                        
                        {/* Reference lines for break-even */}
                        <ReferenceLine x={results.breakEvenUnits} stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.7} label={{
                      value: `PE: ${Math.ceil(results.breakEvenUnits)} unidades`,
                      position: 'top'
                    }} />
                        <ReferenceLine y={results.breakEvenRevenue} stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.7} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    El gráfico muestra las tres líneas principales: Costo Total (rojo), Ingreso Total (verde) y Costo Fijo (naranja punteado).
                  </p>
                </CardContent>
              </Card>
            </> : <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <p className="text-lg text-destructive font-medium">
                  Punto de Equilibrio Inalcanzable
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  El precio de venta debe ser mayor al costo variable por unidad
                </p>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
};
export default AnalysisDashboard;