import React, { useState, useRef, useEffect } from 'react';
import CommonTooltip from './commonTooltip';

const ExpandableTextCell = ({ text, maxLines = 4, fontSize = 12 }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef(null);

  const lineHeight = 1.5;
  const maxHeight = maxLines * fontSize * lineHeight;

  useEffect(() => {
    if (ref.current) {
      setIsTruncated(ref.current.scrollHeight > ref.current.clientHeight + 1);
    }
  }, [text]);

  if (!text || text === '-' || text === 'No Response') {
    return <span style={{ fontSize: `${fontSize}px`, color: '#9ca3af' }}>{text || '—'}</span>;
  }

  const btnStyle = {
    fontSize: '11px',
    color: '#2A68D3',
    background: 'none',
    border: 'none',
    padding: '0 2px',
    cursor: 'pointer',
    fontWeight: 500,
    display: 'inline',
    verticalAlign: 'baseline',
    lineHeight: 'inherit',
  };

  if (expanded) {
    return (
      <div style={{ fontSize: `${fontSize}px`, color: '#374151', lineHeight: lineHeight, wordBreak: 'break-word', whiteSpace: 'normal' }}>
        {text}
        {' '}
        <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(false); }} style={btnStyle}>
          View less
        </button>
      </div>
    );
  }

  return (
    <CommonTooltip title={isTruncated ? text : ''} placement="bottom">
      <div style={{ position: 'relative', fontSize: `${fontSize}px`, color: '#374151', lineHeight: lineHeight, wordBreak: 'break-word', whiteSpace: 'normal' }}>
        <div
          ref={ref}
          style={{ overflow: 'hidden', maxHeight: `${maxHeight}px` }}
        >
          {text}
        </div>
        {isTruncated && (
          <span style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'linear-gradient(to right, transparent, #fff 30%)',
            paddingLeft: '24px',
          }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(true); }} style={btnStyle}>
              ...View more
            </button>
          </span>
        )}
      </div>
    </CommonTooltip>
  );
};

export default ExpandableTextCell;
