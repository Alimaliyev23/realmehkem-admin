import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";

type ChartDatum = { name: string; count: number; fullName?: string };
type TrendDatum = { month: string; count: number };

function clampLabel(s: string, max = 12) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function ChartCard({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {hint ? (
            <div className="mt-0.5 text-xs text-gray-500">{hint}</div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

const PALETTE = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

function buildColorMap(names: string[]) {
  const m = new Map<string, string>();
  let idx = 0;
  for (const n of names) {
    if (!m.has(n)) {
      m.set(n, PALETTE[idx % PALETTE.length]);
      idx++;
    }
  }
  return m;
}

function formatPct(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function PeoplePercentTooltip({ active, payload, label, total }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = Number(item?.value ?? 0);
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow">
      <div className="text-xs text-gray-500">{String(label)}</div>
      <div className="mt-1 text-sm font-semibold">
        {value.toLocaleString()} nəfər{" "}
        <span className="font-medium text-gray-500">({formatPct(pct)})</span>
      </div>
    </div>
  );
}

function SimpleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow">
      <div className="text-xs text-gray-500">{String(label)}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

export function DashboardCharts({
  storeData,
  departmentData,
  hiresByMonth,
}: {
  storeData: ChartDatum[];
  departmentData: ChartDatum[];
  hiresByMonth: TrendDatum[];
}) {
  const storeColorMap = buildColorMap(storeData.map((x) => x.name));
  const deptColorMap = buildColorMap(departmentData.map((x) => x.name));

  const storeTotal = storeData.reduce((s, x) => s + (x.count ?? 0), 0);
  const deptTotal = departmentData.reduce((s, x) => s + (x.count ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Şöbələrə görə" hint="Əməkdaş sayı (və faiz)">
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                barCategoryGap={18}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => clampLabel(String(v), 12)}
                  angle={-10}
                  textAnchor="end"
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={(props) => (
                    <PeoplePercentTooltip {...props} total={deptTotal} />
                  )}
                />
                <Bar dataKey="count" radius={[10, 10, 6, 6]} maxBarSize={56}>
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`dept-cell-${index}`}
                      fill={deptColorMap.get(entry.name) ?? "#2563EB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {departmentData.slice(0, 10).map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: deptColorMap.get(d.name) }}
                />
                <span className="text-gray-600">{d.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Filiallara görə" hint="Əməkdaş sayı (və faiz)">
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={storeData}
                barCategoryGap={18}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => clampLabel(String(v), 12)}
                  angle={-10}
                  textAnchor="end"
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={(props) => (
                    <PeoplePercentTooltip {...props} total={storeTotal} />
                  )}
                />
                <Bar dataKey="count" radius={[10, 10, 6, 6]} maxBarSize={56}>
                  {storeData.map((entry, index) => (
                    <Cell
                      key={`store-cell-${index}`}
                      fill={storeColorMap.get(entry.name) ?? "#10B981"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {storeData.slice(0, 10).map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: storeColorMap.get(s.name) }}
                />
                <span className="text-gray-600">{s.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="İşə qəbul trendi (ay-ay)"
        hint="Zaman üzrə yeni əməkdaşlar"
      >
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hiresByMonth} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<SimpleTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
