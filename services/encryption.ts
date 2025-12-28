/**
 * Solo Leveling "Crystal" Signature System
 * Simple Base64 encoding with a system-prefix for the demonstration.
 */

export const generateSignature = (data: any): string => {
  try {
    const jsonStr = JSON.stringify(data);
    // Base64 encoding (simulating encryption)
    const encoded = btoa(encodeURIComponent(jsonStr));
    return `SL_CRYSTAL_${encoded}`;
  } catch (e) {
    console.error("Signature generation failed", e);
    return "";
  }
};

export const recoverFromSignature = (signature: string): any | null => {
  if (!signature.startsWith("SL_CRYSTAL_")) return null;
  try {
    const encoded = signature.replace("SL_CRYSTAL_", "");
    const jsonStr = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Signature recovery failed", e);
    return null;
  }
};