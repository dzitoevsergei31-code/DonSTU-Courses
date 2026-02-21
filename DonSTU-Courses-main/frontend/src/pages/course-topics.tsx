import { ChevronRight, BookOpen, CheckCircle, Clock, Play, Star } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { Course, Topic, AuthContextType } from '../@types';

interface CourseWithProgress extends Course {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProgress: any[];
  completedTopics?: string[];
}

export const CourseTopics = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseWithProgress | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { axios } = useContext(AuthContext) as AuthContextType;

  const getCourseInfo = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get(`/api/courses/${courseId}`);

    if (data.success) {
      const courseData = data.course;
      const userProgress = courseData.userProgress || [];
      
      setCourse({
        ...courseData,
        userProgress: userProgress
      });
      
      setTopics(courseData.lessons || []);
      
      const completedIds = new Set<string>();
      let currentLesson: string | null = null;

      // ПРОСТАЯ ЛОГИКА: используем ТОЛЬКО completedTopics с бэкенда
      if (courseData.completedTopics && Array.isArray(courseData.completedTopics)) {
        courseData.completedTopics.forEach((topicId: string) => {
          completedIds.add(topicId);
        });
        console.log('✅ Completed topics from backend:', courseData.completedTopics);
      }

      // Получаем текущий урок из enrollment
      if (userProgress.length > 0 && userProgress[0].currentLessonId) {
        const enrollment = userProgress[0];
        setCurrentLessonId(enrollment.currentLessonId);
        currentLesson = enrollment.currentLessonId;
        
        console.log('📚 Current lesson ID:', currentLesson);
      }

      console.log('🎯 Final completed topics:', Array.from(completedIds));
      setCompletedTopics(completedIds);
    }
  } catch (error) {
    const message = (error as Error).message || 'Произошла ошибка';
    toast.error(message);
    console.error('❌ Error fetching course info:', message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (courseId) {
      getCourseInfo();
    }
  }, [courseId]);

  const isLessonCompleted = (topic: Topic) => {
  return completedTopics.has(topic.id);
};

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Курс не найден</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-8 mb-8 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-[#003071] transition-colors duration-300">
            Курсы
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#003071] font-medium">{course.title}</span>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4 bg-linear-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
              {course.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              {course.description}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#718FDD]/20">
            <BookOpen className="w-4 h-4 text-[#718FDD]" />
            <span className="text-[#0F0F0F] font-medium">{topics.length} уроков</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#9C27B0]/20">
            <Clock className="w-4 h-4 text-[#9C27B0]" />
            <span className="text-[#0F0F0F] font-medium">{course.duration} часов</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#718FDD]/20">
            <Star className="w-4 h-4 text-[#718FDD] fill-[#718FDD]" />
            <span className="text-[#0F0F0F] font-medium">{course.rating}/5</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#003071]/20">
            <CheckCircle className="w-4 h-4 text-[#003071]" />
            <span className="text-[#0F0F0F] font-medium">
              {completedTopics.size} из {topics.length} пройдено
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">В этом курсе пока нет уроков</p>
          </div>
        ) : (
          topics.map((topic) => {
            const isCompleted = isLessonCompleted(topic);
            const isCurrent = currentLessonId === topic.id;
            
            let buttonClass = 'group/btn flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ';
            let buttonText = 'Начать';
            
            if (isCompleted) {
              buttonClass += 'bg-linear-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105';
              buttonText = 'Повторить';
            } else if (isCurrent) {
              buttonClass += 'bg-linear-to-r from-[#003071] to-[#718FDD] text-white hover:shadow-lg hover:scale-105 hover:from-[#718FDD] hover:to-[#003071]';
              buttonText = 'Продолжить';
            } else {
              buttonClass += 'bg-linear-to-r from-[#003071] to-[#718FDD] text-white hover:shadow-lg hover:scale-105 hover:from-[#718FDD] hover:to-[#003071]';
              buttonText = 'Начать';
            }
            
            let containerClass = 'group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border transition-all duration-500 hover:scale-[1.02] ';
            if (isCurrent) {
              containerClass += 'border-[#9C27B0] bg-[#9C27B0]/5 hover:shadow-2xl';
            } else if (isCompleted) {
              containerClass += 'border-green-200 bg-green-50/50 hover:shadow-xl';
            } else {
              containerClass += 'border-[#718FDD]/20 hover:border-[#718FDD]/40 hover:shadow-xl';
            }
            
            let iconClass = 'w-14 h-14 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-300 group-hover:scale-110 ';
            if (isCompleted) {
              iconClass += 'bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg';
            } else if (isCurrent) {
              iconClass += 'bg-linear-to-br from-[#9C27B0] to-[#BA68C8] text-white shadow-lg';
            } else {
              iconClass += 'bg-gray-100 text-gray-400';
            }

            return (
              <div key={topic.id} className={containerClass}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className={iconClass}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : isCurrent ? (
                        topic.order
                      ) : (
                        topic.order
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0F0F0F] group-hover:text-[#003071] transition-colors">
                        Урок {topic.order}: {topic.title}
                        {isCurrent && (
                          <span className="ml-2 text-sm bg-[#9C27B0] text-white px-2 py-1 rounded-full">
                            Текущий
                          </span>
                        )}
                        {isCompleted && (
                          <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                            Пройдено
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{topic.duration} минут</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link 
                        to={`/courses/${courseId}/topics/${topic.id}`}
                        className={buttonClass}
                      >
                        <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        {buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
                
                {isCompleted && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Пройдено • 100%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};