import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Mail, Calendar, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ContactForm {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'replied' | 'resolved';
  adminReply?: string;
  createdAt: string;
  repliedAt?: string;
}

export default function AdminContactManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactForm | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: messages, isLoading } = useQuery<ContactForm[]>({
    queryKey: ["/api/admin/contact-forms"],
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: number; reply: string }) => {
      const res = await apiRequest("POST", `/api/admin/contact-forms/${id}/reply`, { reply });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الرد",
        description: "تم إرسال الرد للعميل عبر البريد الإلكتروني",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-forms"] });
      setSelectedMessage(null);
      setReplyText("");
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إرسال الرد",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markResolvedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/contact-forms/${id}/resolve`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديد الرسالة كمحلولة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-forms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">جديد</Badge>;
      case 'replied':
        return <Badge variant="secondary">تم الرد</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-600">محلول</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      replyMutation.mutate({
        id: selectedMessage.id,
        reply: replyText,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const newMessages = messages?.filter(msg => msg.status === 'new') || [];
  const repliedMessages = messages?.filter(msg => msg.status === 'replied') || [];
  const resolvedMessages = messages?.filter(msg => msg.status === 'resolved') || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة رسائل التواصل</h1>
          <p className="text-muted-foreground mt-2">
            مراجعة والرد على رسائل العملاء
          </p>
        </div>
        <div className="flex space-x-4">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{newMessages.length}</div>
              <div className="text-xs text-muted-foreground">جديد</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{repliedMessages.length}</div>
              <div className="text-xs text-muted-foreground">تم الرد</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resolvedMessages.length}</div>
              <div className="text-xs text-muted-foreground">محلول</div>
            </div>
          </Card>
        </div>
      </div>

      {/* New Messages */}
      {newMessages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            رسائل جديدة ({newMessages.length})
          </h2>
          <div className="grid gap-4">
            {newMessages.map((message) => (
              <Card key={message.id} className="border-red-200 bg-red-50/30 dark:bg-red-900/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{message.name}</h3>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(message.status)}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <p className="text-sm">{message.message}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(message.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMessage(message)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            رد
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>الرد على الرسالة</DialogTitle>
                            <DialogDescription>
                              اكتب ردك على رسالة {selectedMessage?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMessage && (
                            <div className="space-y-6">
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{selectedMessage.name}</span>
                                  <span className="text-sm text-muted-foreground">({selectedMessage.email})</span>
                                </div>
                                <p className="text-sm">{selectedMessage.message}</p>
                              </div>

                              <div className="space-y-2">
                                <label htmlFor="reply" className="text-sm font-medium">
                                  ردك
                                </label>
                                <Textarea
                                  id="reply"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="اكتب ردك هنا..."
                                  rows={6}
                                  className="text-right"
                                />
                              </div>

                              <div className="flex space-x-3 pt-4">
                                <Button
                                  onClick={handleReply}
                                  disabled={replyMutation.isPending || !replyText.trim()}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {replyMutation.isPending ? "جارٍ الإرسال..." : "إرسال الرد"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markResolvedMutation.mutate(message.id)}
                        disabled={markResolvedMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        حل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Replied Messages */}
      {repliedMessages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            رسائل تم الرد عليها ({repliedMessages.length})
          </h2>
          <div className="grid gap-4">
            {repliedMessages.map((message) => (
              <Card key={message.id} className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{message.name}</h3>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(message.status)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                          <p className="text-sm font-medium mb-2">الرسالة الأصلية:</p>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        
                        {message.adminReply && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium mb-2">ردك:</p>
                            <p className="text-sm">{message.adminReply}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            استلمت: {format(new Date(message.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                          </span>
                        </div>
                        {message.repliedAt && (
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>
                              رد: {format(new Date(message.repliedAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markResolvedMutation.mutate(message.id)}
                        disabled={markResolvedMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        حل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Messages */}
      {resolvedMessages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            رسائل محلولة ({resolvedMessages.length})
          </h2>
          <div className="grid gap-4">
            {resolvedMessages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{message.name}</h3>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(message.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p className="line-clamp-2">{message.message}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(message.createdAt), "dd/MM/yyyy", { locale: ar })}
                        </span>
                        {message.repliedAt && (
                          <>
                            <span>•</span>
                            <span>تم الرد</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {messages?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد رسائل</h3>
            <p className="text-muted-foreground">
              لم يتم استلام أي رسائل من العملاء بعد
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}