import jsPDF from 'jspdf';
import type { BusinessCaseReport } from '../types';
import { reportSections } from '../config/reportSections';
import { Chart } from 'chart.js';

export class PdfGenerator {
  private pdf: jsPDF;
  private currentY: number;
  private pageHeight: number;
  private pageWidth: number;
  private margins = {
    top: 25,
    bottom: 25,
    left: 25,
    right: 25
  };
  private colors = {
    primary: [2, 132, 199], // primary-600
    secondary: [201, 38, 211], // secondary-600
    neutral: {
      800: [39, 39, 42],
      700: [63, 63, 70],
      600: [82, 82, 91]
    }
  };
  private fonts = {
    regular: 'helvetica',
    bold: 'helvetica-bold',
    italic: 'helvetica-oblique'
  };
  private pageNumber: number = 1;
  private totalPages: number = 1;
  private tableOfContents: { title: string; page: number }[] = [];

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = this.margins.top;

    // Set default font
    this.pdf.setFont(this.fonts.regular);
  }

  private addCoverPage(title: string) {
    // Add gradient background
    const gradient = this.pdf.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');

    // Add title
    this.pdf.setFont(this.fonts.bold);
    this.pdf.setFontSize(32);
    this.pdf.setTextColor(255, 255, 255);
    const titleWidth = this.pdf.getTextWidth(title);
    const centerX = (this.pageWidth - titleWidth) / 2;
    this.pdf.text(title, centerX, 50);

    // Add date
    this.pdf.setFont(this.fonts.regular);
    this.pdf.setFontSize(12);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateWidth = this.pdf.getTextWidth(date);
    this.pdf.text(date, (this.pageWidth - dateWidth) / 2, 65);

    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  private addTableOfContents() {
    this.pdf.setFont(this.fonts.bold);
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text('Table of Contents', this.margins.left, this.currentY);
    this.currentY += 15;

    this.pdf.setFont(this.fonts.regular);
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.neutral[700]);

    this.tableOfContents.forEach((item, index) => {
      const dots = '.'.repeat(50);
      const pageNum = item.page.toString();
      const lineWidth = this.pdf.getTextWidth(`${item.title} ${dots} ${pageNum}`);
      
      this.pdf.text(item.title, this.margins.left, this.currentY);
      this.pdf.text(pageNum, this.pageWidth - this.margins.right - this.pdf.getTextWidth(pageNum), this.currentY);
      this.pdf.text(dots, this.margins.left + this.pdf.getTextWidth(item.title + ' '), this.currentY);
      
      this.currentY += 10;
    });

    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  private addHeader(pageNumber: number) {
    this.pdf.setFont(this.fonts.regular);
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.neutral[600]);
    this.pdf.text(`Page ${pageNumber}`, this.pageWidth - this.margins.right - 15, 15);
  }

  private addFooter() {
    const footerText = 'Generated by Business Case Creator';
    this.pdf.setFont(this.fonts.italic);
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.colors.neutral[600]);
    this.pdf.text(footerText, this.margins.left, this.pageHeight - 10);
  }

  private async addChart(chart: HTMLCanvasElement, title: string) {
    this.checkAndAddPage();
    
    // Convert chart to image
    const imageData = chart.toDataURL('image/png', 1.0);
    
    // Calculate dimensions to maintain aspect ratio
    const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
    const maxHeight = 100; // Maximum height for charts
    const aspectRatio = chart.width / chart.height;
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Add title
    this.pdf.setFont(this.fonts.bold);
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.colors.neutral[800]);
    this.pdf.text(title, this.margins.left, this.currentY);
    this.currentY += 8;

    // Add chart
    try {
      this.pdf.addImage(
        imageData,
        'PNG',
        this.margins.left,
        this.currentY,
        width,
        height,
        undefined,
        'FAST'
      );
      this.currentY += height + 15;
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
      this.addParagraph('Error: Could not add chart to PDF');
    }
  }

  private addSectionTitle(text: string) {
    this.checkAndAddPage();
    this.pdf.setFont(this.fonts.bold);
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(text, this.margins.left, this.currentY);
    this.currentY += 12;

    // Add to table of contents
    this.tableOfContents.push({
      title: text,
      page: this.pageNumber
    });
  }

  private addSubsectionTitle(text: string) {
    this.checkAndAddPage();
    this.pdf.setFont(this.fonts.bold);
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.neutral[800]);
    this.pdf.text(text, this.margins.left, this.currentY);
    this.currentY += 8;
  }

  private addParagraph(text: string) {
    this.pdf.setFont(this.fonts.regular);
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...this.colors.neutral[700]);

    const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
    const lines = this.pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkAndAddPage();
      this.pdf.text(line, this.margins.left, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 4;
  }

  private addBulletPoint(text: string, level: number = 0) {
    this.checkAndAddPage();
    const indent = this.margins.left + (level * 5);
    this.pdf.text('•', indent, this.currentY);
    
    const bulletWidth = this.pdf.getTextWidth('• ');
    const maxWidth = this.pageWidth - indent - this.margins.right - bulletWidth;
    const lines = this.pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, index: number) => {
      this.checkAndAddPage();
      this.pdf.text(line, indent + bulletWidth, this.currentY);
      this.currentY += (index === lines.length - 1) ? 6 : 5;
    });
  }

  private checkAndAddPage() {
    if (this.currentY > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.pageNumber++;
      this.currentY = this.margins.top;
      this.addHeader(this.pageNumber);
      this.addFooter();
    }
  }

  private addDivider() {
    this.checkAndAddPage();
    this.currentY += 5;
    this.pdf.setDrawColor(...this.colors.neutral[600]);
    this.pdf.setLineWidth(0.1);
    this.pdf.line(
      this.margins.left,
      this.currentY,
      this.pageWidth - this.margins.right,
      this.currentY
    );
    this.currentY += 10;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  private formatSection(content: string): { title?: string; text: string[] } {
    const lines = content.split('\n');
    const formattedContent: { title?: string; text: string[] } = { text: [] };
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•')) {
        formattedContent.text.push(trimmedLine);
      } else if (trimmedLine.startsWith('#')) {
        formattedContent.title = trimmedLine.replace(/^#+\s/, '');
      } else if (trimmedLine) {
        formattedContent.text.push(trimmedLine);
      }
    });

    return formattedContent;
  }

  async generatePdf(report: BusinessCaseReport): Promise<void> {
    // Add cover page
    this.addCoverPage('Business Case Report');
    this.addHeader(this.pageNumber);
    this.addFooter();

    // Process each section
    for (const section of reportSections) {
      const response = report[section.id];
      
      if (response.status === 'complete') {
        // Add section title
        this.addSectionTitle(section.title);

        // Process content
        const cleanContent = this.stripHtml(response.content);
        const formattedContent = this.formatSection(cleanContent);

        // Add content
        const paragraphs = formattedContent.text;
        for (const paragraph of paragraphs) {
          if (paragraph.startsWith('•')) {
            this.addBulletPoint(paragraph.substring(1).trim());
          } else if (paragraph.includes(':')) {
            const [title, ...content] = paragraph.split(':');
            this.addSubsectionTitle(title.trim());
            this.addParagraph(content.join(':').trim());
          } else {
            this.addParagraph(paragraph);
          }
        }

        // Add charts for financial analysis section
        if (section.id === 'financialAnalysis') {
          const charts = document.querySelectorAll('canvas');
          for (const chart of Array.from(charts)) {
            await this.addChart(chart as HTMLCanvasElement, chart.getAttribute('aria-label') || 'Chart');
          }
        }

        this.addDivider();
      }
    }

    // Add table of contents after processing all sections
    this.totalPages = this.pageNumber;
    this.pdf.setPage(1);
    this.currentY = this.margins.top;
    this.addTableOfContents();

    // Save the PDF
    this.pdf.save('business-case-report.pdf');
  }
}