import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Eye, Percent, CheckCircle, Shield, BookOpen, Sparkles, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  awardedAt: Date | null;
  automaticallyAwarded: boolean | null;
  awardedBy: number | null;
  progress: unknown;
  badge: {
    id: number;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    color: string;
    backgroundColor: string;
    criteria: unknown;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
}

const iconMap = {
  Trophy: Trophy,
  Star: Star,
  Eye: Eye,
  Percent: Percent,
  CheckCircle: CheckCircle,
  Shield: Shield,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Award: Award,
};

export function MerchantBadges() {
  const { user } = useAuth();
  
  const { data: userBadges, isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/users/${user?.id}/badges`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Achievements
          </CardTitle>
          <CardDescription>Loading your earned badges...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userBadges || userBadges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Achievements
          </CardTitle>
          <CardDescription>Start creating offers to earn your first badges!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No badges earned yet. Keep up the great work!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Your Achievements
          <Badge variant="secondary">{userBadges.length}</Badge>
        </CardTitle>
        <CardDescription>Badges you've earned through your activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBadges.map((userBadge) => {
            const IconComponent = iconMap[userBadge.badge.icon as keyof typeof iconMap] || Award;
            
            return (
              <div
                key={userBadge.id}
                className={`p-4 rounded-lg border-2 border-dashed ${userBadge.badge.backgroundColor} ${userBadge.badge.color} transition-all hover:scale-105`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${userBadge.badge.backgroundColor}`}>
                    <IconComponent className={`h-5 w-5 ${userBadge.badge.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {userBadge.badge.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {userBadge.badge.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {userBadge.automaticallyAwarded ? (
                        <Badge variant="outline" className="text-xs">
                          Auto-earned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Admin awarded
                        </Badge>
                      )}
                      {userBadge.awardedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(userBadge.awardedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}