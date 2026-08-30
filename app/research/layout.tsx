import React from 'react';

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 flex flex-col h-full overflow-hidden">{children}</div>;
}
