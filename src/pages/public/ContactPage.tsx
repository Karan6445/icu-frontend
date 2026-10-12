import React, { useState } from 'react';
import { Send, CheckCircle2, Building2, Phone, Mail, AlertCircle } from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, validateEmail } from '../../utils/validation';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-clinical-navy">Request a Hospital Demonstration</h1>
        <p className="text-slate-600 text-xs">Connect your ICU bedside devices to the INTELLIGENT ICU Clinical Action Engine.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-clinical-md max-w-2xl mx-auto">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Demonstration Request Submitted</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Our clinical engineering team will contact your hospital IT department within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const emailValidation = validateEmail(email, 'Work email', true);
              if (emailValidation !== true) {
                setEmailError(emailValidation);
                return;
              }
              setEmailError(null);

              const phoneValidation = validate10DigitPhone(phone, 'Phone number', true);
              if (phoneValidation !== true) {
                setPhoneError(phoneValidation);
                return;
              }
              setPhoneError(null);
              setSubmitted(true);
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinician / Manager Name</label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Ananya Roy"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-clinical-blue"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital / Medical Center</label>
                <input
                  required
                  type="text"
                  placeholder="Central Super-Specialty Hospital"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-clinical-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="ananya.roy@hospital.org"
                  className={`w-full p-2.5 bg-slate-50 border ${
                    emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-clinical-blue'
                  } rounded-lg focus:outline-none transition-colors`}
                />
                {emailError && (
                  <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3 inline shrink-0" />
                    {emailError}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Phone Number *</label>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    clean10DigitPhone(phone).length === 10
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-slate-400 bg-slate-100'
                  }`}>
                    {clean10DigitPhone(phone).length}/10 digits
                  </span>
                </div>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(clean10DigitPhone(e.target.value));
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="10-digit mobile number"
                  className={`w-full p-2.5 bg-slate-50 border ${
                    phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-clinical-blue'
                  } rounded-lg font-mono focus:outline-none transition-colors`}
                />
                {phoneError && (
                  <span className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline shrink-0" />
                    {phoneError}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ICU Beds Count</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-clinical-blue">
                <option>10 - 25 Beds</option>
                <option>26 - 50 Beds</option>
                <option>50+ Beds (Multi-Unit)</option>
                <option>Multi-Hospital Command Center</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bedside Device Brands in Use</label>
              <input
                type="text"
                placeholder="e.g. Mindray, Philips, Hamilton, Draeger, B. Braun"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-clinical-blue"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deployment Requirements</label>
              <textarea
                rows={4}
                placeholder="Mention on-premise requirements, EHR integration (HL7/FHIR), or tele-ICU needs..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-clinical-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-clinical-blue hover:bg-blue-600 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request for Demonstration</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
