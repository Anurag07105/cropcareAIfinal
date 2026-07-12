import { toast } from '@/hooks/use-toast';

export async function downloadReportElement(
  element: HTMLElement | null,
  createdAt?: string
) {
  if (!element) {
    toast({
      title: 'Download failed',
      description: 'Report is not ready to download.',
      variant: 'destructive',
    });
    return;
  }

  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: Math.max(2, window.devicePixelRatio || 1),
      useCORS: true,
      allowTaint: false,
    });

    const link = document.createElement('a');
    const date = createdAt ? new Date(createdAt) : new Date();
    const safeDate = date.toISOString().slice(0, 10);
    link.download = `CropCare_Report_${safeDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Report download failed:', error);
    toast({
      title: 'Download failed',
      description: 'Unable to generate the report image. Please try again.',
      variant: 'destructive',
    });
  }
}
