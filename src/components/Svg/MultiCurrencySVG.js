import React, { memo } from 'react';

const MultiCurrencySVG = memo(() => {
    return (
        <svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#fff" stroke="#000" strokeWidth="2" />
            <circle cx="32" cy="32" r="10" fill="#00b0f0" stroke="#000" strokeWidth="2" />
            <path d="M32 22a10 10 0 0 1 0 20" fill="none" stroke="#000" strokeWidth="2" />
            <path d="M32 22a10 10 0 0 0 0 20" fill="none" stroke="#000" strokeWidth="2" />
            <path d="M22 32a10 10 0 0 1 20 0" fill="none" stroke="#000" strokeWidth="2" />
            <path d="M22 32a10 10 0 0 0 20 0" fill="none" stroke="#000" strokeWidth="2" />
            <path d="M27 32h10" fill="none" stroke="#000" strokeWidth="2" />
            <path d="M32 27v10" fill="none" stroke="#000" strokeWidth="2" />
            <circle cx="12" cy="12" r="6" fill="#ffb300" stroke="#000" strokeWidth="2" />
            <text x="9" y="15" fontFamily="Arial" fontSize="8" fill="#000">$</text>
            <circle cx="52" cy="12" r="6" fill="#ffb300" stroke="#000" strokeWidth="2" />
            <text x="49" y="15" fontFamily="Arial" fontSize="8" fill="#000">€</text>
            <circle cx="12" cy="52" r="6" fill="#ffb300" stroke="#000" strokeWidth="2" />
            <text x="9" y="55" fontFamily="Arial" fontSize="8" fill="#000">£</text>
            <circle cx="52" cy="52" r="6" fill="#ffb300" stroke="#000" strokeWidth="2" />
            <text x="49" y="55" fontFamily="Arial" fontSize="8" fill="#000">¥</text>
        </svg>
    );
});

const MultiCurrencySVGComponent = memo(({ alt, width = '20px', maxHeight = '15px',display="inline-block"}) => {
    return (
        <div style={{ width, maxHeight,display}} className='img-fluid'>
            <MultiCurrencySVG />
            <span style={{ display: 'none' }}>{alt}</span>
        </div>
    );
});

export default MultiCurrencySVGComponent;
