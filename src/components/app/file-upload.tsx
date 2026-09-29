'use client';

import * as React from 'react';
import { CircleAlert, File as FileIcon, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadItem {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  /** 0 to 100. */
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

const formatSize = (bytes: number) => (bytes < 1024 ** 2 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`);

/**
 * FileUpload — a drop zone and the list of files under it, each with a progress bar. It does no networking: by
 * default it animates the progress so the flow can be seen, and you can drive it yourself instead by passing
 * `items` and `onFiles` (send the files, then update the items).
 */
export function FileUpload({
  items,
  defaultItems = [],
  onFiles,
  onRemove,
  onChange,
  accept,
  multiple = true,
  maxSizeMb = 10,
  hint,
  simulate = true,
  accentColor = '#ec4899',
  className,
}: {
  /** Controlled list. Leave it out and the component keeps its own. */
  items?: UploadItem[];
  defaultItems?: UploadItem[];
  /** Called with the accepted files; start your upload here. */
  onFiles?: (files: File[]) => void;
  onRemove?: (item: UploadItem) => void;
  onChange?: (items: UploadItem[]) => void;
  /** The input's accept attribute, e.g. "image/*,.pdf". */
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  hint?: string;
  /** Animate progress for files the component keeps itself. */
  simulate?: boolean;
  accentColor?: string;
  className?: string;
}) {
  const [inner, setInner] = React.useState<UploadItem[]>(defaultItems);
  const list = items ?? inner;
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const counter = React.useRef(0);

  const update = React.useCallback(
    (updater: (current: UploadItem[]) => UploadItem[]) => {
      setInner((current) => {
        const next = updater(current);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  React.useEffect(() => {
    if (!simulate || items) return;
    if (!inner.some((item) => item.status === 'uploading')) return;
    const timer = window.setInterval(() => {
      update((current) =>
        current.map((item): UploadItem => {
          if (item.status !== 'uploading') return item;
          const progress = Math.min(100, item.progress + 12 + Math.random() * 14);
          return progress >= 100 ? { ...item, progress: 100, status: 'done' } : { ...item, progress };
        }),
      );
    }, 350);
    return () => window.clearInterval(timer);
  }, [inner, simulate, items, update]);

  const add = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const accepted: File[] = [];
    const rejected: UploadItem[] = [];
    for (const file of incoming) {
      if (file.size > maxSizeMb * 1024 ** 2) rejected.push({ id: `f${counter.current++}`, name: file.name, size: file.size, progress: 0, status: 'error', error: `Larger than ${maxSizeMb} MB` });
      else accepted.push(file);
    }
    onFiles?.(accepted);
    if (!items) update((current) => [...current, ...rejected, ...accepted.map((file) => ({ id: `f${counter.current++}`, name: file.name, size: file.size, progress: 0, status: 'uploading' as const }))]);
  };

  const remove = (item: UploadItem) => {
    onRemove?.(item);
    if (!items) update((current) => current.filter((candidate) => candidate.id !== item.id));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          add(event.dataTransfer.files);
        }}
        className={cn('flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors', dragging ? 'bg-muted' : 'bg-transparent')}
        style={dragging ? { borderColor: accentColor } : undefined}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="text-sm">
          Drop {multiple ? 'files' : 'a file'} here, or{' '}
          <Button type="button" variant="link" className="h-auto p-0 underline underline-offset-2" onClick={() => inputRef.current?.click()}>
            browse
          </Button>
        </p>
        <p className="text-xs text-muted-foreground">{hint ?? `Up to ${maxSizeMb} MB each`}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose files"
          onChange={(event) => {
            if (event.target.files) add(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {list.length ? (
        <ul className="divide-y rounded-lg border">
          {list.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              {item.status === 'error' ? <CircleAlert className="size-4 shrink-0" style={{ color: accentColor }} /> : <FileIcon className="size-4 shrink-0 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm">{item.name}</p>
                  <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{item.status === 'error' ? item.error : item.status === 'done' ? formatSize(item.size) : `${Math.round(item.progress)}%`}</p>
                </div>
                {item.status === 'uploading' ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(item.progress)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full transition-[width]" style={{ width: `${item.progress}%`, background: accentColor }} />
                  </div>
                ) : null}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => remove(item)} aria-label={`Remove ${item.name}`}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
