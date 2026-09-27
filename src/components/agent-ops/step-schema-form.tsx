'use client';

import * as React from 'react';
import { Braces, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type SchemaField = {
  name: string;
  label?: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'json';
  description?: string;
  required?: boolean;
  options?: string[];
  default?: string | number | boolean;
};

export type FieldValues = Record<string, string | number | boolean>;

/**
 * StepSchemaForm — a form generated from a step's declared inputs, with the payload
 * it will send in view. This is the "edit the input before you fork" surface.
 */
export function StepSchemaForm({
  title = 'Step inputs',
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Run with these inputs',
  className,
}: {
  title?: string;
  fields: SchemaField[];
  values: FieldValues;
  onChange?: (values: FieldValues) => void;
  onSubmit?: (values: FieldValues) => void;
  submitLabel?: string;
  className?: string;
}) {
  const [local, setLocal] = React.useState<FieldValues>(values ?? {});
  const current = onChange ? values : local;
  const update = (name: string, value: string | number | boolean) => {
    const next = { ...current, [name]: value };
    setLocal(next);
    onChange?.(next);
  };

  const payload = JSON.stringify(current, null, 2);

  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className="font-mono">
          {fields.length} fields
        </Badge>
      </CardHeader>

      <Separator />
      <CardContent className="grid gap-4 py-4">
        {fields.map((field) => {
          const value = current[field.name];
          return (
            <div key={field.name} className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor={`field-${field.name}`}>{field.label ?? field.name}</Label>
                <Badge variant="secondary" className="font-mono">
                  {field.type}
                </Badge>
                {field.required ? <Badge variant="outline">required</Badge> : null}
              </div>

              {field.type === 'enum' ? (
                <div className="flex flex-wrap gap-1.5">
                  {(field.options ?? []).map((option) => (
                    <button key={option} type="button" onClick={() => update(field.name, option)} aria-pressed={value === option}>
                      <Badge variant={value === option ? 'default' : 'outline'} className="font-mono">
                        {option}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : field.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    id={`field-${field.name}`}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => update(field.name, event.target.checked)}
                    className="size-4 accent-foreground"
                  />
                  {String(value)}
                </label>
              ) : field.type === 'json' ? (
                <Textarea
                  id={`field-${field.name}`}
                  value={String(value ?? '')}
                  rows={4}
                  onChange={(event) => update(field.name, event.target.value)}
                  className="font-mono text-xs leading-relaxed"
                />
              ) : (
                <Input
                  id={`field-${field.name}`}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={String(value ?? '')}
                  onChange={(event) => update(field.name, field.type === 'number' ? Number(event.target.value) : event.target.value)}
                  className="font-mono text-xs"
                />
              )}

              {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
            </div>
          );
        })}
      </CardContent>

      <Separator />
      <div className="grid gap-2 px-6 py-4">
        <div className="flex items-center gap-2">
          <Braces className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">payload</span>
        </div>
        <pre className="max-h-48 overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs leading-relaxed">{payload}</pre>
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={() => onSubmit?.(current)}>
            <Wand2 /> {submitLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
