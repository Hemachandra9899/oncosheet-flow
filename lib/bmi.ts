export function calculateBMI(weightKg?: number | null, heightCmOrM?: number | null) {
  if (!weightKg || !heightCmOrM) return null;
  const heightM = heightCmOrM > 3 ? heightCmOrM / 100 : heightCmOrM;
  if (heightM <= 0) return null;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

export function getBMIGroup(bmi?: number | null) {
  if (bmi == null || Number.isNaN(bmi)) return "";
  if (bmi < 18.5) return "Under Weight(G1)";
  if (bmi < 25) return "Normal Wt(G2)";
  if (bmi < 30) return "Over Wt(G3)";
  return "Obese(G4)";
}
