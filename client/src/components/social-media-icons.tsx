import { useQuery } from "@tanstack/react-query";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import { FaTiktok, FaSnapchatGhost } from "react-icons/fa";

interface SiteSettings {
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  snapchatUrl: string;
  tiktokUrl: string;
  socialMediaEnabled: boolean;
}

export default function SocialMediaIcons() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const response = await fetch("/api/site-settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  if (!settings?.socialMediaEnabled) {
    return null;
  }

  const socialLinks = [
    {
      name: "Instagram",
      url: settings.instagramUrl,
      icon: Instagram,
      color: "hover:text-pink-500",
    },
    {
      name: "Twitter",
      url: settings.twitterUrl,
      icon: Twitter,
      color: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      url: settings.linkedinUrl,
      icon: Linkedin,
      color: "hover:text-blue-600",
    },
    {
      name: "Snapchat",
      url: settings.snapchatUrl,
      icon: FaSnapchatGhost,
      color: "hover:text-yellow-400",
    },
    {
      name: "TikTok",
      url: settings.tiktokUrl,
      icon: FaTiktok,
      color: "hover:text-gray-800",
    },
  ].filter(link => link.url);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-4 rtl:space-x-reverse">
      {socialLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-gray-400 ${link.color} transition-colors duration-300 hover:scale-110 transform`}
            aria-label={link.name}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}