"use client";

import { ArrowRight, FileUp } from "lucide-react";

export function HeroSection({ onOpenDocUpload, onStartAssessment }: {
  onOpenDocUpload?: () => void;
  onStartAssessment?: () => void;
}) {
  return (
    <div className="overview-hero">
      <section className="assessment-hero" aria-labelledby="assessment-heading">
        <div className="assessment-copy">
          <h2 id="assessment-heading">Strengthen your survey<br className="desktop-break" /> sampling skills</h2>
          <p>Take a short diagnostic. Get a learning plan<br className="desktop-break" /> built around your gaps.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={onStartAssessment}>Start assessment <ArrowRight aria-hidden="true" /></button>
            <a href="#learning-plan" className="hero-secondary">View learning plan</a>
          </div>
        </div>
        <svg className="learning-illustration" viewBox="0 0 224 170" fill="none" aria-hidden="true">
          <defs><linearGradient id="step-fill" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse"><stop stopColor="#09999c" stopOpacity=".33" /><stop offset="1" stopColor="#0a8093" stopOpacity=".08" /></linearGradient></defs>
          <path d="M10 151h204" stroke="#4584a1" strokeWidth="1" />
          <path d="M16 151v-14h44v14m0 0v-38h48v38m0 0V83h48v68m0 0V47h48v104" fill="url(#step-fill)" stroke="#3ec5c5" strokeWidth="1.2" />
          <path d="M16 140v-32l33-1 34-32 29-1 35-35 26-1 10-11" stroke="#35c9bb" strokeDasharray="3 6" />
          <path d="M183 47V1l19 9-19 8" stroke="#39d1c4" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="16" cy="140" r="4" fill="#53dccb" /><circle cx="16" cy="140" r="8" fill="#53dccb" fillOpacity=".1" />
        </svg>
        <ol className="learning-journey" aria-label="Your learning journey">
          {["Assess", "Learn", "Practise", "Reassess"].map((step, index) => <li key={step}><span>{index + 1}</span>{step}{index < 3 && <ArrowRight aria-hidden="true" />}</li>)}
        </ol>
      </section>
      <section className="manual-update-card" aria-labelledby="manual-heading">
        <span className="update-eyebrow">YOUR MANUALS, REIMAGINED</span>
        <h2 id="manual-heading">New guidance.<br />Clear next steps.</h2>
        <div className="manual-illustration" aria-hidden="true">
          <svg viewBox="0 0 148 61" fill="none"><path d="M8 2h30l14 14v41a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z" fill="#ffffff" fillOpacity=".5" stroke="#69acb3" strokeWidth="1.5" /><path d="M38 2v14h14" stroke="#69acb3" /><path d="M94 2h30l14 14v41a3 3 0 0 1-3 3H94a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z" fill="#fff" fillOpacity=".65" stroke="#008c95" strokeWidth="1.5" /><path d="M124 2v14h14M63 33h15m-6-5 6 5-6 5" stroke="#008c95" strokeWidth="1.5" /><path d="M16 31h22M16 38h16M103 31h22M103 38h16M103 45h20" stroke="#008c95" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <p>Turn manual updates into<br />focused refreshers.</p>
        <button className="outline-action" onClick={onOpenDocUpload}>Explore manuals <FileUp aria-hidden="true" /></button>
      </section>
    </div>
  );
}
