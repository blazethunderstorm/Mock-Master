"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2, Trash2, Calendar, Clock, MapPin } from "lucide-react";

interface Template {
  id: string;
  name: string;
  role: string;
  experienceLevel: string;
  description: string;
  createdAt: Date | string;
}

interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  scheduledDate: Date | string;
  duration: number;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  templateId?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    role: "",
    experienceLevel: "",
    description: ""
  });

  // Interview form state
  const [newInterview, setNewInterview] = useState({
    title: "",
    candidateName: "",
    candidateEmail: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    location: "",
    templateId: ""
  });

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadTemplates();
    loadInterviews();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      
      if (data.success && data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInterviews = async () => {
    try {
      const response = await fetch('/api/interviews');
      const data = await response.json();
      
      if (data.success && data.interviews) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error("Error loading interviews:", error);
    }
  };

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelectChange = (value: string, field: string) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleInterviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInterview(prev => ({ ...prev, [name]: value }));
  };

  const handleInterviewSelectChange = (value: string, field: string) => {
    if (field === 'duration') {
      setNewInterview(prev => ({ ...prev, [field]: parseInt(value) }));
    } else {
      setNewInterview(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.role || !newTemplate.experienceLevel) {
      alert("Please fill in all required fields (Name, Role, Experience Level)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => [data.template, ...prev]);
        setNewTemplate({
          name: "",
          role: "",
          experienceLevel: "",
          description: ""
        });
        setTemplateDialogOpen(false);
        alert("Template created successfully!");
      } else {
        alert(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!newInterview.title.trim() || !newInterview.candidateName.trim() || 
        !newInterview.candidateEmail.trim() || !newInterview.scheduledDate || 
        !newInterview.scheduledTime) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDateTime = `${newInterview.scheduledDate}T${newInterview.scheduledTime}`;
      
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newInterview.title,
          candidateName: newInterview.candidateName,
          candidateEmail: newInterview.candidateEmail,
          scheduledDate: scheduledDateTime,
          duration: newInterview.duration,
          location: newInterview.location,
          templateId: newInterview.templateId || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(prev => [data.interview, ...prev]);
        setNewInterview({
          title: "",
          candidateName: "",
          candidateEmail: "",
          scheduledDate: "",
          scheduledTime: "",
          duration: 60,
          location: "",
          templateId: ""
        });
        setInterviewDialogOpen(false);
        alert("Interview scheduled successfully!");
      } else {
        alert(data.error || "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        alert("Template deleted successfully!");
      } else {
        alert(data.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  const handleDeleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      const response = await fetch(`/api/interviews?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(prev => prev.filter(interview => interview.id !== id));
        alert("Interview deleted successfully!");
      } else {
        alert(data.error || "Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="templates" className="space-y-6 mt-24">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="interviews">Scheduled Interviews</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Interview Templates</h2>
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newTemplate.name}
                      onChange={handleTemplateInputChange}
                      className="col-span-3"
                      placeholder="e.g., React Developer Interview"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role *
                    </Label>
                    <Select
                      onValueChange={(value) => handleTemplateSelectChange(value, "role")}
                      value={newTemplate.role}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                        <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                        <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                        <SelectItem value="Mobile Developer">Mobile Developer</SelectItem>
                        <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                        <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="experienceLevel" className="text-right">
                      Experience *
                    </Label>
                    <Select
                      onValueChange={(value) => handleTemplateSelectChange(value, "experienceLevel")}
                      value={newTemplate.experienceLevel}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1 years">0-1 years (Entry Level)</SelectItem>
                        <SelectItem value="1-3 years">1-3 years (Junior)</SelectItem>
                        <SelectItem value="3-5 years">3-5 years (Mid Level)</SelectItem>
                        <SelectItem value="5-8 years">5-8 years (Senior)</SelectItem>
                        <SelectItem value="8+ years">8+ years (Lead/Principal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newTemplate.description}
                      onChange={handleTemplateInputChange}
                      className="col-span-3"
                      placeholder="Brief description of the interview template..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Template"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No templates available. Create your first template!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-lg">
                      {template.role}
                    </span>
                    <span className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-lg">
                      {template.experienceLevel}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Created {formatDate(template.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Scheduled Interviews</h2>
            <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Calendar size={16} />
                  Schedule Interview
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Interview</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={newInterview.title}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                      placeholder="e.g., Frontend Developer Interview"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="candidateName" className="text-right">
                      Candidate Name *
                    </Label>
                    <Input
                      id="candidateName"
                      name="candidateName"
                      value={newInterview.candidateName}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="candidateEmail" className="text-right">
                      Email *
                    </Label>
                    <Input
                      id="candidateEmail"
                      name="candidateEmail"
                      type="email"
                      value={newInterview.candidateEmail}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scheduledDate" className="text-right">
                      Date *
                    </Label>
                    <Input
                      id="scheduledDate"
                      name="scheduledDate"
                      type="date"
                      value={newInterview.scheduledDate}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scheduledTime" className="text-right">
                      Time *
                    </Label>
                    <Input
                      id="scheduledTime"
                      name="scheduledTime"
                      type="time"
                      value={newInterview.scheduledTime}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration (min)
                    </Label>
                    <Select
                      onValueChange={(value) => handleInterviewSelectChange(value, "duration")}
                      value={newInterview.duration.toString()}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={newInterview.location}
                      onChange={handleInterviewInputChange}
                      className="col-span-3"
                      placeholder="Conference Room A / Zoom Link"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="templateId" className="text-right">
                      Use Template
                    </Label>
                    <Select
                      onValueChange={(value) => handleInterviewSelectChange(value, "templateId")}
                      value={newInterview.templateId}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleInterview} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        "Schedule Interview"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No interviews scheduled. Schedule your first interview!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{interview.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(interview.scheduledDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {formatTime(interview.scheduledDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {interview.location || 'TBD'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(interview.status)}`}>
                        {interview.status.toUpperCase()}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteInterview(interview.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Candidate:</span> {interview.candidateName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {interview.candidateEmail}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {interview.duration} minutes
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Start Interview
                    </Button>
                    <Button variant="outline" size="sm">
                      Send Reminder
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}