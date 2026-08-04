import { integrationRepository } from '../repositories/integration.repository.js';
import { syncCodeforces } from './platforms/codeforces.js';
import { syncLeetcode } from './platforms/leetcode.js';
import { syncCodechef } from './platforms/codechef.js';
import { syncGfg } from './platforms/gfg.js';
import { syncAtcoder } from './platforms/atcoder.js';
import { syncGithub } from './platforms/github.js';
import { prisma } from '../config/database.js';

export const getIntegrations = async (userId: string) => {
  return integrationRepository.findByUserId(userId);
};

export const linkIntegration = async (userId: string, platform: string, username: string) => {
  const supportedPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg', 'atcoder', 'github'];
  if (!supportedPlatforms.includes(platform)) {
    throw new Error('Unsupported platform');
  }

  let stats = { solvedCount: 0, rating: 0, maxRating: 0, contributions: 0 };
  let apiError: string | null = null;

  try {
    let platformStats: any;
    if (platform === 'codeforces') platformStats = await syncCodeforces(username);
    else if (platform === 'leetcode') platformStats = await syncLeetcode(username);
    else if (platform === 'codechef') platformStats = await syncCodechef(username);
    else if (platform === 'gfg') platformStats = await syncGfg(username);
    else if (platform === 'atcoder') platformStats = await syncAtcoder(username);
    else if (platform === 'github') platformStats = await syncGithub(username);
    
    if (platformStats) {
      stats = { ...stats, ...platformStats };
    }
  } catch (error: any) {
    if (error?.message?.toLowerCase().includes('not found') || error?.message?.includes('Token')) {
      throw error;
    }
    apiError = error?.message || 'External API unavailable';
  }

  // Use raw prisma here since repository doesn't have maxRating, contributions, accessToken yet, or just update the repo?
  // Let's just update the DB directly here for ease since we're expanding schema
  const integration = await prisma.platformIntegration.upsert({
    where: { userId_platform: { userId, platform } },
    update: { 
       username, 
       solvedCount: stats.solvedCount, 
       rating: stats.rating,
       maxRating: stats.maxRating || stats.rating,
       tier: (stats as any).tier || null,
       contributions: stats.contributions || 0,
       activityData: (stats as any).activityData || null,
       lastSyncedAt: new Date()
    } as any,
    create: { 
       userId, 
       platform, 
       username, 
       solvedCount: stats.solvedCount, 
       rating: stats.rating,
       maxRating: stats.maxRating || stats.rating,
       tier: (stats as any).tier || null,
       contributions: stats.contributions || 0,
       activityData: (stats as any).activityData || null
    } as any
  });

  return { ...integration, _warning: apiError };
};

export const unlinkIntegration = async (userId: string, platform: string) => {
  return prisma.platformIntegration.delete({
    where: { userId_platform: { userId, platform } }
  });
};

export const syncAllIntegrations = async (userId: string) => {
  const integrations = await getIntegrations(userId);
  const results = [];

  for (const integration of integrations) {
    try {
      let stats = { solvedCount: integration.solvedCount, rating: integration.rating, maxRating: integration.maxRating, contributions: integration.contributions };
      
      let platformStats: any;
      if (integration.platform === 'codeforces') platformStats = await syncCodeforces(integration.username);
      else if (integration.platform === 'leetcode') platformStats = await syncLeetcode(integration.username);
      else if (integration.platform === 'codechef') platformStats = await syncCodechef(integration.username);
      else if (integration.platform === 'gfg') platformStats = await syncGfg(integration.username);
      else if (integration.platform === 'atcoder') platformStats = await syncAtcoder(integration.username);
      else if (integration.platform === 'github') platformStats = await syncGithub(integration.username);

      if (platformStats) {
        stats = { ...stats, ...platformStats };
      }

      const updated = await prisma.platformIntegration.update({
        where: { id: integration.id },
        data: {
          solvedCount: stats.solvedCount,
          rating: stats.rating,
          maxRating: Math.max(integration.maxRating, stats.maxRating || stats.rating || 0),
          tier: (stats as any).tier || null,
          contributions: stats.contributions || 0,
          activityData: (stats as any).activityData || null,
          lastSyncedAt: new Date()
        } as any
      });
      
      results.push(updated);
    } catch (err) {
      console.error(`Sync failed for ${integration.platform}:`, err);
      results.push(integration);
    }
  }

  return results;
};
