// backend/utils/pdfGenerator.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // You MUST import autoTable directly

export const generateFraudPDF = (algorithm, aiReport, cleanData) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // 1. Header & Branding
    doc.setFillColor(211, 47, 47); // Dark Red
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SENTINELGRAPH SECURITY REPORT", 15, 25);

    // 2. Report Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 15, 50);
    doc.text(`Algorithm: ${algorithm}`, 15, 55);
    doc.text(`Status: CRITICAL THREAT DETECTED`, 15, 60);

    // 3. AI Threat Assessment Section
    doc.setFontSize(14);
    doc.text("AI INVESTIGATOR SUMMARY", 15, 75);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");

    // Split text so it doesn't run off the page
    const splitReport = doc.splitTextToSize(aiReport || "No AI report generated.", 180);
    doc.text(splitReport, 15, 82);

    // 4. Involved Nodes Table
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("EVIDENCE LOG (INVOLVED NODES)", 15, 120);

    // ✅ FIX 1: Safely grab nodes (in case it's empty)
    const nodes = cleanData?.nodes || [];

    // ✅ FIX 2: Name the variable tableData so autoTable can find it
    const tableData = nodes.map(node => [
        node.id || node.v_id || "Unknown",
        node.type || node.v_type || "Entity",
        node["Start.@min_cc_id"] || (node.attributes?.is_fraud === 1 ? "🚨 FRAUD" : "✅ CLEAR")
    ]);

    // ✅ FIX 3: Start the table at Y=130 so it doesn't draw over your text!
    autoTable(doc, {
        startY: 130, 
        head: [['Entity ID', 'Asset Type', 'Threat Status']], 
        body: tableData, 
        theme: 'grid',
        headStyles: { fillColor: [211, 47, 47] }, // Make the header red to match the brand!
        styles: { fontSize: 8 }
    });

    // 5. Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Confidential - Internal Bank Use Only", 105, 285, null, null, "center");

    // Return as a Buffer so we can send it via API or Email
    return Buffer.from(doc.output('arraybuffer'));
};