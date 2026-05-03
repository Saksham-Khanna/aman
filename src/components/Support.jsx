import React, { useState } from 'react';

const Support = ({ user, showToast }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do I create a new task?",
      a: "Click the '+' button in the bottom-right corner of the dashboard to open the Task Creator. Fill in the title, description, and priority level, then click 'Create Task'.",
      solution: "The floating action button is globally accessible. For best results, assign the task to a specific team and set a clear deadline."
    },
    {
      q: "Can I delete a task I created?",
      a: "No, task deletion is restricted to Administrators to maintain audit integrity.",
      solution: "If you made a mistake, mark the task as 'Completed' or contact your team Administrator to have it removed from the timeline."
    },
    {
      q: "How do team assignments work?",
      a: "Administrators assign tasks to organizations (Teams). All members of that team gain visibility and responsibility for the task automatically.",
      solution: "Check your Task Board daily. Tasks assigned to your specific teams will appear in your personal pipeline along with tasks assigned directly to you."
    },
    {
      q: "What are the different priority levels?",
      a: "We use three levels: High (Critical/Urgent), Medium (Standard Operational), and Low (Non-urgent improvement).",
      solution: "Priority levels determine the card accent color and sorting order on your dashboard. High-priority tasks are highlighted in red for maximum visibility."
    },
    {
      q: "How do I update my password?",
      a: "Go to the Settings tab in the sidebar. You'll find a Security section where you can securely update your credentials.",
      solution: "Ensure your new password is at least 6 characters long and includes a mix of characters for maximum security. You'll need your current password to verify the change."
    }
  ];

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-all duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
           <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Knowledge Base</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Help Center</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl">
          Empowering your team with the documentation and support needed for seamless collaboration. Explore our frequent inquiries and expert solutions below.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">quiz</span>
            Frequent Inquiries
          </h3>
          {faqs.map((faq, i) => (
            <div key={i} className={`group bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-500 overflow-hidden ${activeFaq === i ? 'ring-2 ring-primary/20 shadow-xl' : 'hover:shadow-lg'}`}>
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between group"
              >
                <span className={`font-bold transition-colors ${activeFaq === i ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{faq.q}</span>
                <span className={`material-symbols-outlined transition-transform duration-500 ${activeFaq === i ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
                  expand_more
                </span>
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-500">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {faq.a}
                  </p>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-indigo-500 text-base">lightbulb</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Expert Solution</span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">
                        "{faq.solution}"
                     </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="space-y-8">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4">Direct Support</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                Our administrative team is available for platform customization, enterprise integrations, and high-priority troubleshooting.
              </p>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                       <span className="material-symbols-outlined">alternate_email</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500">Email Address</p>
                       <p className="text-xs font-bold">support@taskflow.internal</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center">
                       <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500">Internal Slack</p>
                       <p className="text-xs font-bold">#support-taskflow</p>
                    </div>
                 </div>
              </div>

              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                Submit Support Ticket
              </button>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
             <h4 className="font-black text-slate-800 dark:text-white mb-2 tracking-tight">Enterprise Compliance</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
               All support interactions are logged and archived for quality assurance and regulatory compliance. Our response time objective (RTO) is 4 hours for priority incidents.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Support;
