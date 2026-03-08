import { Tooltip } from 'radix-ui';

interface MtTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant: 'info' | 'error';
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
}

export function MtTooltip(props: MtTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded p-2 border-[#222222] bg-[#111111]"
            side={props.side}
            align={props.align}
            sideOffset={5}
          >
            {props.content}
            <Tooltip.Arrow className="TooltipArrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
