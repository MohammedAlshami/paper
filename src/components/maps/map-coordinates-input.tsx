'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

function parse(text: string, limit: number) {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

/** MapCoordinatesInput — latitude and longitude fields kept in step with a draggable pin. */
export function MapCoordinatesInput({
  defaultValue,
  onChange,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  defaultValue: LngLat;
  onChange?: (value: LngLat) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [position, setPosition] = React.useState(defaultValue);
  const [latText, setLatText] = React.useState(defaultValue[1].toFixed(5));
  const [lngText, setLngText] = React.useState(defaultValue[0].toFixed(5));
  const [copied, setCopied] = React.useState(false);

  const lat = parse(latText, 90);
  const lng = parse(lngText, 180);

  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true, options: { center: defaultValue, zoom: 13 } });

  const commit = React.useCallback(
    (next: LngLat, fly = false) => {
      setPosition(next);
      onChange?.(next);
      if (fly) map?.easeTo({ center: next, duration: 350 });
    },
    [map, onChange],
  );

  const fromMap = (next: LngLat) => {
    setLatText(next[1].toFixed(5));
    setLngText(next[0].toFixed(5));
    commit(next);
  };

  React.useEffect(() => {
    if (!map || !ready) return;
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => fromMap([event.lngLat.lng, event.lngLat.lat]);
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready]);

  const type = (which: 'lat' | 'lng', text: string) => {
    if (which === 'lat') setLatText(text);
    else setLngText(text);
    const nextLat = which === 'lat' ? parse(text, 90) : lat;
    const nextLng = which === 'lng' ? parse(text, 180) : lng;
    if (nextLat !== null && nextLng !== null) commit([nextLng, nextLat], true);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(`${position[1].toFixed(5)}, ${position[0].toFixed(5)}`).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-2 gap-3 p-4">
        {(
          [
            { id: 'lat' as const, label: 'Latitude', text: latText, valid: lat !== null, hint: '−90 to 90' },
            { id: 'lng' as const, label: 'Longitude', text: lngText, valid: lng !== null, hint: '−180 to 180' },
          ] as const
        ).map((field) => (
          <label key={field.id} className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
            <Input
              value={field.text}
              inputMode="decimal"
              onChange={(event) => type(field.id, event.target.value)}
              aria-invalid={!field.valid}
              className="font-mono tabular-nums"
            />
            <span className={cn('block text-[11px]', field.valid ? 'text-muted-foreground' : 'text-destructive')}>{field.valid ? field.hint : `Enter a number, ${field.hint}`}</span>
          </label>
        ))}
      </div>

      <div className="relative h-52 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={position} draggable onDragEnd={fromMap}>
          <span className="block size-5 cursor-grab rounded-full ring-4 ring-background active:cursor-grabbing" style={{ background: accentColor }} aria-label="Drag to set the location" />
        </MapMarker>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="min-w-0 truncate font-mono text-xs tabular-nums text-muted-foreground">
          {position[1].toFixed(5)}, {position[0].toFixed(5)}
        </p>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}
