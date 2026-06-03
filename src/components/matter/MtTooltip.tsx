import { Tooltip } from 'radix-ui';

interface MtTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant: 'info' | 'error';
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
}

/**
 * Tooltip wrapper. Some common components (like buttons) will have built-in 
 * support for tooltip, with the standardized `tooltip` prop.
 */
export function MtTooltip(props: MtTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="mt-surface-menu p-2"
            side={props.side}
            align={props.align}
            sideOffset={5}
          >
            {props.content}
            <Tooltip.Arrow className="TooltipArrow fill-white/10" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
