import { ReactNode } from 'react';

type MatrixOption<T extends string> = { value: T; label?: string };
type MatrixAxis<T extends string> = { label: string; options: MatrixOption<T>[] };

interface StoryMatrixProps<
  TRow extends string,
  TColumn extends string,
  TSection extends string,
  TGroup extends string = never,
> {
  rows: MatrixAxis<TRow>;
  columns: MatrixAxis<TColumn>;
  sections: MatrixAxis<TSection>;
  groups?: MatrixAxis<TGroup>;
  renderCell: (row: TRow, column: TColumn, section: TSection, group?: TGroup) => ReactNode;
  className?: string;
}

const txt = (opt: MatrixOption<string>) => opt.label ?? opt.value;

export function StoryMatrix<
  TRow extends string,
  TColumn extends string,
  TSection extends string,
  TGroup extends string = never,
>({ rows, columns, sections, groups, renderCell, className }: StoryMatrixProps<TRow, TColumn, TSection, TGroup>) {
  const showSectionLabel = sections.options.length > 1;
  const showGroupLabel = (groups?.options.length ?? 0) > 1;
  const groupEntries = groups?.options ?? ([undefined] as (MatrixOption<TGroup> | undefined)[]);
  const colCount = groupEntries.length * columns.options.length;

  return (
    <div className={`flex flex-col gap-10 ${className ?? ''}`}>
      {sections.options.map((section) => (
        <section key={section.value} className="flex flex-col gap-3">
          {showSectionLabel && (
            <h3 className="text-xs font-medium uppercase tracking-widest text-text-primary">{txt(section)}</h3>
          )}

          <div className="overflow-auto">
            <div
              className="grid min-w-max gap-x-3 gap-y-2"
              style={{ gridTemplateColumns: `auto repeat(${colCount}, 1fr)` }}
            >
              {/* Corner */}
              <div />

              {/* Column headers — group stacked above column when groups exist */}
              {groupEntries.flatMap((group) =>
                columns.options.map((col) => (
                  <div
                    key={`${group?.value ?? ''}-${col.value}`}
                    className="flex flex-col items-center justify-end gap-0.5 pb-2"
                  >
                    {showGroupLabel && group && (
                      <span className="text-[9px] uppercase tracking-widest text-text-primary">{txt(group)}</span>
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
                      {txt(col)}
                    </span>
                  </div>
                )),
              )}

              {/* Rows */}
              {rows.options.map((row) => (
                <div key={row.value} className="contents">
                  <div className="flex min-h-14 items-center justify-center px-4 text-[10px] font-medium uppercase tracking-widest text-text-muted">
                    {txt(row)}
                  </div>

                  {groupEntries.flatMap((group) =>
                    columns.options.map((col) => (
                      <div
                        key={`${row.value}-${group?.value ?? ''}-${col.value}`}
                        className="flex min-h-14 items-center justify-center rounded-lg bg-white/5 p-3"
                      >
                        {renderCell(row.value, col.value, section.value, group?.value)}
                      </div>
                    )),
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
