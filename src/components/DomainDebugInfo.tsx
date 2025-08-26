'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DomainDebugInfoProps {
  serverDomainInfo?: {
    hostname: string;
    locale: string;
    domain: string;
    isMainDomain: boolean;
  };
}

export default function DomainDebugInfo({ serverDomainInfo }: DomainDebugInfoProps) {
  const params = useParams();
  const pathname = usePathname();
  const [clientHostname, setClientHostname] = useState<string>('');

  useEffect(() => {
    setClientHostname(window.location.hostname);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      {/* <h3 className="font-bold mb-2">🔍 Domain Debug Info</h3> */}
      
      <div className="space-y-1">
        <div><strong>Client Host:</strong> {clientHostname}</div>
        <div><strong>Server Host:</strong> {serverDomainInfo?.hostname || 'N/A'}</div>
        <div><strong>Pathname:</strong> {pathname}</div>
        <div><strong>Params Locale:</strong> {params.locale}</div>
        <div><strong>Domain Locale:</strong> {serverDomainInfo?.locale || 'N/A'}</div>
        <div><strong>Is Main Domain:</strong> {serverDomainInfo?.isMainDomain ? 'Yes' : 'No'}</div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-500">
        <div className="text-[10px] text-gray-300">
          Test different URLs to see middleware behavior
        </div>
      </div>
    </div>
  );
} 