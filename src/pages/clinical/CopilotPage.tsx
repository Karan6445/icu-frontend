import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatient';
import { CopilotMessage } from '../../types/clinical';
import { DataQualityBadge } from '../../components/common/DataQualityBadge';
import { Bot, Send, AlertTriangle, ShieldCheck, Sparkles, ExternalLink, Activity, Wind, Syringe } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient } = usePatient(patientId);

  const initialMessages: CopilotMessage[] = [
    {
      id: 'msg-1',
      sender: 'USER',
      text: 'Summarize the last 6 hours for Bed 04.',
      timestamp: '10:48 IST'
    },
    {
      id: 'msg-2',
      sender: 'COPILOT',
      text: `### Overview\nPatient Ramesh Gupta (Bed 04, ARDS) remained on PRVC mode ventilation. Increased work of breathing noted.\n\n### Meaningful Changes\n- **10:48 IST** — SpO2 desaturation from 96% to 89% (Duration 4 min).\n- **10:45 IST** — MAP decreased from 86 to 69 mmHg.\n- **10:07 IST** — Meropenem IV 1g administered.\n\n### Device State\n- Bedside Monitor: **LIVE** (110ms latency)\n- Ventilator: **CONNECTED** (145ms latency)\n- Infusion Pumps: **RUNNING** (2 active lines)\n\n### Sources\n- 10:48:02 · Philips IntelliVue MX800 Monitor\n- 10:48:00 · Maquet Servo-u Ventilator`,
      timestamp: '10:48 IST',
      citations: [
        { id: 'c1', timestamp: '10:48', source: 'Philips IntelliVue MX800', parameterName: 'SpO2', value: '89%', quality: 'LIVE' },
        { id: 'c2', timestamp: '10:48', source: 'Maquet Servo-u Ventilator', parameterName: 'PEEP', value: '10 cmH2O', quality: 'LIVE' }
      ]
    }
  ];

  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>('');

  const quickPrompts = [
    'Summarize 6h',
    'What changed?',
    'Recent events',
    'Device status',
    'Timeline summary'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      const copilotMsg: CopilotMessage = {
        id: `cop-${Date.now()}`,
        sender: 'COPILOT',
        text: `### Grounded Response\nQuery: "${query}"\n\n### Findings\n- Patient parameters verified against bedside monitor and ventilator telemetry.\n- No unauthorized dosage changes detected.\n\n### Device State\n- All active gateways streaming healthy telemetry (< 3s latency).`,
        timestamp: new Date().toTimeString().split(' ')[0],
        citations: [
          { id: `c-${Date.now()}`, timestamp: '10:48', source: 'Bedside Gateway GW-MICU-01', parameterName: 'Telemetry Bus', value: 'LIVE', quality: 'LIVE' }
        ]
      };
      setMessages(prev => [...prev, copilotMsg]);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              ICU Copilot — Grounded Clinical Assistant
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Grounded in available patient data · Timestamp citations enforced
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Assistive Only · Verify Source Telemetry</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 4 COLUMNS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 font-mono text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs block border-b border-slate-200 dark:border-slate-800 pb-2">
            Active Patient Context ({patient?.bedNumber || 'ICU-04'})
          </span>

          <div className="space-y-2">
            <div className="font-bold text-sm text-slate-900 dark:text-white">{patient?.name || 'Ramesh Gupta'}</div>
            <div className="text-slate-500 dark:text-slate-400">{patient?.age}y / {patient?.gender} · MRN {patient?.mrn}</div>
            <div className="text-teal-600 dark:text-teal-400 font-bold">{patient?.admittingDiagnosis}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span>HR: {String(patient?.vitals.hr.value || '112')} bpm</span>
              <span>SpO2: {String(patient?.vitals.spo2.value || '89')}%</span>
            </div>
            <div className="flex items-center justify-between text-purple-400 font-bold">
              <span>MAP: {String(patient?.vitals.map.value || '69')} mmHg</span>
              <span>RR: {String(patient?.vitals.rr.value || '28')}/min</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            <div>Ventilator: <strong className="text-slate-900 dark:text-white">Maquet Servo-u (PRVC)</strong></div>
            <div>Norepinephrine: <strong className="text-slate-900 dark:text-white">0.12 mcg/kg/min</strong></div>
            <div>Attending: <strong className="text-slate-900 dark:text-white">{patient?.assignedClinician || 'Dr. Rahul Sharma'}</strong></div>
          </div>
        </div>

        {/* RIGHT 8 COLUMNS */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[480px] space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-bold mr-1">Quick Prompts:</span>
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-5 text-xs shadow-xs space-y-3 ${
                      msg.sender === 'USER'
                        ? 'bg-blue-900 text-white rounded-tr-none font-medium'
                        : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none font-mono'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 text-[10px] opacity-75 border-slate-200 dark:border-slate-700">
                      <span className="font-bold uppercase tracking-wider">{msg.sender === 'USER' ? 'Attending Clinician' : 'Grounded ICU Copilot'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                      {msg.text}
                    </div>

                    {msg.citations && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[10px]">
                        <span className="text-purple-700 dark:text-purple-400 font-bold block">Telemetry Citations:</span>
                        {msg.citations.map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                            <span>{c.timestamp} · <strong>{c.parameterName}</strong> ({c.value})</span>
                            <span className="text-slate-400">{c.source}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'Summarize 6h', 'What changed?')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 dark:text-white"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
