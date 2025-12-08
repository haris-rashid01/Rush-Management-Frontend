import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Eye,
  Share2,
  Star,
  Trash2,
  Edit,
  File,
  Image,
  Video,
  Music,
  Calendar,
  User,
  Shield
} from "lucide-react";

interface DocumentCardProps {
  title: string;
  category: string;
  uploadDate: string;
  fileSize: string;
  fileType?: string;
  description?: string;
  uploadedBy?: string;
  version?: string;
  tags?: string[];
  isStarred?: boolean;
  downloadCount?: number;
  permissions?: "public" | "restricted" | "confidential";
  onDownload?: () => void;
  onView?: () => void;
  onStar?: () => void;
  onDelete?: () => void;
  testId?: string;
}

export function DocumentCard({
  title,
  category,
  uploadDate,
  fileSize,
  fileType = "pdf",
  description,
  uploadedBy,
  version,
  tags = [],
  isStarred = false,
  downloadCount = 0,
  permissions = "public",
  onDownload,
  onView,
  onStar,
  onDelete,
  testId
}: DocumentCardProps) {

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-pink-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-5 w-5 text-indigo-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confidential':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'public':
        return '🌐';
      case 'restricted':
        return '🔒';
      case 'confidential':
        return '🔐';
      default:
        return '🌐';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow group" data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
            {getFileIcon(fileType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm truncate" data-testid={`${testId}-title`}>
                {title}
              </h4>
              <Button
                size="icon"
                variant="ghost"
                onClick={onStar}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className={`h-3 w-3 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{category}</Badge>
              <Badge className={`text-xs ${getPermissionColor(permissions)}`}>
                {getPermissionIcon(permissions)} {permissions}
              </Badge>
            </div>

            {description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{fileSize}</span>
              {version && <span>v{version}</span>}
              <span>{downloadCount} downloads</span>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{uploadDate}</span>
              </div>
              {uploadedBy && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{uploadedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              onDownload?.();
              console.log(`Downloading ${title}`);
            }}
            data-testid={`${testId}-download`}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={onView}
            data-testid={`${testId}-view`}
          >
            <Eye className="h-3 w-3" />
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
