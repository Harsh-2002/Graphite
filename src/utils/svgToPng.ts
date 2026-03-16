import type { MermaidColors } from '../types/theme';

export async function svgToPng(
  svgString: string,
  scale: number,
  isDark: boolean,
  colors: MermaidColors,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    let processed = svgString;
    if (!processed.includes('xmlns=')) {
      processed = processed.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }

    const blob = new Blob([processed], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const padding = 40 * scale;
      const borderRadius = 16 * scale;
      const borderWidth = 1 * scale;

      canvas.width = img.width * scale + padding * 2;
      canvas.height = img.height * scale + padding * 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(
          borderWidth / 2,
          borderWidth / 2,
          canvas.width - borderWidth,
          canvas.height - borderWidth,
          borderRadius,
        );
      } else {
        ctx.rect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);
      }

      ctx.fillStyle = colors.surface || (isDark ? '#18181b' : '#ffffff');
      ctx.fill();
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = colors.border || (isDark ? '#3f3f46' : '#d4d4d8');
      ctx.stroke();

      ctx.scale(scale, scale);
      ctx.drawImage(img, padding / scale, padding / scale);
      URL.revokeObjectURL(url);

      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}
