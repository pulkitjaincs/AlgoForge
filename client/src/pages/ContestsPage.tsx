import { useState, useEffect, useMemo } from 'react';
import { useContests, useUserContestRatings } from '../hooks/useContests';
import { Contest } from '../api/contests';
import {
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  Search,
  Flame,
  Radio,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORM_THEMES: Record<string, { name: string; bg: string; border: string; text: string; badge: string; accent: string }> = {
  leetcode: {
    name: 'LeetCode',
    bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    accent: '#FFA116',
  },
  codeforces: {
    name: 'Codeforces',
    bg: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    accent: '#3B82F6',
  },
  codechef: {
    name: 'CodeChef',
    bg: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    accent: '#A855F7',
  },
  atcoder: {
    name: 'AtCoder',
    bg: 'from-cyan-500/10 to-teal-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    accent: '#06B6D4',
  },
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${minutes} min`;
};

const formatGoogleCalendarUrl = (contest: Contest) => {
  const startDate = new Date(contest.startTime);
  const endDate = new Date(startDate.getTime() + contest.durationSeconds * 1000);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  const details = `AlgoForge Contest Tracker reminder for ${contest.title} on ${contest.platform}.\nContest Link: ${contest.url}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    contest.title
  )}&dates=${datesParam}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(contest.url)}`;
};

export default function ContestsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [now, setNow] = useState<number>(() => Date.now());

  const { data: contests = [], isLoading, isError } = useContests(selectedPlatform, selectedStatus);
  const { data: userRatings = [] } = useUserContestRatings();

  // Exclude non-contest integrations (e.g. GitHub) from contest standings
  const contestRatings = useMemo(() => {
    return userRatings.filter((r) => r.platform !== 'github');
  }, [userRatings]);

  // Tick every second for live countdown precision
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter contests based on local search
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesPlatform = c.platform.toLowerCase().includes(query);
        if (!matchesTitle && !matchesPlatform) return false;
      }
      return true;
    });
  }, [contests, searchQuery]);

  // Find the next upcoming or live contest for the spotlight countdown
  const spotlightContest = useMemo(() => {
    const live = contests.find((c) => c.status === 'LIVE');
    if (live) return live;
    return contests.find((c) => new Date(c.startTime).getTime() > now);
  }, [contests, now]);

  // Calculate countdown components
  const countdown = useMemo(() => {
    if (!spotlightContest) return null;
    const startMs = new Date(spotlightContest.startTime).getTime();
    const diff = Math.max(0, startMs - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isLive: spotlightContest.status === 'LIVE' };
  }, [spotlightContest, now]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm mb-1">
            <Trophy className="w-4 h-4" />
            <span>Competitive Programming</span>
          </div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Contest Tracker</h1>
          <p className="text-text-muted text-sm mt-1">
            Upcoming competitions from LeetCode, Codeforces, CodeChef, and AtCoder with live countdowns.
          </p>
        </div>
      </div>

      {/* Spotlight Next Contest Countdown */}
      {spotlightContest && countdown && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-bg-elevated to-brand-secondary/10 p-6 md:p-8 shadow-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                {countdown.isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-danger/20 text-danger border border-danger/30 animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    CONTEST IS LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    NEXT COMPETITION
                  </span>
                )}
                <span className={`badge ${PLATFORM_THEMES[spotlightContest.platform]?.badge || ''}`}>
                  {PLATFORM_THEMES[spotlightContest.platform]?.name || spotlightContest.platform}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-text-main">{spotlightContest.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  {new Date(spotlightContest.startTime).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  {new Date(spotlightContest.startTime).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Duration: {formatDuration(spotlightContest.durationSeconds)}
                </span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {!countdown.isLive ? (
                <div className="grid grid-cols-4 gap-2 text-center w-full sm:w-auto">
                  {[
                    { label: 'DAYS', val: countdown.days },
                    { label: 'HRS', val: countdown.hours },
                    { label: 'MIN', val: countdown.minutes },
                    { label: 'SEC', val: countdown.seconds },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-bg-dark/80 backdrop-blur-md border border-border-dark px-3.5 py-2.5 rounded-xl min-w-[64px]"
                    >
                      <div className="text-2xl font-mono font-extrabold text-text-main">
                        {String(item.val).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-text-muted mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 rounded-xl bg-danger/10 border border-danger/30 text-danger font-semibold text-center">
                  Live now! Jump in and submit your solutions.
                </div>
              )}

              <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                <a
                  href={spotlightContest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Enter Contest</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={formatGoogleCalendarUrl(spotlightContest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Contest Ratings Section */}
      {contestRatings.length > 0 && (
        <div className="card p-5 bg-card-dark border border-border-dark space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-primary" />
              <span>Your Linked Contest Standings</span>
            </h3>
            <Link to="/app/integrations" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
              <span>Manage Integrations</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {contestRatings.map((r) => {
              const theme = PLATFORM_THEMES[r.platform] || {
                name: r.platform,
                badge: 'bg-border-dark text-text-main',
                text: 'text-text-main',
              };
              return (
                <div
                  key={r.platform}
                  className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark flex items-center justify-between"
                >
                  <div>
                    <span className={`badge ${theme.badge} text-[10px] mb-1.5`}>{theme.name}</span>
                    <p className="text-xs text-text-muted truncate">@{r.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-main font-mono">{r.rating || '—'}</p>
                    <p className="text-[10px] text-text-muted">
                      Peak: <span className="font-semibold text-text-main">{r.maxRating || r.rating || '—'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Platform Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-bg-elevated border border-border-dark rounded-xl">
          {[
            { id: 'all', name: 'All Platforms' },
            { id: 'leetcode', name: 'LeetCode' },
            { id: 'codeforces', name: 'Codeforces' },
            { id: 'codechef', name: 'CodeChef' },
            { id: 'atcoder', name: 'AtCoder' },
          ].map((tab) => {
            const active = selectedPlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPlatform(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  active
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main hover:bg-border-dark/50'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contest title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-bg-elevated border border-border-dark text-text-main placeholder:text-text-muted focus:outline-none focus:border-brand-primary/50"
            />
          </div>

          <div className="flex items-center p-1 bg-bg-elevated border border-border-dark rounded-xl">
            {[
              { id: 'all', name: 'All' },
              { id: 'LIVE', name: 'Live' },
              { id: 'UPCOMING', name: 'Upcoming' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedStatus === st.id
                    ? 'bg-border-dark text-text-main font-semibold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 h-52 bg-card-dark border animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 w-24 bg-border-dark rounded-full" />
                <div className="h-6 w-3/4 bg-border-dark rounded-md" />
              </div>
              <div className="h-8 w-full bg-border-dark rounded-lg" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="card p-12 text-center space-y-3 bg-card-dark border">
          <p className="text-danger font-medium text-sm">Failed to load contests.</p>
          <p className="text-xs text-text-muted">Please check your internet connection or try again shortly.</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="card p-12 text-center space-y-3 bg-card-dark border">
          <div className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center mx-auto text-text-muted">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-main">No contests found</h3>
          <p className="text-xs text-text-muted">Try changing your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContests.map((contest) => {
            const theme = PLATFORM_THEMES[contest.platform] || {
              name: contest.platform,
              badge: 'bg-border-dark text-text-main',
              text: 'text-text-main',
              border: 'border-border-dark',
            };

            const startDate = new Date(contest.startTime);
            const isLive = contest.status === 'LIVE';
            const diffMs = startDate.getTime() - now;
            const startsInDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            return (
              <div
                key={contest.id}
                className="card p-5 bg-card-dark border border-border-dark hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-lg hover:-translate-y-1"
              >
                <div className="space-y-3">
                  {/* Platform & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`badge ${theme.badge}`}>{theme.name}</span>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-danger/15 text-danger border border-danger/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-text-muted">
                        {startsInDays > 1 ? `In ${startsInDays} days` : startsInDays === 1 ? 'Tomorrow' : 'Starts today'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-text-main line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {contest.title}
                  </h3>

                  {/* Info List */}
                  <div className="space-y-1.5 text-xs text-text-muted pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>
                        {startDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>
                        {startDate.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Duration: {formatDuration(contest.durationSeconds)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border-dark flex items-center gap-2">
                  <a
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-xs"
                  >
                    <span>{isLive ? 'Join Contest' : 'Register / View'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={formatGoogleCalendarUrl(contest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-border-dark hover:bg-border-dark text-text-muted hover:text-text-main transition-colors"
                    title="Add to Google Calendar"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
