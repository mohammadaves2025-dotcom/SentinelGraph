// backend/utils/pdfGenerator.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
    const splitReport = doc.splitTextToSize(aiReport, 180);
    doc.text(splitReport, 15, 82);

    // 4. Involved Nodes Table
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("EVIDENCE LOG (INVOLVED NODES)", 15, 120);

    const tableRows = cleanData.nodes.map(node => [
        node.id, 
        node.type, 
        node["Start.@min_cc_id"] || "N/A"
    ]);

    doc.autoTable({
        startY: 125,
        head: [['Node ID', 'Type', 'Community ID']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [51, 51, 51] }
    });

    // 5. Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Confidential - Internal Bank Use Only", 105, 285, null, null, "center");

    // Return as a Buffer so we can send it via API or Email
    return Buffer.from(doc.output('arraybuffer'));
};