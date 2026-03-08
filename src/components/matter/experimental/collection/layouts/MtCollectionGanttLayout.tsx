import { MtCollectionLayoutComponent } from '../MtCollection';

/** Default row component used when no renderEntry is provided. */
function DefaultGanttEntry({ entry }: { entry: any }) {
  return <div className="flex items-center px-6 border-b border-[#2A2A2A] h-11 bg-[#141414]">{entry.id}</div>;
}

export const MtCollectionGanttLayout: MtCollectionLayoutComponent = (props) => {
  const EntryComponent = props.renderEntry ?? DefaultGanttEntry;

  return (
    <div>
      <h1>Gantt Layout</h1>
      {props.entries.map((entry) => (
        <EntryComponent key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
