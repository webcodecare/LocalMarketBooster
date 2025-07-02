import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Star, Eye, Percent, CheckCircle, Shield, BookOpen, Sparkles, Award, Plus, Edit, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface BadgeWithStats {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  backgroundColor: string;
  criteria: any;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userCount: number;
}

const iconOptions = [
  { value: "Trophy", label: "Trophy", icon: Trophy },
  { value: "Star", label: "Star", icon: Star },
  { value: "Eye", label: "Eye", icon: Eye },
  { value: "Percent", label: "Percent", icon: Percent },
  { value: "CheckCircle", label: "Check Circle", icon: CheckCircle },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "BookOpen", label: "Book Open", icon: BookOpen },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Award", label: "Award", icon: Award },
];

const colorOptions = [
  { value: "text-blue-600", bg: "bg-blue-100", label: "Blue" },
  { value: "text-green-600", bg: "bg-green-100", label: "Green" },
  { value: "text-red-600", bg: "bg-red-100", label: "Red" },
  { value: "text-yellow-600", bg: "bg-yellow-100", label: "Yellow" },
  { value: "text-purple-600", bg: "bg-purple-100", label: "Purple" },
  { value: "text-indigo-600", bg: "bg-indigo-100", label: "Indigo" },
  { value: "text-amber-600", bg: "bg-amber-100", label: "Amber" },
  { value: "text-teal-600", bg: "bg-teal-100", label: "Teal" },
];

export default function AdminBadgeManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeWithStats | null>(null);

  const { data: badges, isLoading } = useQuery<BadgeWithStats[]>({
    queryKey: ["/api/badges"],
  });

  const createMutation = useMutation({
    mutationFn: async (badgeData: any) => {
      const res = await apiRequest("POST", "/api/admin/badges", badgeData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
      setIsCreateOpen(false);
      toast({ title: "Badge created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create badge", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/badges/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
      setEditingBadge(null);
      toast({ title: "Badge updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update badge", description: error.message, variant: "destructive" });
    },
  });

  const BadgeForm = ({ badge, onSubmit, onCancel }: {
    badge?: BadgeWithStats | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: badge?.name || "",
      nameAr: badge?.nameAr || "",
      description: badge?.description || "",
      descriptionAr: badge?.descriptionAr || "",
      icon: badge?.icon || "Award",
      color: badge?.color || "text-blue-600",
      backgroundColor: badge?.backgroundColor || "bg-blue-100",
      isActive: badge?.isActive ?? true,
      criteria: badge?.criteria || { type: "offers_published", threshold: 1 }
    });

    const selectedColor = colorOptions.find(c => c.value === formData.color);
    const SelectedIcon = iconOptions.find(i => i.value === formData.icon)?.icon || Award;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (English)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Badge name in English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameAr">Name (Arabic)</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="اسم الشارة بالعربية"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Badge description in English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descriptionAr">Description (Arabic)</Label>
            <Textarea
              id="descriptionAr"
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="وصف الشارة بالعربية"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => {
                const color = colorOptions.find(c => c.value === value);
                setFormData({ 
                  ...formData, 
                  color: value,
                  backgroundColor: color?.bg || "bg-blue-100"
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${option.bg}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className={`p-4 rounded-lg border-2 border-dashed ${formData.backgroundColor} ${formData.color} w-fit`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${formData.backgroundColor}`}>
                <SelectedIcon className={`h-5 w-5 ${formData.color}`} />
              </div>
              <div>
                <h3 className="font-medium text-sm">{formData.name || "Badge Name"}</h3>
                <p className="text-xs text-gray-600">{formData.description || "Badge description"}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSubmit(formData)}>
            {badge ? "Update" : "Create"} Badge
          </Button>
        </DialogFooter>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Badge Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Badge Management</h1>
          <p className="text-gray-600 mt-2">Create and manage achievement badges for merchants</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
              <DialogDescription>
                Create a new achievement badge for merchants to earn.
              </DialogDescription>
            </DialogHeader>
            <BadgeForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges?.map((badge) => {
          const IconComponent = iconOptions.find(i => i.value === badge.icon)?.icon || Award;
          
          return (
            <Card key={badge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-full ${badge.backgroundColor}`}>
                    <IconComponent className={`h-6 w-6 ${badge.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={badge.isActive ? "default" : "secondary"}>
                      {badge.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBadge(badge)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {badge.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{badge.userCount} users earned</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBadge} onOpenChange={() => setEditingBadge(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Badge</DialogTitle>
            <DialogDescription>
              Update the badge details and criteria.
            </DialogDescription>
          </DialogHeader>
          {editingBadge && (
            <BadgeForm
              badge={editingBadge}
              onSubmit={(data) => updateMutation.mutate({ id: editingBadge.id, data })}
              onCancel={() => setEditingBadge(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}