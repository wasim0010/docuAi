
export enum PaperSize {
  A4 = 'a4',
  LETTER = 'letter',
  LEGAL = 'legal'
}

export enum Orientation {
  PORTRAIT = 'p',
  LANDSCAPE = 'l'
}

export interface PDFConfig {
  fontSize: number;
  lineHeight: number;
  margin: number;
  paperSize: PaperSize;
  orientation: Orientation;
  fontFamily: 'helvetica' | 'times' | 'courier';
}

export interface AIStatus {
  loading: boolean;
  error: string | null;
}
