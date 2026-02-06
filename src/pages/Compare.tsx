import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStudents, StudentWithData } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EngagementBadge } from "@/components/EngagementBadge";
import { EngagementGauge } from "@/components/EngagementGauge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, GitCompare, Users, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Compare() {
  const { data: students = [], isLoading } = useStudents();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStudents = students.filter((s) => selectedIds.has(s.id));

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else if (newSet.size < 5) {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const removeStudent = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.delete(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const metrics = [
    { key: "attendance_rate", label: "Attendance", unit: "%" },
    { key: "assignment_completion", label: "Assignments", unit: "%" },
    { key: "participation_score", label: "Participation", unit: "%" },
    { key: "time_on_platform", label: "Platform Time", unit: "min" },
    { key: "forum_posts", label: "Forum Posts", unit: "" },
    { key: "quiz_average", label: "Quiz Average", unit: "%" },
  ] as const;

  const getMetricValue = (student: StudentWithData, key: string) => {
    const m = student.latestMetrics;
    if (!m) return null;
    return m[key as keyof typeof m];
  };

  const getMetricColor = (value: number | null, key: string) => {
    if (value === null) return "text-muted-foreground";
    
    // Different thresholds for different metrics
    if (key === "forum_posts") {
      if (value >= 10) return "text-green-600";
      if (value >= 5) return "text-amber-600";
      return "text-red-600";
    }
    if (key === "time_on_platform") {
      if (value >= 120) return "text-green-600";
      if (value >= 60) return "text-amber-600";
      return "text-red-600";
    }
    // Percentage-based metrics
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-primary" />
            Compare Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Select up to 5 students to compare their engagement metrics side by side
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Student Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Students
              </CardTitle>
              <CardDescription>
                {selectedIds.size}/5 students selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No students found
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedIds.has(student.id)
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(student.id)}
                        disabled={
                          !selectedIds.has(student.id) && selectedIds.size >= 5
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                      {student.latestPrediction && (
                        <EngagementBadge
                          level={student.latestPrediction.engagement_level}
                          size="sm"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comparison View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Comparison View</CardTitle>
                  <CardDescription>
                    Side-by-side engagement metrics
                  </CardDescription>
                </div>
                {selectedIds.size > 0 && (
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GitCompare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Select students from the list to compare their metrics
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Engagement Gauges */}
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {selectedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="relative bg-muted/30 rounded-lg p-4 text-center"
                      >
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <EngagementGauge
                          score={student.latestPrediction?.engagement_score ?? null}
                          level={student.latestPrediction?.engagement_level}
                          size="sm"
                        />
                        <p className="mt-2 text-sm font-medium truncate">
                          {student.name.split(" ")[0]}
                        </p>
                        {student.latestPrediction && (
                          <EngagementBadge
                            level={student.latestPrediction.engagement_level}
                            size="sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Metrics Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Metric</TableHead>
                          {selectedStudents.map((student) => (
                            <TableHead key={student.id} className="text-center font-semibold">
                              {student.name.split(" ")[0]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.map((metric) => (
                          <TableRow key={metric.key}>
                            <TableCell className="font-medium">
                              {metric.label}
                            </TableCell>
                            {selectedStudents.map((student) => {
                              const value = getMetricValue(student, metric.key);
                              return (
                                <TableCell
                                  key={student.id}
                                  className={cn(
                                    "text-center font-semibold",
                                    getMetricColor(value as number | null, metric.key)
                                  )}
                                >
                                  {value !== null && value !== undefined
                                    ? `${value}${metric.unit}`
                                    : "—"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/30">
                          <TableCell className="font-semibold">
                            Engagement Score
                          </TableCell>
                          {selectedStudents.map((student) => (
                            <TableCell
                              key={student.id}
                              className={cn(
                                "text-center font-bold",
                                student.latestPrediction
                                  ? getMetricColor(
                                      student.latestPrediction.engagement_score,
                                      "engagement"
                                    )
                                  : "text-muted-foreground"
                              )}
                            >
                              {student.latestPrediction
                                ? `${student.latestPrediction.engagement_score.toFixed(0)}%`
                                : "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
