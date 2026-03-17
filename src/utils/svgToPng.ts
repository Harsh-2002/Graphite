import type { MermaidColors } from '../types/theme';

export function wrapSvgWithCard(
  svgString: string,
  isDark: boolean,
  colors: MermaidColors,
): string {
  const padding = 40;
  const borderRadius = 16;
  const borderWidth = 1;

  const widthMatch = svgString.match(/width="([^"]+)"/);
  const heightMatch = svgString.match(/height="([^"]+)"/);
  const innerW = widthMatch ? parseFloat(widthMatch[1]) : 400;
  const innerH = heightMatch ? parseFloat(heightMatch[1]) : 300;

  const totalW = innerW + padding * 2;
  const totalH = innerH + padding * 2;

  const bg = colors.surface || (isDark ? '#18181b' : '#ffffff');
  const border = colors.border || (isDark ? '#3f3f46' : '#d4d4d8');

  let innerSvg = svgString;
  if (!innerSvg.includes('xmlns=')) {
    innerSvg = innerSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${totalW - borderWidth}" height="${totalH - borderWidth}" rx="${borderRadius}" ry="${borderRadius}" fill="${bg}" stroke="${border}" stroke-width="${borderWidth}"/>
  <g transform="translate(${padding}, ${padding})">
    ${innerSvg}
  </g>
</svg>`;
}

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
