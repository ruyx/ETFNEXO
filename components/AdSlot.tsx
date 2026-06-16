'use client';

import '../app/styles/components/ads.css';

interface AdSlotProps {
  placement: 'sidebar_top' | 'sidebar_bottom' | 'article_top' | 'article_mid' | 'article_bottom' | 'feed_inline' | 'header' | 'footer';
  className?: string;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  // MINIMAL TEST VERSION - Just render a bright colored box
  return (
    <div
      style={{
        width: '100%',
        minHeight: '300px',
        backgroundColor: '#ff0000',
        border: '10px solid #0000ff',
        padding: '40px',
        margin: '40px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <div>
        MINIMAL TEST AD
        <br />
        Placement: {placement}
        <br />
        If you see this, component is rendering
      </div>
    </div>
  );
}
