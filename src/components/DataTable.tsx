import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const tableData = [
  {
    id: "PRJ-001",
    name: "WEBサイトリニューアル",
    client: "株式会社ABC",
    status: "進行中",
    priority: "高",
    dueDate: "2024-01-15",
    progress: 75,
    assignee: "山田太郎"
  },
  {
    id: "PRJ-002",
    name: "モバイルアプリ開発",
    client: "株式会社XYZ",
    status: "完了",
    priority: "中",
    dueDate: "2024-01-10",
    progress: 100,
    assignee: "佐藤花子"
  },
  {
    id: "PRJ-003",
    name: "データベース最適化",
    client: "株式会社DEF",
    status: "レビュー中",
    priority: "高",
    dueDate: "2024-01-20",
    progress: 90,
    assignee: "田中次郎"
  },
  {
    id: "PRJ-004",
    name: "セキュリティ監査",
    client: "株式会社GHI",
    status: "開始前",
    priority: "低",
    dueDate: "2024-01-25",
    progress: 0,
    assignee: "鈴木美里"
  },
  {
    id: "PRJ-005",
    name: "API統合",
    client: "株式会社JKL",
    status: "進行中",
    priority: "中",
    dueDate: "2024-01-18",
    progress: 45,
    assignee: "高橋健一"
  }
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "完了":
      return "default";
    case "進行中":
      return "secondary";
    case "レビュー中":
      return "outline";
    case "開始前":
      return "outline";
    default:
      return "outline";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "高":
      return "text-red-600 bg-red-50";
    case "中":
      return "text-yellow-600 bg-yellow-50";
    case "低":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export function DataTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>プロジェクト一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>プロジェクト</TableHead>
                <TableHead>クライアント</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>優先度</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>進捗</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{project.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{project.assignee}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          詳細を見る
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}