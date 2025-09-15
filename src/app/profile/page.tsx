"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaCamera,
  FaChartLine, FaDesktop, FaCog 
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
interface ProfileData {
  name: string;
  location: string;
  bio: string;
  skills: string[];
}

interface Statistics {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalTimeSpent: number;
}

interface Interview {
  title: string;
  company: string;
  date: string;
  duration: string;
  feedback: string;
  score: number;
}

const ProfessionalProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Statistics');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState('/api/placeholder/200/200');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'ANIRUDH',
    location: 'Not specified',
    bio: 'No bio available',
    skills: []
  });

  const [statistics, setStatistics] = useState<Statistics>({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });

  const [progressData, setProgressData] = useState([
    { month: 'Jan', score: 7.0 },
    { month: 'Feb', score: 7.5 },
    { month: 'Mar', score: 8.0 },
    { month: 'Apr', score: 8.5 },
    { month: 'May', score: 9.0 }
  ]);

  const [interviewHistory, setInterviewHistory] = useState<Interview[]>([]);

  useEffect(() => {
    fetchProfileData();
    fetchProgressData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the response data structure
      if (data.user) {
        setProfileData({
          name: data.user.name || 'User',
          location: data.user.location || 'Not specified',
          bio: data.user.bio || 'No bio available',
          skills: data.user.skills || []
        });
        
        if (data.user.image) {
          setProfileImage(data.user.image);
        }
      }
      
      if (data.statistics) {
        setStatistics(data.statistics);
      }
      
      if (data.interviewHistory) {
        setInterviewHistory(data.interviewHistory);
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Using default data.');
      // Continue with default data instead of blocking the UI
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/profile?type=progress');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setProgressData(data);
        }
        // If no data or error, keep default progress data
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Keep default progress data on error
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileEdit = async () => {
    if (isEditing) {
      // Save changes
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (response.ok) {
          setIsEditing(false);
        } else {
          setError('Failed to save profile changes');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Error updating profile');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillEdit = (skills: string[]) => {
    setProfileData(prev => ({
      ...prev,
      skills
    }));
  };

  const redirectToTemplates = () => {
    window.location.href = '/templates';
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-800 via-indigo-900 to-slate-950 mt-18 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-800 via-indigo-900 to-slate-950 mt-18">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-[#161E2E] rounded-2xl shadow-lg p-6 mb-6 mt-20">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={profileImage} 
                alt={profileData.name} 
                className="w-32 h-32 rounded-full border-4 border-[#00E5FF]/30 object-cover"
                onError={() => setProfileImage('/api/placeholder/200/200')}
              />
              <button 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-[#00E5FF] text-[#0E1525] p-2 rounded-full hover:bg-[#00E5FF]/80 transition-colors"
              >
                <FaCamera size={16} />
              </button>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-3xl font-bold text-white bg-[#0E1525] rounded px-2 w-full mb-2 border border-[#00E5FF]/30"
                  />
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="text-[#00E5FF] text-lg bg-[#0E1525] rounded px-2 w-full mb-2 border border-[#00E5FF]/30"
                  />
                  <textarea 
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="text-gray-400 mt-2 bg-[#0E1525] rounded px-2 w-full h-20 border border-[#00E5FF]/30"
                    placeholder="Add a bio..."
                  />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
                  <p className="text-[#00E5FF] text-lg">Software Engineer • {profileData.location} • Joined January 2023</p>
                  <p className="text-gray-400 mt-2">{profileData.bio}</p>
                </>
              )}
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-[#00E5FF] hover:text-white transition-colors"><FaLinkedin size={24} /></a>
                <a href="#" className="text-[#00E5FF] hover:text-white transition-colors"><FaGithub size={24} /></a>
                <a href="#" className="text-[#00E5FF] hover:text-white transition-colors"><FaTwitter size={24} /></a>
                <a href="#" className="text-[#00E5FF] hover:text-white transition-colors"><FaGlobe size={24} /></a>
              </div>
            </div>
            <div>
              <button 
                onClick={handleProfileEdit} 
                className="bg-[#00E5FF]/10 text-[#00E5FF] px-4 py-2 rounded-lg hover:bg-[#00E5FF]/20 transition-colors"
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isEditing ? (
              <div className="flex flex-wrap gap-2 w-full">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-[#1E293B] border border-[#00E5FF]/30 rounded-full">
                    <input 
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...profileData.skills];
                        newSkills[index] = e.target.value;
                        handleSkillEdit(newSkills);
                      }}
                      className="bg-transparent text-[#00E5FF] px-3 py-1 rounded-full text-sm min-w-[80px]"
                    />
                    <button 
                      onClick={() => {
                        const newSkills = profileData.skills.filter((_, i) => i !== index);
                        handleSkillEdit(newSkills);
                      }}
                      className="text-red-500 px-2 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleSkillEdit([...profileData.skills, 'New Skill'])}
                  className="bg-[#1E293B] border border-[#00E5FF]/30 text-[#00E5FF] px-3 py-1 rounded-full text-sm hover:bg-[#00E5FF]/10 transition-colors"
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <>
                {profileData.skills.length > 0 ? (
                  profileData.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="bg-[#1E293B] border border-[#00E5FF]/30 text-[#00E5FF] px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No skills added yet. Click 'Edit Profile' to add skills.</span>
                )}
              </>
            )}
          </div>
        </div>


        <div className="flex mb-6 space-x-4">
          {['Statistics', 'Interview History', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === tab 
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                  : 'text-gray-400 hover:bg-[#161E2E]'
              }`}
            >
              {tab === 'Statistics' && <FaChartLine />}
              {tab === 'Interview History' && <FaDesktop />}
              {tab === 'Settings' && <FaCog />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {activeTab === 'Statistics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161E2E] rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#00E5FF]">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Total Interviews</p>
                  <p className="text-3xl font-bold text-white">{statistics.totalInterviews}</p>
                </div>
                <div>
                  <p className="text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-white">{statistics.completedInterviews}</p>
                </div>
                <div>
                  <p className="text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-[#00E5FF]">{statistics.averageScore}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time Spent</p>
                  <p className="text-3xl font-bold text-white">{statistics.totalTimeSpent} hours</p>
                </div>
              </div>
              {statistics.totalInterviews === 0 && (
                <div className="mt-4 p-4 bg-[#00E5FF]/10 rounded-lg">
                  <p className="text-[#00E5FF] text-sm">
                    🚀 Welcome! Take your first interview to see your statistics here.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-[#161E2E] rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#00E5FF]">Performance Analysis</h2>
              {statistics.totalInterviews > 0 ? (
                <div>
                  <h3 className="text-gray-400 mb-2">Strong Categories</h3>
                  <div className="flex space-x-2 mb-4">
                    {['Cloud Computing', 'DevOps', 'System Design'].map((category) => (
                      <span 
                        key={category} 
                        className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-gray-400 mb-2">Areas for Improvement</h3>
                  <div className="flex space-x-2">
                    {['Advanced Networking', 'Security Protocols'].map((area) => (
                      <span 
                        key={area} 
                        className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">📊 No performance data yet</p>
                  <p className="text-gray-400 text-sm">Complete interviews to see your performance analysis</p>
                </div>
              )}
            </div>
            <div className="bg-[#161E2E] rounded-2xl p-6 col-span-full">
              <h2 className="text-xl font-semibold mb-4 text-[#00E5FF]">Progress Over Time</h2>
              {statistics.totalInterviews > 0 && (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <XAxis dataKey="month" stroke="#00E5FF" />
                      <YAxis stroke="#00E5FF" domain={[6, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0E1525', border: '1px solid #00E5FF' }}
                        labelStyle={{ color: '#00E5FF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#00E5FF" 
                        strokeWidth={3}
                        dot={{ stroke: '#00E5FF', strokeWidth: 2, fill: '#0E1525' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {statistics.totalInterviews ===0 && (
                              <Link
                              href="/templates"
                              className="mt-6 bg-[#00E5FF] text-[#0E1525] px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                              Take Your First Interview
                            </Link>
              )}
            </div>
          </div>
        )}

{/* Interview History Tab */}
        {activeTab === 'Interview History' && (
          <div className="space-y-4">
            {interviewHistory.length > 0 ? (
              interviewHistory.map((interview, index) => {
                // Parse JSON feedback if it exists
                let parsedFeedback = null;
                try {
                  if (typeof interview.feedback === 'string' && interview.feedback.startsWith('{')) {
                    parsedFeedback = JSON.parse(interview.feedback);
                  }
                } catch (e) {
                  // If parsing fails, use original feedback
                }

                return (
                  <div 
                    key={index} 
                    className="bg-[#161E2E] rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{interview.title || 'Mock Interview'}</h3>
                        <p className="text-gray-400">
                          {interview.company || 'Not Specified'} • {interview.date || 'Sep 14, 2025'} • {interview.duration}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-[#00E5FF]">{interview.score || 0}/10</p>
                        <button className="mt-2 text-[#00E5FF] hover:underline text-sm">View Details</button>
                      </div>
                    </div>

                    {/* Enhanced Feedback Display */}
                    {parsedFeedback ? (
                      <div className="space-y-4">
                        {/* Categories Performance */}
                        {parsedFeedback.categories && (
                          <div>
                            <h4 className="text-[#00E5FF] font-semibold mb-2">Performance Breakdown</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {parsedFeedback.categories.map((category, catIndex) => (
                                <div key={catIndex} className="bg-[#0E1525] rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <div className="text-white text-sm font-medium">{category.name}</div>
                                    <div className={`text-sm font-bold ${
                                      category.score >= 80 ? 'text-green-400' :
                                      category.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                      {category.score}/100
                                    </div>
                                  </div>
                                  {/* Progress Bar */}
                                  <div className="w-max bg-gray-700 rounded-full  mt-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        category.score >= 80 ? 'bg-green-400' :
                                        category.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                      }`}
                                      style={{ width: `${(category.score / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths */}
                        {parsedFeedback.strengths && parsedFeedback.strengths.length > 0 && (
                          <div>
                            <h4 className="text-green-400 font-semibold mb-2">✅ Strengths</h4>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                              <ul className="list-disc list-inside space-y-1 text-green-300 text-sm">
                                {parsedFeedback.strengths.map((strength, strIndex) => (
                                  <li key={strIndex}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {parsedFeedback.improvements && parsedFeedback.improvements.length > 0 && (
                          <div>
                            <h4 className="text-yellow-400 font-semibold mb-2">💡 Areas for Improvement</h4>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                              <ul className="list-disc list-inside space-y-1 text-yellow-300 text-sm">
                                {parsedFeedback.improvements.map((improvement, impIndex) => (
                                  <li key={impIndex}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Question Analysis */}
                        {parsedFeedback.questionAnalysis && Object.keys(parsedFeedback.questionAnalysis).length > 0 && (
                          <div>
                            <h4 className="text-[#00E5FF] font-semibold mb-2">📝 Question Analysis</h4>
                            <div className="space-y-2">
                              {Object.entries(parsedFeedback.questionAnalysis).map(([questionId, analysis], qaIndex) => (
                                <div key={qaIndex} className="bg-[#0E1525] rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white text-sm font-medium">Question {questionId}</span>
                                    <span className="text-[#00E5FF] text-sm font-bold">{analysis.score}/10</span>
                                  </div>
                                  {analysis.timeAssessment && (
                                    <p className="text-gray-400 text-xs mb-1">
                                      <span className="font-medium">Time:</span> {analysis.timeAssessment}
                                    </p>
                                  )}
                                  {analysis.strengths && analysis.strengths.length > 0 && (
                                    <p className="text-green-300 text-xs mb-1">
                                      <span className="font-medium">Strengths:</span> {analysis.strengths.join(', ')}
                                    </p>
                                  )}
                                  {analysis.improvements && analysis.improvements.length > 0 && (
                                    <p className="text-yellow-300 text-xs">
                                      <span className="font-medium">Improvements:</span> {analysis.improvements.join(', ')}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Points */}
                        {parsedFeedback.keyPoints && Object.keys(parsedFeedback.keyPoints).length > 0 && (
                          <div>
                            <h4 className="text-[#00E5FF] font-semibold mb-2">🎯 Key Insights</h4>
                            <div className="bg-[#0E1525] rounded-lg p-3">
                              {Object.entries(parsedFeedback.keyPoints).map(([pointId, point], kpIndex) => (
                                <div key={kpIndex} className="flex justify-between items-center py-1">
                                  <span className="text-gray-300 text-sm">Point {pointId}</span>
                                  <span className="text-[#00E5FF] text-sm font-bold">{point.score}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback for non-JSON feedback
                      <div className="bg-[#0E1525] rounded-lg p-4">
                        <h4 className="text-[#00E5FF] font-semibold mb-2">📋 Feedback</h4>
                        <p className="text-gray-300 text-sm">{interview.feedback || 'No detailed feedback available.'}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-[#161E2E] rounded-2xl p-12 text-center">
                <p className="text-gray-500 text-xl mb-2">📋 No interviews yet</p>
                <p className="text-gray-400 mb-4">Your interview history will appear here once you start taking interviews.</p>
                <Link
                  href="/templates"
                  className="mt-4 bg-[#00E5FF] text-[#0E1525] px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Take Your First Interview
                </Link>
              </div>
            )}
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === 'Settings' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161E2E] rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#00E5FF]">Account</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Account</p>
                  <button className="text-white hover:text-[#00E5FF] transition-colors">Manage Account</button>
                </div>
                <div>
                  <p className="text-gray-400">Notifications</p>
                  <button className="text-white hover:text-[#00E5FF] transition-colors">Manage Notifications</button>
                </div>
                <div>
                  <p className="text-gray-400">Privacy</p>
                  <button className="text-white hover:text-[#00E5FF] transition-colors">Privacy Settings</button>
                </div>
                <div>
                  <p className="text-gray-400">Help & Support</p>
                  <button className="text-white hover:text-[#00E5FF] transition-colors">Get Support</button>
                </div>
              </div>
            </div>
            <div className="bg-[#161E2E] rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#00E5FF]">Interview Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 block mb-2">Interview Duration</label>
                  <select className="w-full bg-[#0E1525] text-white rounded-lg px-4 py-2 border border-[#00E5FF]/30">
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-2">Feedback Detail Level</label>
                  <select className="w-full bg-[#0E1525] text-white rounded-lg px-4 py-2 border border-[#00E5FF]/30">
                    <option>Detailed</option>
                    <option>Brief</option>
                    <option>Comprehensive</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-2">Notification Settings</label>
                  <div className="space-y-2">
                    {['Interview recording', 'Email notifications', 'Interview reminders', 'New features'].map((setting) => (
                      <div key={setting} className="flex items-center">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="mr-2 accent-[#00E5FF]"
                        />
                        <span className="text-white">{setting}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="bg-[#00E5FF] text-[#0E1525] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalProfile;