import { MtCollectionLayoutComponent } from '../MtCollection';

/** Default row component used when no renderEntry is provided. */
function DefaultTableEntry({ entry }: { entry: any }) {
  return <div className="flex items-center px-6 border-b border-[#2A2A2A] h-[44px] bg-[#141414]">{entry.id}</div>;
}

export const MtCollectionTableLayout: MtCollectionLayoutComponent = (props) => {
  const EntryComponent = props.renderEntry ?? DefaultTableEntry;

  return (
    <div>
      <h1>Table Layout</h1>
      {props.entries.map((entry) => (
        <EntryComponent key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
