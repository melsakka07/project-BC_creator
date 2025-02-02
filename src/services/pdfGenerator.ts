import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { BusinessCaseReport } from '../types';
import { reportSections } from '../config/reportSections';

interface PDFOptions {
  margin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  lineHeight: number;
  fontSize: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
  };
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    text: {
      dark: [number, number, number];
      medium: [number, number, number];
      light: [number, number, number];
    };
  };
}

interface GradientColor {
  position: number;
  color: [number, number, number];
}

interface FinancialMetric {
  label: string;
  value: string;
  isValid: boolean;
}

interface GenerationProgress {
  currentSection: string;
  totalSections: number;
  completedSections: number;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private options: PDFOptions;
  private currentY: number;
  private margins = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };
  private pageNumber: number = 1;
  private tableOfContents: { title: string; page: number }[] = [];
  private progressCallback?: (progress: GenerationProgress) => void;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    this.options = {
      margin: 50,
      pageWidth: 595.28,
      pageHeight: 841.89,
      contentWidth: 495.28,
      lineHeight: 1.5,
      fontSize: {
        title: 24,
        heading: 18,
        subheading: 14,
        body: 12
      },
      colors: {
        primary: [63, 131, 248],   // Blue
        secondary: [99, 102, 241],  // Indigo
        accent: [139, 92, 246],     // Purple
        text: {
          dark: [31, 41, 55],
          medium: [107, 114, 128],
          light: [156, 163, 175]
        }
      }
    };

    this.currentY = this.options.margin;
  }

  private addCoverPage(title: string) {
    // Create gradient background
    const gradient = {
      x0: 0,
      y0: 0,
      x1: this.options.pageWidth,
      y1: 300,
      colors: [
        { position: 0, color: this.options.colors.primary },
        { position: 0.5, color: this.options.colors.secondary },
        { position: 1, color: this.options.colors.accent }
      ] as GradientColor[]
    };

    // Apply gradient
    for (let y = gradient.y0; y < gradient.y1; y++) {
      const ratio = (y - gradient.y0) / (gradient.y1 - gradient.y0);
      const color = this.interpolateColors(gradient.colors, ratio);
      this.pdf.setFillColor(color[0], color[1], color[2]);
      this.pdf.rect(gradient.x0, y, gradient.x1, 1, 'F');
    }

    // Add decorative accent line
    this.pdf.setDrawColor(...this.options.colors.accent);
    this.pdf.setLineWidth(3);
    this.pdf.line(50, 260, this.options.pageWidth - 50, 260);

    // Add title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(this.options.fontSize.title);
    this.pdf.setTextColor(255, 255, 255);
    const titleWidth = this.pdf.getTextWidth(title);
    const centerX = (this.options.pageWidth - titleWidth) / 2;
    this.pdf.text(title, centerX, 150);

    // Add date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(255, 255, 255);
    const dateWidth = this.pdf.getTextWidth(formattedDate);
    this.pdf.text(formattedDate, (this.options.pageWidth - dateWidth) / 2, 190);

    // Add decorative elements
    this.addDecorations();
  }

  private interpolateColors(colors: GradientColor[], ratio: number): [number, number, number] {
    for (let i = 0; i < colors.length - 1; i++) {
      if (ratio >= colors[i].position && ratio <= colors[i + 1].position) {
        const t = (ratio - colors[i].position) / (colors[i + 1].position - colors[i].position);
        return colors[i].color.map((c, j) => 
          Math.round(c + t * (colors[i + 1].color[j] - c))
        ) as [number, number, number];
      }
    }
    return colors[colors.length - 1].color;
  }

  private addDecorations() {
    // Add modern geometric shapes
    this.pdf.setFillColor(...this.options.colors.secondary);
    this.pdf.circle(50, 50, 20, 'F');
    this.pdf.setFillColor(...this.options.colors.accent);
    this.pdf.rect(this.options.pageWidth - 80, 200, 30, 30, 'F');
  }

  private addHeader(pageNumber: number) {
    this.pdf.setFillColor(249, 250, 251); // Light gray background
    this.pdf.rect(0, 0, this.options.pageWidth, 40, 'F');
    
    this.pdf.setDrawColor(229, 231, 235); // Border color
    this.pdf.setLineWidth(0.5);
    this.pdf.line(0, 40, this.options.pageWidth, 40);

    // Add page number
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.options.colors.text.medium);
    this.pdf.text(`Page ${pageNumber}`, this.options.pageWidth - 70, 25);
  }

  private addTableOfContents() {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(...this.options.colors.primary);
    this.pdf.text('Table of Contents', this.margins.left, this.currentY);
    this.currentY += 15;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(...this.options.colors.text.medium);

    this.tableOfContents.forEach(item => {
      const dots = '.'.repeat(50);
      const pageNum = item.page.toString();
      
      this.pdf.text(item.title, this.margins.left, this.currentY);
      this.pdf.text(pageNum, this.options.pageWidth - this.margins.right - this.pdf.getTextWidth(pageNum), this.currentY);
      this.pdf.text(dots, this.margins.left + this.pdf.getTextWidth(item.title + ' '), this.currentY);
      
      this.currentY += 10;
    });

    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  private async loadSectionIcon(iconPath: string): Promise<string | null> {
    try {
      const response = await fetch(iconPath);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading section icon:', error);
      return null;
    }
  }

  private async addSectionHeader(title: string, iconPath?: string) {
    // Add section background
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.roundedRect(
      this.margins.left,
      this.currentY,
      this.options.pageWidth - (this.margins.left * 2),
      60,
      5,
      5,
      'F'
    );

    // Add icon if provided
    let hasIcon = false;
    if (iconPath && typeof iconPath === 'string') {
      try {
        const iconData = await this.loadSectionIcon(iconPath);
        if (iconData) {
          this.pdf.addImage(
            iconData,
            'PNG',
            this.margins.left + 20,
            this.currentY + 15,
            30,
            30
          );
          hasIcon = true;
        }
      } catch (error) {
        console.error('Error adding section icon:', error);
      }
    }

    // Add title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(this.options.fontSize.heading);
    this.pdf.setTextColor(...this.options.colors.primary);
    
    const titleX = hasIcon ? this.margins.left + 70 : this.margins.left + 20;
    this.pdf.text(title, titleX, this.currentY + 35);

    this.currentY += 80;

    // Add to table of contents
    this.tableOfContents.push({
      title: title,
      page: this.pageNumber
    });
  }

  protected addSubsectionTitle(text: string) {
    this.checkAndAddPage();
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(this.options.fontSize.subheading);
    this.pdf.setTextColor(...this.options.colors.text.dark);
    this.pdf.text(text, this.margins.left, this.currentY);
    this.currentY += 8;
  }

  protected addParagraph(text: string) {
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(this.options.fontSize.body);
    this.pdf.setTextColor(...this.options.colors.text.dark);

    const maxWidth = this.options.pageWidth - this.margins.left - this.margins.right;
    const lines = this.pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkAndAddPage();
      this.pdf.text(line, this.margins.left, this.currentY);
      this.currentY += this.options.lineHeight * this.options.fontSize.body;
    });

    this.currentY += 10;
  }

  protected addBulletPoint(text: string, level: number = 0) {
    this.checkAndAddPage();
    const indent = this.margins.left + (level * 5);
    this.pdf.text('•', indent, this.currentY);
    
    const bulletWidth = this.pdf.getTextWidth('• ');
    const maxWidth = this.options.pageWidth - indent - this.margins.right - bulletWidth;
    const lines = this.pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, index: number) => {
      this.checkAndAddPage();
      this.pdf.text(line, indent + bulletWidth, this.currentY);
      this.currentY += (index === lines.length - 1) ? 6 : 5;
    });
  }

  private checkAndAddPage() {
    if (this.currentY > this.options.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.pageNumber++;
      this.currentY = this.margins.top;
      this.addHeader(this.pageNumber);
    }
  }

  protected addDivider() {
    this.checkAndAddPage();
    this.currentY += 5;
    this.pdf.setDrawColor(...this.options.colors.accent);
    this.pdf.setLineWidth(0.1);
    this.pdf.line(
      this.margins.left,
      this.currentY,
      this.options.pageWidth - this.margins.right,
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

  async generatePdf(
    report: BusinessCaseReport,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<void> {
    this.progressCallback = onProgress;
    const totalSections = reportSections.length;
    let completedSections = 0;

    try {
      this.addCoverPage('Business Case Report');
      this.pageNumber = 1;
      this.addHeader(this.pageNumber);

      for (const section of reportSections) {
        this.updateProgress(section.title, totalSections, completedSections);
        const response = report[section.id as keyof BusinessCaseReport];
        if (response.status === 'complete') {
          // Convert icon to string path if needed
          const iconPath = section.icon ? section.icon.toString() : undefined;
          await this.addSectionHeader(section.title, iconPath);
          
          if (section.id === 'executiveSummary') {
            this.addExecutiveSummary(this.stripHtml(response.content));
          } else if (section.id === 'financialAnalysis') {
            const content = this.stripHtml(response.content);
            const metrics = this.calculateFinancialMetrics(content);
            this.addMetricsBox(metrics);
            this.addStyledContent({ text: [content] });
            await this.addStyledCharts();
          } else {
            const cleanContent = this.stripHtml(response.content);
            const formattedContent = this.formatSection(cleanContent);
            this.addStyledContent(formattedContent);
          }

          this.addSectionDivider();
          this.addFooter(this.pageNumber);
        }
        completedSections++;
      }

      this.pdf.setPage(1);
      this.currentY = this.margins.top;
      this.addTableOfContents();

      this.addBackgroundPattern();

      this.pdf.save('business-case-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private updateProgress(section: string, total: number, completed: number) {
    this.progressCallback?.({
      currentSection: section,
      totalSections: total,
      completedSections: completed
    });
  }

  private addStyledContent(content: { title?: string; text: string[] }) {
    content.text.forEach(paragraph => {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(this.options.fontSize.body);
      this.pdf.setTextColor(...this.options.colors.text.dark);
      
      const lines = this.pdf.splitTextToSize(
        paragraph,
        this.options.contentWidth - (2 * this.options.margin)
      );
      
      lines.forEach((line: string) => {
        this.checkAndAddPage();
        this.pdf.text(line, this.options.margin, this.currentY);
        this.currentY += this.options.lineHeight * this.options.fontSize.body;
      });
      
      this.currentY += 10;
    });
  }

  private addSectionDivider() {
    this.currentY += 20;
    this.pdf.setDrawColor(...this.options.colors.accent);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      this.options.margin,
      this.currentY,
      this.options.pageWidth - this.options.margin,
      this.currentY
    );
    this.currentY += 30;
  }

  protected addText(text: string) {
    this.checkAndAddPage();
    this.pdf.text(text, this.margins.left, this.currentY);
    this.currentY += this.options.lineHeight * this.options.fontSize.body;
  }

  protected addSpacing() {
    this.currentY += this.options.lineHeight * this.options.fontSize.body;
  }

  private async addStyledCharts() {
    try {
      const charts = document.querySelectorAll('canvas');
      if (!charts.length) {
        console.warn('No charts found to render in PDF');
        return;
      }

      for (const chart of Array.from(charts)) {
        await this.addChartWithRetry(chart);
      }
    } catch (error) {
      console.error('Error in chart rendering:', error);
      this.addErrorPlaceholder('Chart rendering failed');
    }
  }

  private async addChartWithRetry(chart: HTMLCanvasElement, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.renderChart(chart);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait before retry
      }
    }
  }

  private addErrorPlaceholder(message: string) {
    this.pdf.setFillColor(254, 242, 242); // Light red background
    this.pdf.setDrawColor(252, 165, 165); // Red border
    this.pdf.roundedRect(
      this.margins.left,
      this.currentY,
      this.options.pageWidth - (this.margins.left * 2),
      60,
      5,
      5,
      'FD'
    );

    this.pdf.setTextColor(239, 68, 68); // Red text
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(12);
    this.pdf.text(message, this.margins.left + 20, this.currentY + 30);
    
    this.currentY += 80;
  }

  private addFooter(pageNumber: number) {
    const footerY = this.options.pageHeight - 20;
    
    // Add line above footer
    this.pdf.setDrawColor(...this.options.colors.text.light);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      this.margins.left,
      footerY - 10,
      this.options.pageWidth - this.margins.right,
      footerY - 10
    );

    // Add footer text
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.options.colors.text.light);
    
    // Left side - Company info
    this.pdf.text(
      'Business Case Generator',
      this.margins.left,
      footerY
    );

    // Center - Date
    const date = new Date().toLocaleDateString();
    const dateWidth = this.pdf.getTextWidth(date);
    this.pdf.text(
      date,
      (this.options.pageWidth - dateWidth) / 2,
      footerY
    );

    // Right side - Page number
    const pageText = `Page ${pageNumber}`;
    this.pdf.text(
      pageText,
      this.options.pageWidth - this.margins.right - this.pdf.getTextWidth(pageText),
      footerY
    );
  }

  private addExecutiveSummary(content: string) {
    const boxMargin = 20;
    const boxPadding = 15;
    const boxWidth = this.options.pageWidth - (this.margins.left * 2) - (boxMargin * 2);
    
    // Add quote icon
    this.pdf.setFillColor(...this.options.colors.primary);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(40);
    this.pdf.text('"', this.margins.left + boxMargin, this.currentY + 30);

    // Calculate content height
    const lines = this.pdf.splitTextToSize(
      content,
      boxWidth - (boxPadding * 2) - 30 // Account for quote icon
    );
    const lineHeight = this.options.lineHeight * this.options.fontSize.body;
    const contentHeight = lines.length * lineHeight + (boxPadding * 2);
    const boxHeight = Math.max(100, contentHeight);

    // Add gradient background
    const gradient = {
      colors: [
        { position: 0, color: [255, 255, 255] as [number, number, number] },
        { position: 1, color: [249, 250, 251] as [number, number, number] }
      ] as GradientColor[]
    };

    for (let y = 0; y < boxHeight; y++) {
      const ratio = y / boxHeight;
      const color = this.interpolateColors(gradient.colors, ratio);
      if (Array.isArray(color) && color.length === 3) {
        this.pdf.setFillColor(color[0], color[1], color[2]);
        this.pdf.rect(
          this.margins.left + boxMargin,
          this.currentY + y,
          boxWidth,
          1,
          'F'
        );
      }
    }

    // Add border with shadow
    for (let i = 3; i > 0; i--) {
      this.pdf.setFillColor(0, 0, 0, i * 0.03);
      this.pdf.roundedRect(
        this.margins.left + boxMargin + i,
        this.currentY + i,
        boxWidth,
        boxHeight,
        5,
        5,
        'F'
      );
    }

    // Add content
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(this.options.fontSize.body);
    this.pdf.setTextColor(...this.options.colors.text.dark);

    lines.forEach((line: string, index: number) => {
      this.pdf.text(
        line,
        this.margins.left + boxMargin + boxPadding + 30,
        this.currentY + boxPadding + (index * lineHeight)
      );
    });

    this.currentY += boxHeight + 30;
  }

  private calculateFinancialMetrics(content: string): FinancialMetric[] {
    const extractMetric = (
      pattern: RegExp,
      label: string,
      formatter: (value: string) => string
    ): FinancialMetric => {
      const match = content.match(pattern);
      return {
        label,
        value: match ? formatter(match[1]) : 'N/A',
        isValid: !!match
      };
    };

    const metrics = [
      extractMetric(
        /ROI.*?(\d+\.?\d*)%/,
        'ROI',
        value => `${parseFloat(value).toFixed(1)}%`
      ),
      extractMetric(
        /NPV.*?\$(\d+\.?\d*)M/,
        'NPV',
        value => `$${parseFloat(value).toFixed(1)}M`
      ),
      extractMetric(
        /payback.*?(\d+\.?\d*)\s*years/i,
        'Payback',
        value => `${parseFloat(value).toFixed(1)} Years`
      )
    ];

    return metrics.length > 0 ? metrics : [
      { label: 'ROI', value: 'N/A', isValid: false },
      { label: 'NPV', value: 'N/A', isValid: false },
      { label: 'Payback', value: 'N/A', isValid: false }
    ];
  }

  private addMetricsBox(metrics: FinancialMetric[]) {
    const boxWidth = (this.options.pageWidth - (this.margins.left * 2) - 40) / 3;
    const boxHeight = 80;
    
    metrics.forEach((metric, index) => {
      const x = this.margins.left + (index * (boxWidth + 20));
      
      // Add box with gradient background
      const gradient = {
        colors: [
          { position: 0, color: this.options.colors.primary },
          { position: 1, color: this.options.colors.secondary }
        ] as GradientColor[]
      };

      // Draw gradient box with type checking
      for (let y = 0; y < boxHeight; y++) {
        const ratio = y / boxHeight;
        const color = this.interpolateColors(gradient.colors, ratio);
        if (Array.isArray(color) && color.length === 3) {
          this.pdf.setFillColor(color[0], color[1], color[2]);
          this.pdf.rect(x, this.currentY + y, boxWidth, 1, 'F');
        }
      }

      // Add metric value with color based on validity
      this.pdf.setTextColor(metric.isValid ? 255 : 200, 255, 255);
      this.pdf.text(
        metric.value,
        x + 20,
        this.currentY + 35
      );

      // Add label with opacity based on validity
      this.pdf.setTextColor(255, 255, 255, metric.isValid ? 1 : 0.7);
      this.pdf.text(
        metric.label,
        x + 20,
        this.currentY + 55
      );
    });

    this.currentY += boxHeight + 30;
  }

  private checkContentFit(height: number): boolean {
    return (this.currentY + height) <= (this.options.pageHeight - this.margins.bottom);
  }

  private addPageBreakIfNeeded(contentHeight: number) {
    if (!this.checkContentFit(contentHeight)) {
      this.pdf.addPage();
      this.pageNumber++;
      this.currentY = this.margins.top;
      this.addHeader(this.pageNumber);
    }
  }

  private async renderChart(chart: HTMLCanvasElement): Promise<void> {
    this.checkAndAddPage();
    
    // Add chart container with shadow
    const chartTitle = chart.getAttribute('aria-label') || 'Financial Chart';
    const containerPadding = 15;
    
    // Calculate dimensions
    const containerWidth = this.options.pageWidth - (this.margins.left * 2);
    const chartWidth = containerWidth - (containerPadding * 2);
    const chartHeight = (chart.height * chartWidth) / chart.width;
    const containerHeight = chartHeight + (containerPadding * 2) + 30;

    // Check if we need a page break
    this.addPageBreakIfNeeded(containerHeight + 40);

    // Add shadow effect
    for (let i = 3; i > 0; i--) {
      this.pdf.setFillColor(0, 0, 0, i * 0.03); // Lighter shadow
      this.pdf.roundedRect(
        this.margins.left + i,
        this.currentY + i,
        containerWidth,
        containerHeight,
        5,
        5,
        'F'
      );
    }

    // Add container background with gradient
    const gradient = {
      colors: [
        { position: 0, color: [255, 255, 255] as [number, number, number] },
        { position: 1, color: [249, 250, 251] as [number, number, number] }
      ] as GradientColor[]
    };

    // Draw gradient background
    for (let y = 0; y < containerHeight; y++) {
      const ratio = y / containerHeight;
      const color = this.interpolateColors(gradient.colors, ratio);
      if (Array.isArray(color) && color.length === 3) {
        this.pdf.setFillColor(color[0], color[1], color[2]);
        this.pdf.rect(
          this.margins.left,
          this.currentY + y,
          containerWidth,
          1,
          'F'
        );
      }
    }

    // Add border
    this.pdf.setDrawColor(...this.options.colors.accent);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(
      this.margins.left,
      this.currentY,
      containerWidth,
      containerHeight,
      5,
      5,
      'S'
    );

    // Add title with accent bar
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(this.options.fontSize.subheading);
    this.pdf.setTextColor(...this.options.colors.text.dark);
    
    // Add accent bar before title
    this.pdf.setFillColor(...this.options.colors.accent);
    this.pdf.rect(
      this.margins.left + containerPadding,
      this.currentY + containerPadding,
      3,
      20,
      'F'
    );
    
    this.pdf.text(
      chartTitle,
      this.margins.left + containerPadding + 10,
      this.currentY + containerPadding + 15
    );

    // Add chart
    try {
      const imgData = chart.toDataURL('image/png', 1.0);
      await this.pdf.addImage(
        imgData,
        'PNG',
        this.margins.left + containerPadding,
        this.currentY + containerPadding + 30,
        chartWidth,
        chartHeight,
        undefined,
        'FAST'
      );
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
      throw error;
    }

    // Add subtle grid lines
    this.pdf.setDrawColor(229, 231, 235);
    this.pdf.setLineWidth(0.2);
    for (let i = 1; i < 4; i++) {
      const y = this.currentY + containerPadding + 30 + (chartHeight * i / 4);
      this.pdf.line(
        this.margins.left + containerPadding,
        y,
        this.margins.left + containerPadding + chartWidth,
        y
      );
    }

    this.currentY += containerHeight + 30;
  }

  private addBackgroundPattern() {
    // Add subtle dot pattern
    this.pdf.setFillColor(245, 247, 250);
    for (let x = 0; x < this.options.pageWidth; x += 20) {
      for (let y = 0; y < this.options.pageHeight; y += 20) {
        this.pdf.circle(x, y, 0.5, 'F');
      }
    }

    // Add watermark
    this.pdf.setTextColor(245, 247, 250);
    this.pdf.setFontSize(60);
    this.pdf.setFont('helvetica', 'bold');
    const watermark = 'BUSINESS CASE';
    const watermarkWidth = this.pdf.getTextWidth(watermark);
    this.pdf.text(
      watermark,
      (this.options.pageWidth - watermarkWidth) / 2,
      this.options.pageHeight / 2,
      {
        angle: 45
      }
    );
  }

  protected addQRCode(url: string) {
    const qrSize = 100;
    const qrX = this.options.pageWidth - this.margins.right - qrSize;
    const qrY = this.options.pageHeight - this.margins.bottom - qrSize;

    // Add QR code container
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setDrawColor(...this.options.colors.accent);
    this.pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 5, 5, 'FD');

    // Add QR code
    this.pdf.addImage(
      url,
      'PNG',
      qrX,
      qrY,
      qrSize,
      qrSize
    );

    // Add label
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...this.options.colors.text.medium);
    this.pdf.text(
      'Scan for digital version',
      qrX + (qrSize / 2),
      qrY + qrSize + 15,
      { align: 'center' }
    );
  }
}