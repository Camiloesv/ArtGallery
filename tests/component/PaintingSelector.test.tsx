import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { starterExhibition } from '../../src/config/exhibition';
import { PaintingSelector } from '../../src/components/PaintingSelector';

describe('PaintingSelector', () => {
  it('renders only the configured painting numbers and a separate overview action', () => {
    const html = renderToStaticMarkup(
      <PaintingSelector
        focusedPosition={null}
        onSelect={vi.fn()}
        stations={starterExhibition.stations.slice(0, starterExhibition.count)}
      />,
    );
    const options = [...html.matchAll(/<option\b([^>]*)>(.*?)<\/option>/g)].filter(
      ([, attributes]) => !attributes?.includes('hidden'),
    );

    expect(html).toContain('aria-label="Go to painting"');
    expect(options).toHaveLength(25);
    expect(html).toContain('<option value="0">1</option>');
    expect(html).toContain('<option value="24">25</option>');
    expect(html).not.toContain('Overview</option>');
    expect(html).not.toContain('First Light');
    expect(html).toContain('aria-label="Return to overview"');
  });

  it('lists only paintings in the configured count', () => {
    const html = renderToStaticMarkup(
      <PaintingSelector
        focusedPosition={null}
        onSelect={vi.fn()}
        stations={starterExhibition.stations.slice(0, 3)}
      />,
    );

    expect(
      [...html.matchAll(/<option\b([^>]*)>(.*?)<\/option>/g)].filter(
        ([, attributes]) => !attributes?.includes('hidden'),
      ),
    ).toHaveLength(3);
    expect(html).toContain('<option value="2">3</option>');
    expect(html).not.toContain('>4</option>');
  });
});
