import React, { useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TruncatedTextCellProps {
  text: string;
  maxLength?: number;
  className?: string;
}

const TruncatedTextCell: React.FC<TruncatedTextCellProps> = ({ 
  text, 
  maxLength = 100,
  className = "text-muted-foreground text-sm"
}) => {
  const shouldTruncate = text && text.length > maxLength;
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;
  
  // If the text doesn't need truncation, return a simple cell
  if (!shouldTruncate) {
    return (
      <TableCell>
        <div className={className}>
          {text}
        </div>
      </TableCell>
    );
  }
  
  // If the text needs truncation, use a tooltip
  return (
    <TableCell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${className} cursor-help`}>
              {displayText}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md p-4 text-sm break-words">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

export default TruncatedTextCell;