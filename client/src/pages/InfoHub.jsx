import React, { useState } from 'react';

const INFO_SECTIONS = [
  {
    id: 'about',
    icon: '🏋️',
    title: 'About This Program',
    content: [
      {
        type: 'text',
        text: 'The Rehab Loop is a 12-week progressive calisthenics program designed for rehabilitation and strength building. It combines structured bodyweight training with targeted rehab exercises to help you recover from injury while building functional strength.',
      },
      {
        type: 'feature-list',
        items: [
          '3 workout types (A, B, C) in a weekly rotation',
          '3 progressive phases of 4 weeks each',
          'Flare-up mode for high-pain days',
          'Streak tracking to maintain consistency',
          'Automated email + SMS reminders',
        ],
      },
    ],
  },
  {
    id: 'rotation',
    icon: '🔄',
    title: 'Workout Rotation',
    content: [
      {
        type: 'text',
        text: 'The weekly rotation is designed to balance load across muscle groups and allow adequate recovery between sessions.',
      },
      {
        type: 'schedule',
        days: [
          { day: 'Day 1', workout: 'A', label: 'Upper Body + Core', color: 'bg-blue-100 text-blue-700' },
          { day: 'Day 2', workout: 'B', label: 'Lower Body + Rehab', color: 'bg-purple-100 text-purple-700' },
          { day: 'Day 3', workout: 'A', label: 'Upper Body + Core', color: 'bg-blue-100 text-blue-700' },
          { day: 'Day 4', workout: 'B', label: 'Lower Body + Rehab', color: 'bg-purple-100 text-purple-700' },
          { day: 'Day 5', workout: 'C', label: 'Full Body Circuit', color: 'bg-orange-100 text-orange-700' },
          { day: 'Day 6', workout: 'A', label: 'Upper Body + Core', color: 'bg-blue-100 text-blue-700' },
          { day: 'Day 7', workout: 'B', label: 'Lower Body + Rehab / Rest', color: 'bg-purple-100 text-purple-700' },
        ],
      },
    ],
  },
  {
    id: 'phases',
    icon: '📈',
    title: 'Program Phases',
    content: [
      {
        type: 'phases',
        phases: [
          {
            name: 'Foundation',
            weeks: 'Weeks 1-4',
            color: 'border-blue-300 bg-blue-50',
            headerColor: 'text-blue-700',
            description: 'Build the base. Lower volume, form focus. Master the movement patterns before adding intensity.',
            keyPoints: [
              'Incline push-ups (not floor)',
              'Shorter hold times (20-30s)',
              'Lower rep ranges (8-10)',
              'Full rest between sets (60-90s)',
              'Spanish squat 30s holds',
            ],
          },
          {
            name: 'Strength',
            weeks: 'Weeks 5-8',
            color: 'border-purple-300 bg-purple-50',
            headerColor: 'text-purple-700',
            description: 'Progressive overload. Increase reps, hold times, and difficulty variations.',
            keyPoints: [
              'Standard push-ups on floor',
              'Longer holds (35-45s)',
              'Higher rep ranges (10-12)',
              'Single-leg progressions',
              'Spanish squat 45s holds',
            ],
          },
          {
            name: 'Advanced',
            weeks: 'Weeks 9-12',
            color: 'border-orange-300 bg-orange-50',
            headerColor: 'text-orange-700',
            description: 'High intensity and harder variations. Push your limits safely.',
            keyPoints: [
              'Archer / pike push-ups',
              'Maximum duration holds (45-60s)',
              'Bulgarian split squats',
              'Weighted progressions where possible',
              'Spanish squat 60s holds',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'flareup',
    icon: '⚠️',
    title: 'Flare-up Mode',
    content: [
      {
        type: 'text',
        text: 'Flare-up mode is designed for days when your injury is actively painful or aggravated. It removes all lower body loading and replaces Workout B with safer alternatives.',
      },
      {
        type: 'callout',
        variant: 'warning',
        text: 'Listen to your body. Pain is a signal. A flare-up day with modified training is far better than a missed day or making your injury worse.',
      },
      {
        type: 'feature-list',
        title: 'Flare-up mode replaces Workout B with:',
        items: [
          'Spanish squat isometric (shallow, 20s only)',
          'Incline push-ups (upper body volume)',
          'Seated calf raises (minimal load)',
          'Seated tibialis raises',
          'Dead bugs (core stability)',
          'Hip mobility circles',
        ],
      },
      {
        type: 'text',
        text: 'Toggle flare-up mode in Settings. Remember to turn it off when the flare-up subsides so you can return to full progression.',
      },
    ],
  },
  {
    id: 'rehab',
    icon: '🦵',
    title: 'Rehab Principles',
    content: [
      {
        type: 'text',
        text: 'This program is built on evidence-based rehabilitation principles for knee and lower limb recovery.',
      },
      {
        type: 'principles',
        items: [
          {
            title: 'Spanish Squat Isometrics',
            description: 'Isometric loading at different joint angles reduces pain and builds tendon tolerance. The vertical shin position reduces patellofemoral stress.',
          },
          {
            title: 'Tibialis Raises',
            description: 'Strengthening the tibialis anterior improves ankle dorsiflexion, reduces shin splints, and supports patellar tendon health.',
          },
          {
            title: 'Eccentric Calf Raises',
            description: 'Slow eccentric loading is the gold standard for Achilles and patellar tendon rehabilitation. The controlled descent (3s down) is where the adaptation happens.',
          },
          {
            title: 'Progressive Loading',
            description: 'Gradual increase in load across 12 weeks allows tissues to adapt. Jumping ahead will increase injury risk.',
          },
          {
            title: 'Dead Bugs + Core Stability',
            description: 'Strong core reduces compensatory movement patterns that often cause or worsen lower limb injuries.',
          },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'This program is not a substitute for professional medical advice. If you have a diagnosed injury, consult a physiotherapist before starting.',
      },
    ],
  },
  {
    id: 'nutrition',
    icon: '🥗',
    title: 'Recovery & Nutrition',
    content: [
      {
        type: 'feature-list',
        title: 'Key recovery principles:',
        items: [
          'Protein: aim for 1.6-2.2g per kg bodyweight daily',
          'Sleep: 7-9 hours is when most tissue repair happens',
          'Hydration: minimum 2L water per day',
          'Anti-inflammatory foods: turmeric, omega-3, berries',
          'Collagen supplement + vitamin C before training may support tendon health',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        text: 'Rest days are not wasted days. Tissue adaptation and growth happens during recovery, not during the workout itself.',
      },
    ],
  },
  {
    id: 'motivation',
    icon: '🧠',
    title: 'Mindset & Motivation',
    content: [
      {
        type: 'quotes',
        items: [
          { text: 'The comeback is always stronger than the setback.', author: 'Unknown' },
          { text: 'You don\'t have to be extreme, just consistent.', author: 'Unknown' },
          { text: 'Every rep is a vote for the person you want to become.', author: 'James Clear' },
        ],
      },
      {
        type: 'text',
        text: 'Rehabilitation is mentally tough. Progress can feel slow, and setbacks happen. The key is showing up consistently — even on flare-up days, even when motivation is low.',
      },
      {
        type: 'feature-list',
        title: 'Mindset principles:',
        items: [
          'Judge progress over weeks and months, not days',
          'A 10-minute workout beats no workout',
          'Pain-free movement is always the goal',
          'Consistency beats intensity every time',
          'Celebrate small wins — each completed workout is progress',
        ],
      },
    ],
  },
];

function ContentBlock({ block }) {
  switch (block.type) {
    case 'text':
      return <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>;

    case 'feature-list':
      return (
        <div>
          {block.title && <p className="text-sm font-semibold text-gray-700 mb-2">{block.title}</p>}
          <ul className="space-y-1.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-brand-500 mt-0.5 flex-shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'callout':
      const calloutStyles = {
        warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
        info: 'bg-blue-50 border-blue-300 text-blue-800',
        success: 'bg-green-50 border-green-300 text-green-800',
      };
      return (
        <div className={`rounded-xl border p-3 text-sm leading-relaxed ${calloutStyles[block.variant] || calloutStyles.info}`}>
          {block.text}
        </div>
      );

    case 'schedule':
      return (
        <div className="space-y-2">
          {block.days.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-12 flex-shrink-0">{d.day}</span>
              <span className={`badge ${d.color} flex-shrink-0`}>
                {d.workout}
              </span>
              <span className="text-sm text-gray-600">{d.label}</span>
            </div>
          ))}
        </div>
      );

    case 'phases':
      return (
        <div className="space-y-3">
          {block.phases.map((phase, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 ${phase.color}`}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-bold text-sm ${phase.headerColor}`}>{phase.name}</h4>
                <span className="text-xs text-gray-500">{phase.weeks}</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{phase.description}</p>
              <ul className="space-y-1">
                {phase.keyPoints.map((point, j) => (
                  <li key={j} className={`text-xs flex items-start gap-1.5 ${phase.headerColor}`}>
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'principles':
      return (
        <div className="space-y-3">
          {block.items.map((item, i) => (
            <div key={i} className="border-l-2 border-brand-300 pl-3">
              <p className="text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      );

    case 'quotes':
      return (
        <div className="space-y-3">
          {block.items.map((quote, i) => (
            <blockquote key={i} className="bg-gray-50 rounded-xl p-3 border-l-4 border-brand-400">
              <p className="text-sm font-medium text-gray-700 italic">"{quote.text}"</p>
              <p className="text-xs text-gray-400 mt-1">— {quote.author}</p>
            </blockquote>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function AccordionSection({ section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <h2 className="font-semibold text-gray-800">{section.title}</h2>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          {section.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function InfoHub() {
  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Info Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Rehab guidance, protocol & motivation</p>
      </div>

      {/* Quick tips banner */}
      <div className="card bg-gradient-to-r from-brand-600 to-indigo-700 text-white border-0">
        <p className="text-sm font-semibold opacity-80 mb-1">Daily Reminder</p>
        <p className="text-base font-medium leading-snug">
          "Show up consistently. Even a shortened workout beats zero."
        </p>
      </div>

      {/* Sections */}
      {INFO_SECTIONS.map(section => (
        <AccordionSection key={section.id} section={section} />
      ))}
    </div>
  );
}
