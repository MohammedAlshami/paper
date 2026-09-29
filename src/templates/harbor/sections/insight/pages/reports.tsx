import * as React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { MultiSelect } from '@/components/app/multi-select';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENT_USER, LOCATIONS, TODAY, addDays, formatDate, formatTime } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';
import { REPORT_FORMATS, REPORT_TYPES, SEED_REPORTS, type GeneratedReport } from '../insight-data';

const typeName = (id: string) => REPORT_TYPES.find((type) => type.id === id)?.title ?? id;

const shortRange = (range: DateRange) => {
  const fmt = (iso: string) => formatDate(iso, { day: 'numeric', month: 'short' });
  return range.from && range.to ? (range.from === range.to ? fmt(range.from) : `${fmt(range.from)} – ${fmt(range.to)}`) : 'All time';
};

/** Build a report, then find it again in the history. */
export function ReportsPage() {
  const { actions } = useHarbor();
  const { toast } = useToast();
  const [type, setType] = React.useState(REPORT_TYPES[0].id);
  const [range, setRange] = React.useState<DateRange>({ from: addDays(TODAY, -6), to: TODAY });
  const [places, setPlaces] = React.useState<string[]>([]);
  const [format, setFormat] = React.useState('pdf');
  const [reports, setReports] = React.useState<GeneratedReport[]>(SEED_REPORTS);
  const [pendingDelete, setPendingDelete] = React.useState<GeneratedReport | null>(null);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const download = (report: GeneratedReport) => toast({ title: `Downloading ${typeName(report.typeId)}`, description: `${report.format}, ${report.size}`, variant: 'success' });

  const generate = () => {
    const id = `rp-${Date.now()}`;
    const label = REPORT_FORMATS.find((item) => item.value === format)?.label ?? format;
    const report: GeneratedReport = {
      id,
      typeId: type,
      range: shortRange(range),
      format: label,
      locations: places.length ? `${places.length} location${places.length === 1 ? '' : 's'}` : 'All locations',
      requestedBy: CURRENT_USER.name,
      createdAt: new Date().toISOString(),
      size: '—',
      status: 'generating',
    };
    setReports((list) => [report, ...list]);
    actions.log('generated the report', typeName(type), 'settings');
    toast({ title: `Generating ${typeName(type)}`, description: 'It appears in the list when it is ready.' });
    timers.current.push(
      window.setTimeout(() => {
        const ready = { ...report, status: 'ready' as const, size: `${60 + Math.round(Math.random() * 140)} KB` };
        setReports((list) => list.map((item) => (item.id === id ? ready : item)));
        toast({ title: `${typeName(type)} is ready`, variant: 'success', action: { label: 'Download', onClick: () => download(ready) } });
      }, 1600),
    );
  };

  const columns: DataColumn<GeneratedReport>[] = [
    {
      id: 'name',
      header: 'Report',
      sortValue: (row) => typeName(row.typeId),
      cell: (row) => (
        <span className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex flex-col">
            <span className="font-medium">{typeName(row.typeId)}</span>
            <span className="text-xs text-muted-foreground">
              {row.range} · {row.locations}
            </span>
          </span>
        </span>
      ),
    },
    { id: 'format', header: 'Format', hideBelow: 'sm', sortValue: (row) => row.format, cell: (row) => <Badge variant="outline">{row.format}</Badge> },
    { id: 'by', header: 'Requested by', hideBelow: 'lg', sortValue: (row) => row.requestedBy, cell: (row) => row.requestedBy },
    { id: 'created', header: 'Created', hideBelow: 'md', sortValue: (row) => row.createdAt, cell: (row) => <span className="font-mono text-xs tabular-nums">{formatDate(row.createdAt)}, {formatTime(row.createdAt)}</span> },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => (row.status === 'ready' ? <span className="font-mono text-xs tabular-nums text-muted-foreground">{row.size}</span> : <Badge>Generating</Badge>),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <span className="flex justify-end gap-1">
          <Button size="icon-sm" variant="ghost" aria-label={`Download ${typeName(row.typeId)}`} disabled={row.status !== 'ready'} onClick={(event) => { event.stopPropagation(); download(row); }}>
            <Download />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label={`Delete ${typeName(row.typeId)}`} onClick={(event) => { event.stopPropagation(); setPendingDelete(row); }}>
            <Trash2 />
          </Button>
        </span>
      ),
    },
  ];

  const active = REPORT_TYPES.find((item) => item.id === type);

  return (
    <HarborPage title="Reports" description="Choose what to measure, for which days and places, and get a file back.">
      <div className="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold">New report</p>
            <p className="text-xs text-muted-foreground">{active?.description}</p>
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-type">Report</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="report-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Days</Label>
              <DateRangePicker value={range} onChange={setRange} today={TODAY} className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Locations</Label>
              <MultiSelect
                value={places}
                onChange={setPlaces}
                placeholder="All locations"
                options={LOCATIONS.map((location) => ({ value: location.id, label: location.name, description: location.kind === 'store' ? 'Store' : 'Warehouse' }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="report-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_FORMATS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={!range.from}>
              Generate report
            </Button>
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-bold">History</h2>
          <DataTable
            rows={reports}
            columns={columns}
            getRowId={(row) => row.id}
            searchText={(row) => `${typeName(row.typeId)} ${row.requestedBy} ${row.range}`}
            searchPlaceholder="Search reports"
            defaultSort={{ id: 'created', dir: 'desc' }}
            pageSize={8}
            pageSizes={[8, 20]}
            emptyTitle="No reports yet"
            emptyDescription="Generate one on the left."
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        title="Delete this report?"
        description={pendingDelete ? `${typeName(pendingDelete.typeId)}, ${pendingDelete.range}. The file is removed and cannot be downloaded again.` : ''}
        confirmLabel="Delete report"
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          setReports((list) => list.filter((item) => item.id !== pendingDelete.id));
          actions.log('deleted the report', typeName(pendingDelete.typeId), 'settings');
          toast({ title: 'Report deleted' });
        }}
      />
    </HarborPage>
  );
}
