// dashboard.tsx
import { Users, BookOpen, Award, TrendingUp, Clock, Target } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import type { AuthContextType, Course, Achievement } from '../@types';

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  enrollmentStatus: string;
}

interface DashboardStats {
  activeCourses: number;
  completedTopics: number;
  averageScore: number;
  totalStudyTime: number;
  recentAchievements: Achievement[];
  courseProgress: CourseProgress[];
}

interface AchievementsStats {
  total: number;
  earned: number;
  progress: number;
  totalXP: number;
}

export const Dashboard: React.FC = () => {
  const { authUser, axios } = useContext(AuthContext) as AuthContextType;
  const [achievementsStats, setAchievementsStats] = useState<AchievementsStats>({
    total: 0,
    earned: 0,
    progress: 0,
    totalXP: 0
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeCourses: 0,
    completedTopics: 0,
    averageScore: 0,
    totalStudyTime: 0,
    recentAchievements: [],
    courseProgress: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Загрузка статистики достижений
  const loadAchievementsStats = async (): Promise<void> => {
    try {
      const { data } = await axios.get('/api/achievements');
      if (data.success) {
        setAchievementsStats(data.stats);
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики достижений:', error);
    }
  };

  // Загрузка статистики дашборда
  const loadDashboardStats = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Загружаем курсы пользователя
      const coursesResponse = await axios.get('/api/courses/my-courses');
      const userCourses: Course[] = coursesResponse.data.success ? coursesResponse.data.courses : [];

      // Загружаем достижения
      const achievementsResponse = await axios.get('/api/achievements');
      const achievementsData = achievementsResponse.data.success ? achievementsResponse.data : { stats: {}, achievements: [] };

      // Рассчитываем статистику
      const activeCourses = userCourses.filter((course: Course) => 
        course.enrollmentStatus === 'active' || course.enrollmentStatus === 'completed'
      ).length;

      // Считаем завершенные темы
      const completedTopics = userCourses.reduce((total: number, course: Course) => {
        return total + (course.progress || 0);
      }, 0);

      // Получаем прогресс по курсам
      const courseProgress: CourseProgress[] = userCourses.map((course: Course) => ({
        id: course.id,
        title: course.title,
        progress: course.progress || 0,
        enrollmentStatus: course.enrollmentStatus || 'not_started'
      }));

      // Получаем последние достижения
      const recentAchievements: Achievement[] = achievementsData.achievements
        ?.filter((achievement: Achievement) => achievement.earned)
        ?.slice(0, 5) || [];

      setDashboardStats({
        activeCourses,
        completedTopics: Math.round(completedTopics / (userCourses.length || 1)),
        averageScore: authUser?.profile.statistics.averageScore || 0,
        totalStudyTime: authUser?.profile.statistics.totalStudyTime || 0,
        recentAchievements,
        courseProgress
      });

    } catch (error) {
      console.error('Ошибка при загрузке статистики дашборда:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievementsStats();
    loadDashboardStats();
  }, []);

  // ... остальной код компонента без изменений

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl p-6 h-32"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-2xl p-6 h-80"></div>
            <div className="bg-gray-200 rounded-2xl p-6 h-80"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent mb-4">
            Добро пожаловать, {authUser?.profile.firstName || authUser?.profile.fullName}!
          </h1>
          <p className="text-xl text-gray-600">
            {dashboardStats.activeCourses > 0 
              ? `Вы изучаете ${dashboardStats.activeCourses} курс${dashboardStats.activeCourses > 1 ? 'а' : ''}`
              : 'Начните изучение курсов'
            }
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Общее время обучения: {dashboardStats.totalStudyTime} мин</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Активные курсы */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-[#718FDD]/20 p-6 transition-all duration-500 hover:scale-105 hover:border-[#718FDD]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 group-hover:text-[#003071] transition-colors">Активные курсы</p>
              <p className="text-2xl font-bold text-[#0F0F0F] mt-2">{dashboardStats.activeCourses}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#003071] to-[#365DA6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#003071] to-[#365DA6] h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min((dashboardStats.activeCourses / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Пройдено тем */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-[#718FDD]/20 p-6 transition-all duration-500 hover:scale-105 hover:border-[#9C27B0]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 group-hover:text-[#9C27B0] transition-colors">Прогресс обучения</p>
              <p className="text-2xl font-bold text-[#0F0F0F] mt-2">{dashboardStats.completedTopics}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#9C27B0] to-[#BA68C8] h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${dashboardStats.completedTopics}%` }}
            ></div>
          </div>
        </div>
        
        {/* Средний балл */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-[#718FDD]/20 p-6 transition-all duration-500 hover:scale-105 hover:border-[#718FDD]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 group-hover:text-[#718FDD] transition-colors">Средний балл</p>
              <p className="text-2xl font-bold text-[#0F0F0F] mt-2">
                {dashboardStats.averageScore > 0 ? dashboardStats.averageScore.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#718FDD] to-[#365DA6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          {dashboardStats.averageScore > 0 && (
            <div className="mt-4 text-xs text-gray-500">
              {dashboardStats.averageScore >= 80 ? 'Отличный результат!' : 
               dashboardStats.averageScore >= 60 ? 'Хорошие показатели!' : 
               'Продолжайте в том же духе!'}
            </div>
          )}
        </div>
        
        {/* Достижения */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-[#718FDD]/20 p-6 transition-all duration-500 hover:scale-105 hover:border-[#003071]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 group-hover:text-[#003071] transition-colors">Достижения</p>
              <p className="text-2xl font-bold text-[#0F0F0F] mt-2">
                {achievementsStats.earned}/{achievementsStats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#003071] to-[#718FDD] h-2 rounded-full transition-all duration-1000"
              style={{ width: `${achievementsStats.progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Прогресс: {achievementsStats.progress}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Прогресс по курсам */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
          <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-[#212838]" />
            Прогресс по курсам
          </h2>
          <div className="space-y-6">
            {dashboardStats.courseProgress.length > 0 ? (
              dashboardStats.courseProgress.map((course, index) => {
                const colors = [
                  'from-[#003071] to-[#365DA6]',
                  'from-[#9C27B0] to-[#BA68C8]',
                  'from-[#718FDD] to-[#365DA6]',
                  'from-[#003071] to-[#718FDD]',
                  'from-[#9C27B0] to-[#718FDD]'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={course.id} className="group">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-medium text-[#0F0F0F] group-hover:text-[#003071] transition-colors truncate mr-2">
                        {course.title}
                      </span>
                      <span className="text-gray-600 flex-shrink-0">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-1000 ease-out group-hover:scale-105`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Статус: {course.enrollmentStatus === 'completed' ? 'Завершен' : 'В процессе'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">У вас пока нет активных курсов</p>
                <a href="/courses" className="text-[#003071] hover:underline mt-2 inline-block">
                  Выбрать курс
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Быстрый доступ и последние достижения */}
        <div className="space-y-8">
          {/* Быстрый доступ */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-[#212838]" />
              Быстрый доступ
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Все курсы', icon: BookOpen, color: 'bg-[#003071] col-span-2', hover: 'hover:bg-[#365DA6]', href: '/courses' },
                { name: 'Достижения', icon: Award, color: 'bg-[#9C27B0]', hover: 'hover:bg-[#BA68C8]', href: '/achievements' },
                { name: 'Профиль', icon: Users, color: 'bg-[#718FDD]', hover: 'hover:bg-[#365DA6]', href: '/profile' },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`group ${item.color} ${item.hover} text-white p-6 rounded-xl text-center hover:shadow-2xl hover:scale-105 transition-all duration-500 transform`}
                >
                  <item.icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold text-sm">{item.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Последние достижения */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-[#212838]" />
              Последние достижения
            </h2>
            <div className="space-y-4">
              {dashboardStats.recentAchievements.length > 0 ? (
                dashboardStats.recentAchievements.slice(0, 3).map((achievement: Achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#003071]/5 to-[#718FDD]/5 rounded-xl border border-[#718FDD]/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#0F0F0F] text-sm truncate">
                        {achievement.name}
                      </h4>
                      <p className="text-gray-600 text-xs truncate">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="text-xs text-[#003071] font-semibold">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Пока нет достижений</p>
                </div>
              )}
            </div>
            {achievementsStats.earned > 0 && (
              <a 
                href="/achievements" 
                className="block text-center mt-4 text-[#003071] hover:text-[#718FDD] transition-colors text-sm"
              >
                Показать все достижения ({achievementsStats.earned})
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};