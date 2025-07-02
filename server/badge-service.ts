import { db } from "./db";
import { badges, userBadges, offers, users } from "@shared/schema";
import { eq, count, desc, and, gte } from "drizzle-orm";
import type { Badge, UserBadge, InsertUserBadge } from "@shared/schema";

interface BadgeCriteria {
  type: 'offers_published' | 'offers_approved' | 'total_views' | 'high_discount' | 'rating_average' | 'consecutive_approvals' | 'time_active';
  threshold: number;
  timeframe?: 'all_time' | '30_days' | '7_days';
  additional?: any;
}

export class BadgeService {
  private static instance: BadgeService;

  constructor() {}

  static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  // Award badge to user
  async awardBadge(userId: number, badgeId: number, automaticallyAwarded = true, awardedBy?: number): Promise<UserBadge | null> {
    try {
      // Check if user already has this badge
      const existingBadge = await db.select()
        .from(userBadges)
        .where(and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        ))
        .limit(1);

      if (existingBadge.length > 0) {
        return null; // Already has badge
      }

      const [newUserBadge] = await db.insert(userBadges)
        .values({
          userId,
          badgeId,
          automaticallyAwarded,
          awardedBy,
          progress: null
        })
        .returning();

      return newUserBadge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  // Check and award badges for a user based on their activities
  async checkAndAwardBadges(userId: number): Promise<UserBadge[]> {
    const awardedBadges: UserBadge[] = [];

    try {
      // Get all active badges
      const activeBadges = await db.select().from(badges).where(eq(badges.isActive, true));

      // Get user's existing badges
      const existingBadgeIds = await db.select({ badgeId: userBadges.badgeId })
        .from(userBadges)
        .where(eq(userBadges.userId, userId));
      
      const existingIds = existingBadgeIds.map(b => b.badgeId);

      // Check each badge criteria
      for (const badge of activeBadges) {
        if (existingIds.includes(badge.id)) continue; // Already has badge

        const criteria = badge.criteria as BadgeCriteria;
        const qualifies = await this.checkBadgeCriteria(userId, criteria);

        if (qualifies) {
          const awardedBadge = await this.awardBadge(userId, badge.id, true);
          if (awardedBadge) {
            awardedBadges.push(awardedBadge);
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Check if user meets badge criteria
  private async checkBadgeCriteria(userId: number, criteria: BadgeCriteria): Promise<boolean> {
    try {
      switch (criteria.type) {
        case 'offers_published':
          const offersCount = await db.select({ count: count() })
            .from(offers)
            .where(eq(offers.businessId, userId));
          return offersCount[0]?.count >= criteria.threshold;

        case 'offers_approved':
          const approvedCount = await db.select({ count: count() })
            .from(offers)
            .where(and(
              eq(offers.businessId, userId),
              eq(offers.isApproved, true)
            ));
          return approvedCount[0]?.count >= criteria.threshold;

        case 'total_views':
          const viewsResult = await db.select({ 
              totalViews: count(offers.views)
            })
            .from(offers)
            .where(and(
              eq(offers.businessId, userId),
              eq(offers.isApproved, true)
            ));
          
          const totalViews = viewsResult.reduce((sum, offer) => sum + (offer.totalViews || 0), 0);
          return totalViews >= criteria.threshold;

        case 'high_discount':
          const highDiscountCount = await db.select({ count: count() })
            .from(offers)
            .where(and(
              eq(offers.businessId, userId),
              eq(offers.isApproved, true),
              gte(offers.discountPercentage, criteria.threshold)
            ));
          return highDiscountCount[0]?.count >= (criteria.additional?.minimumOffers || 1);

        case 'consecutive_approvals':
          // Check last N offers for consecutive approvals
          const recentOffers = await db.select()
            .from(offers)
            .where(eq(offers.businessId, userId))
            .orderBy(desc(offers.createdAt))
            .limit(criteria.threshold);

          if (recentOffers.length < criteria.threshold) return false;
          return recentOffers.every(offer => offer.isApproved);

        case 'time_active':
          const user = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          
          if (!user[0]) return false;
          
          const daysSinceCreation = Math.floor(
            (Date.now() - user[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceCreation >= criteria.threshold;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking badge criteria:', error);
      return false;
    }
  }

  // Get user's badges with badge details
  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    try {
      const userBadgesList = await db.select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        awardedAt: userBadges.awardedAt,
        automaticallyAwarded: userBadges.automaticallyAwarded,
        awardedBy: userBadges.awardedBy,
        progress: userBadges.progress,
        badge: {
          id: badges.id,
          name: badges.name,
          nameAr: badges.nameAr,
          description: badges.description,
          descriptionAr: badges.descriptionAr,
          icon: badges.icon,
          color: badges.color,
          backgroundColor: badges.backgroundColor,
          criteria: badges.criteria,
          isActive: badges.isActive,
          createdAt: badges.createdAt,
          updatedAt: badges.updatedAt,
        }
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.awardedAt));

      return userBadgesList;
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  // Get all badges with user count
  async getAllBadgesWithStats(): Promise<(Badge & { userCount: number })[]> {
    try {
      const badgeStats = await db.select({
        id: badges.id,
        name: badges.name,
        nameAr: badges.nameAr,
        description: badges.description,
        descriptionAr: badges.descriptionAr,
        icon: badges.icon,
        color: badges.color,
        backgroundColor: badges.backgroundColor,
        criteria: badges.criteria,
        isActive: badges.isActive,
        createdAt: badges.createdAt,
        updatedAt: badges.updatedAt,
        userCount: count(userBadges.id)
      })
      .from(badges)
      .leftJoin(userBadges, eq(badges.id, userBadges.badgeId))
      .groupBy(badges.id)
      .orderBy(desc(count(userBadges.id)));

      return badgeStats;
    } catch (error) {
      console.error('Error getting badge stats:', error);
      return [];
    }
  }

  // Remove badge from user
  async removeBadge(userId: number, badgeId: number): Promise<boolean> {
    try {
      await db.delete(userBadges)
        .where(and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        ));
      return true;
    } catch (error) {
      console.error('Error removing badge:', error);
      return false;
    }
  }
}

export const badgeService = BadgeService.getInstance();