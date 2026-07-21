import React, { forwardRef } from 'react'
import { format } from 'date-fns'

interface CertificateTemplateProps {
  userName: string
  courseTitle: string
  totalHours: number
  videosCount: number
  daysTaken: number
  issueDate: Date
  shareToken: string
}

// Helper to prevent html2canvas space collapsing bug
const withNBSP = (text: string) => text.replace(/ /g, '\u00A0')

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(({
  userName,
  courseTitle,
  totalHours,
  videosCount,
  daysTaken,
  issueDate,
  shareToken
}, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '1200px',
        height: '848px',
        display: 'flex',
        backgroundColor: '#FDFCF8',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Load exact fonts for html2canvas to ensure accurate rendering and spacing */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />

      {/* Corner Decorations */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '40px solid transparent',
          borderTop: '40px solid #1A1228',
          zIndex: 10
        }} 
      />
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '40px solid transparent',
          borderBottom: '40px solid #1A1228',
          zIndex: 10
        }} 
      />

      {/* LEFT DECORATIVE PANEL */}
      <div 
        style={{
          width: '220px',
          height: '100%',
          background: 'linear-gradient(160deg, #3B1FA8, #5B3FD4, #7C5CFC)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {/* Decorative Gold Lines */}
        <div style={{ position: 'absolute', top: '30%', width: '60px', height: '2px', backgroundColor: '#C9A84C' }} />
        <div style={{ position: 'absolute', top: '70%', width: '60px', height: '2px', backgroundColor: '#C9A84C' }} />
        
        {/* Rotated Text */}
        <div 
          style={{
            transform: 'rotate(-90deg)',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          {withNBSP('LearnLoop')}
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div 
        style={{
          flex: 1,
          padding: '50px 50px 50px 60px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* TOP SECTION */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <span style={{ color: '#C9A84C', fontSize: '14px' }}>◆</span>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#C9A84C', margin: '0 8px' }} />
          <span style={{ color: '#C9A84C', fontSize: '14px' }}>◆</span>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#C9A84C', margin: '0 8px' }} />
          <span style={{ color: '#C9A84C', fontSize: '14px' }}>◆</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h1 
            style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: '42px', 
              letterSpacing: '8px', 
              color: '#1A1228', 
              fontWeight: 700,
              margin: '0 0 10px 0'
            }}
          >
            {withNBSP('CERTIFICATE')}
          </h1>
          <h2 
            style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: '14px', 
              letterSpacing: '6px', 
              color: '#7C5CFC', 
              fontWeight: 400,
              margin: 0
            }}
          >
            {withNBSP('OF COMPLETION')}
          </h2>
          <div style={{ width: '60%', height: '1px', backgroundColor: '#7C5CFC', margin: '20px auto 0 auto', opacity: 0.3 }} />
        </div>

        {/* MIDDLE SECTION */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#6B6880', margin: '0 0 10px 0' }}>
            {withNBSP('This certifies that')}
          </p>
          
          <div style={{ display: 'inline-block', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: '"Syne", sans-serif', fontSize: '48px', color: '#1A1228', fontWeight: 700, margin: 0 }}>
              {withNBSP(userName || 'Anonymous Learner')}
            </h3>
            <div style={{ width: '80%', height: '2px', backgroundColor: '#C9A84C', margin: '5px auto 0 auto' }} />
          </div>

          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#6B6880', margin: '0 0 15px 0' }}>
            {withNBSP('has successfully completed')}
          </p>

          <h4 style={{ fontFamily: '"Syne", sans-serif', fontSize: '22px', color: '#3B1FA8', fontWeight: 600, margin: '0 0 25px 0', maxWidth: '80%', lineHeight: 1.4 }}>
            {withNBSP(courseTitle)}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <span style={{ color: '#C9A84C', fontSize: '12px' }}>◆</span>
            <div style={{ width: '100px', height: '1px', backgroundColor: '#C9A84C' }} />
            <span style={{ color: '#C9A84C', fontSize: '12px' }}>◆</span>
          </div>

          {/* STATS ROW */}
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '13px', color: '#4A4560', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span>{withNBSP(`${totalHours} Hours Watched`)}</span>
            <span style={{ color: '#C9A84C' }}>•</span>
            <span>{withNBSP(`${videosCount} Videos Completed`)}</span>
            <span style={{ color: '#C9A84C' }}>•</span>
            <span>{withNBSP(`Completed in ${daysTaken} Days`)}</span>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#C9A84C', opacity: 0.5, marginBottom: '20px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          
          {/* LEFT: Signature */}
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ fontFamily: '"Syne", sans-serif', fontStyle: 'italic', fontSize: '24px', color: '#1A1228', marginBottom: '5px' }}>
              {withNBSP('LearnLoop')}
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#1A1228', opacity: 0.2, marginBottom: '8px' }} />
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#6B6880', letterSpacing: '1px' }}>
              {withNBSP(`Issued: ${format(new Date(issueDate), 'MMMM d, yyyy')}`)}
            </div>
          </div>

          {/* CENTER: Gold Seal */}
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, #C9A84C 0%, #A07830 100%)',
              border: '3px solid #C9A84C',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(201, 168, 76, 0.4)',
              color: 'white'
            }}
          >
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '24px', lineHeight: 1 }}>LL</div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '8px', letterSpacing: '1px', margin: '2px 0 0 0' }}>VERIFIED</div>
          </div>

          {/* RIGHT: ID */}
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '14px', color: '#1A1228', marginBottom: '15px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
              {withNBSP('Authorized')}
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#1A1228', opacity: 0.2, marginBottom: '8px' }} />
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#6B6880', letterSpacing: '1px' }}>
              {withNBSP(`Certificate ID: ${shareToken.substring(0, 8)}`)}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
})

CertificateTemplate.displayName = 'CertificateTemplate'
