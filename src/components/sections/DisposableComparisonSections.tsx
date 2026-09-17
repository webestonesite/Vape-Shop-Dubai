"use client";

import React from "react";

export interface PuffCountRow {
  puffCount: string;
  bestFor: string;
  duration: string;
}

export interface DeviceComparisonRow {
  feature: string;
  a: string;
  b: string;
  c: string;
}

export interface DisposableComparisonSettings {
  puffHeading: string;
  puffColumnPuffs: string;
  puffColumnBestFor: string;
  puffColumnDuration: string;
  puffRows: PuffCountRow[];
  puffNote: string;

  deviceHeading: string;
  featureColumnLabel: string;
  deviceA: string;
  deviceB: string;
  deviceC: string;
  deviceRows: DeviceComparisonRow[];
}

const FALLBACK_PUFF_ROWS: PuffCountRow[] = [
  { puffCount: "600–1,500 puffs", bestFor: "Occasional or light users", duration: "1–3 days" },
  { puffCount: "2,000–4,000 puffs", bestFor: "Everyday moderate vaping", duration: "4–7 days" },
  { puffCount: "5,000–8,000 puffs", bestFor: "Regular daily users", duration: "1–2 weeks" },
  { puffCount: "10,000–15,000 puffs", bestFor: "Frequent vapers seeking longer use", duration: "2–3 weeks" },
  { puffCount: "20,000–30,000+ puffs", bestFor: "Heavy users and extended usage", duration: "3–5 weeks" },
];

const FALLBACK_DEVICE_ROWS: DeviceComparisonRow[] = [
  { feature: "Puff Count", a: "Up to 40,000 Puffs", b: "Up to 60,000 Puffs", c: "Up to 12,000 Puffs" },
  { feature: "Nicotine", a: "50mg (5%)", b: "50mg (5%)", c: "50mg (5%)" },
  { feature: "E-Liquid Capacity", a: "Approx. 40ml", b: "Approx. 60ml", c: "Approx. 18ml" },
  { feature: "Battery Capacity", a: "Rechargeable 850mAh", b: "Rechargeable 900mAh", c: "Rechargeable 650mAh" },
  { feature: "Charging Port", a: "USB Type-C", b: "USB Type-C", c: "USB Type-C" },
  { feature: "Display Screen", a: "Smart LED Display", b: "Digital Display", c: "Battery Indicator" },
  { feature: "Coil Technology", a: "Dual Mesh Coil", b: "Advanced Mesh Coil", c: "Mesh Coil" },
  { feature: "Airflow Control", a: "Adjustable Airflow", b: "Adjustable Airflow", c: "Fixed Airflow" },
  { feature: "Flavor Style", a: "Ice & Fruit Blends", b: "Shisha-Inspired Flavors", c: "Classic Fruit & Mint Flavors" },
  { feature: "Best For", a: "Long-lasting premium vaping", b: "Maximum puff longevity", c: "Compact daily vaping" },
  { feature: "Device Type", a: "Rechargeable Disposable", b: "Rechargeable Disposable", c: "Rechargeable Disposable" },
];

const TableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2">
    <span className="w-1 h-5 bg-primary rounded-full inline-block" />
    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-foreground">
      {children}
    </h3>
  </div>
);

const headCell = "py-3.5 px-5 border-r border-white/10";
const bodyCell = "py-3.5 px-5 border-r border-border/30 text-muted-foreground";

export function DisposableComparisonSections({
  settings,
}: { settings?: DisposableComparisonSettings } = {}) {
  const puffRows =
    settings?.puffRows && settings.puffRows.length > 0
      ? settings.puffRows
      : FALLBACK_PUFF_ROWS;

  const deviceRows =
    settings?.deviceRows && settings.deviceRows.length > 0
      ? settings.deviceRows
      : FALLBACK_DEVICE_ROWS;

  // A device column is dropped by clearing its name, so the same table works
  // for two devices or three without a second layout.
  const devices = [
    { name: settings?.deviceA ?? "ELF BAR ICE KING PRO 40000", key: "a" as const },
    { name: settings?.deviceB ?? "AL FAKHER E-HOSE X 60000", key: "b" as const },
    { name: settings?.deviceC ?? "TUGBOAT T12000", key: "c" as const },
  ].filter((device) => device.name.trim());

  const columnWidth = `${100 / (devices.length + 1)}%`;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ── SECTION 1: CHOOSING THE RIGHT PUFF COUNT ── */}
      {puffRows.length > 0 && (
        <div className="space-y-4">
          <TableHeading>
            {settings?.puffHeading || "CHOOSING THE RIGHT PUFF COUNT"}
          </TableHeading>

          <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm bg-card">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-primary text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className={`${headCell} w-1/3`}>
                    {settings?.puffColumnPuffs || "PUFF COUNT"}
                  </th>
                  <th className={`${headCell} w-1/3`}>
                    {settings?.puffColumnBestFor || "BEST FOR"}
                  </th>
                  <th className="py-3.5 px-5 w-1/3">
                    {settings?.puffColumnDuration || "APPROX. DURATION"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium text-foreground/90">
                {puffRows.map((row, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-muted/20 transition-colors ${
                      index % 2 === 1 ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5 font-bold text-foreground border-r border-border/30">
                      {row.puffCount}
                    </td>
                    <td className={bodyCell}>{row.bestFor}</td>
                    <td className="py-3.5 px-5 text-muted-foreground">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {settings?.puffNote !== "" && (
            <p className="text-[11px] text-muted-foreground italic pl-1">
              {settings?.puffNote ||
                "*Puff counts are based on standard draw length. Longer draws will reduce actual count."}
            </p>
          )}
        </div>
      )}

      {/* ── SECTION 2: SIDE-BY-SIDE COMPARISON ── */}
      {deviceRows.length > 0 && devices.length > 0 && (
        <div className="space-y-4">
          <TableHeading>
            {settings?.deviceHeading || "SIDE-BY-SIDE COMPARISON"}
          </TableHeading>

          <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm bg-card">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-primary text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className={headCell} style={{ width: columnWidth }}>
                    {settings?.featureColumnLabel || "FEATURE"}
                  </th>
                  {devices.map((device, index) => (
                    <th
                      key={device.key}
                      className={index === devices.length - 1 ? "py-3.5 px-5" : headCell}
                      style={{ width: columnWidth }}
                    >
                      {device.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium text-foreground/90">
                {deviceRows.map((row, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-muted/20 transition-colors ${
                      index % 2 === 1 ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5 font-bold text-foreground border-r border-border/30">
                      {row.feature}
                    </td>
                    {devices.map((device, deviceIndex) => (
                      <td
                        key={device.key}
                        className={
                          deviceIndex === devices.length - 1
                            ? "py-3.5 px-5 text-muted-foreground"
                            : bodyCell
                        }
                      >
                        {row[device.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
