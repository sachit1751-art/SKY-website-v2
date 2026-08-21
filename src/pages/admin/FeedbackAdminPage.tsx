import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, MessageSquarePlus, Shield } from 'lucide-react';
import { FeedbackManager } from '../../components/admin/FeedbackManager';
import { SEO } from '../../components/SEO';
import { prefetchAdminPages } from '../../utils/prefetchAdmin';

export const FeedbackAdminPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Community Feedback & Bug Triage Hub | Admin Console"
        description="Review, triage, status-track, and reply to user-submitted bug reports and feature requests for POCO M6 Pro 5G / Redmi 12 5G (sky)."
        canonicalUrl="/admin/feedback"
        noIndex={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link & Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            onMouseEnter={prefetchAdminPages}
            onTouchStart={prefetchAdminPages}
            onFocus={prefetchAdminPages}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors mb-4 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-[#FDE694]/20 border border-[#FDE694]/40 text-[#121212] dark:text-[#FDE694]">
                  <MessageSquarePlus size={24} />
                </span>
                USER FEEDBACK & REPORTS
              </h1>
              <p className="text-sm text-[#787567] dark:text-[#BDB8A4] mt-1 font-medium">
                Triage bug submissions, feature requests, and device questions synced in real-time with Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Manager Component */}
        <FeedbackManager />
      </div>
    </>
  );
};

export default FeedbackAdminPage;
