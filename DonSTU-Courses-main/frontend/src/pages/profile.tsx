import { User, Mail, Calendar, BookOpen, Award, Settings, Edit3, BarChart3, Target } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { EditProfileModal } from '../components/edit-profile-modal';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { UserProfile as UserProfileType, AuthContextType } from '../@types';

export const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { axios } = useContext(AuthContext) as AuthContextType;

  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/auth/profile');
      
      if (data.success) {
        setUserData(data.profile);
      } else {
        toast.error('Ошибка при загрузке профиля');
      }
    } catch (error) {
      const message = (error as Error).message || 'Ошибка при загрузке профиля';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  // profile.tsx - обновите функцию handleSaveProfile
const handleSaveProfile = async (updatedData: Partial<UserProfileType>): Promise<boolean> => {
  try {
    // ИСПРАВЛЕНИЕ: Проверка даты перед отправкой
    if (updatedData.dateOfBirth) {
      const date = new Date(updatedData.dateOfBirth);
      if (isNaN(date.getTime())) {
        toast.error('Неверный формат даты рождения');
        return false;
      }
    }

    const { data } = await axios.put('/api/auth/profile', updatedData);
    
    if (data.success) {
      setUserData(data.profile);
      toast.success('Профиль успешно обновлен');
      return true;
    } else {
      toast.error(data.message || 'Ошибка при обновлении профиля');
      return false;
    }
  } catch (error) {
    const message = (error as Error).message || 'Ошибка при обновлении профиля';
    toast.error(message);
    console.error('Profile update error:', error);
    return false;
  }
};

  useEffect(() => {
    fetchProfile();
  }, []);

  // Форматирование времени обучения
  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}м`;
    if (mins === 0) return `${hours}ч`;
    return `${hours}ч ${mins}м`;
  };

  // Расчет общего прогресса
  const calculateOverallProgress = (): number => {
    if (!userData?.statistics) return 0;
    const { averageScore, completedTopics, totalStudyTime } = userData.statistics;
    return Math.min(Math.round((averageScore + completedTopics * 2 + Math.min(totalStudyTime / 10, 30)) / 3), 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="xl:col-span-3 space-y-6">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Профиль не найден</h1>
          <button 
            onClick={fetchProfile}
            className="bg-[#003071] text-white px-6 py-3 rounded-xl hover:bg-[#718FDD] transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Левая колонка - информация профиля */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 text-center hover:shadow-xl transition-all duration-500">
              <div className="relative inline-block mb-4">
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.fullName}
                    className="w-32 h-32 rounded-2xl object-cover mx-auto shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/90 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300"
                >
                  <Edit3 className="w-4 h-4 text-[#718FDD]" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-2">{userData.fullName}</h2>
              <p className="text-gray-600 mb-2">Студент ДГТУ</p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                {userData.bio || 'Пока нет описания профиля'}
              </p>
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full group bg-gradient-to-r from-[#003071] to-[#718FDD] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Редактировать профиль
              </button>
            </div>
          </div>

          {/* Правая колонка - основная информация */}
          <div className="xl:col-span-3">
            {/* Личная информация */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 mb-6 hover:shadow-xl transition-all duration-500">
              <h3 className="text-2xl font-bold text-[#0F0F0F] mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-[#003071]" />
                Личная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Mail, label: 'Email', value: userData.email, color: 'text-[#718FDD]' },
                  { icon: Calendar, label: 'Дата регистрации', value: userData.registrationDate, color: 'text-[#9C27B0]' },
                  { icon: BookOpen, label: 'Активные курсы', value: `${userData.statistics.activeCourses} курсов`, color: 'text-[#003071]' },
                  { icon: Award, label: 'Пройдено тем', value: `${userData.statistics.completedTopics} тем`, color: 'text-[#718FDD]' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-[#718FDD]/20 hover:border-[#718FDD]/40 transition-all duration-300 group">
                    <div className={`w-12 h-12 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-[#0F0F0F] font-semibold group-hover:text-[#003071] transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Статистика и быстрый доступ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Статистика обучения */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
                <h3 className="text-xl font-semibold text-[#0F0F0F] mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-[#003071]" />
                  Статистика обучения
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Общий прогресс', value: calculateOverallProgress(), color: 'from-[#003071] to-[#718FDD]' },
                    { label: 'Средняя оценка', value: userData.statistics.averageScore, color: 'from-[#9C27B0] to-[#BA68C8]' },
                    { label: 'Время обучения', value: userData.statistics.totalStudyTime, color: 'from-[#718FDD] to-[#365DA6]', isTime: true },
                  ].map((stat, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="font-medium text-[#0F0F0F] group-hover:text-[#003071] transition-colors">
                          {stat.label}
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {stat.isTime 
                            ? formatStudyTime(stat.value)
                            : `${stat.value}%`
                          }
                        </span>
                      </div>
                      {!stat.isTime && (
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${stat.color} h-3 rounded-full transition-all duration-1000 ease-out group-hover:scale-105`}
                            style={{ width: `${stat.value}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Быстрый доступ */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#718FDD]/20 p-6 hover:shadow-xl transition-all duration-500">
                <h3 className="text-xl font-semibold text-[#0F0F0F] mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-3 text-[#9C27B0]" />
                  Быстрый доступ
                </h3>
                <div className="space-y-4">
                  {[
                    { action: 'Мои курсы', description: 'Продолжите обучение', icon: BookOpen, path: '/my-courses' },
                    { action: 'Достижения', description: 'Посмотрите ваши награды', icon: Award, path: '/achievements' },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => { window.location.href = item.path; }}
                      className="w-full flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#718FDD]/10 hover:border-[#718FDD]/30 transition-all duration-300 group text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#0F0F0F] group-hover:text-[#003071] transition-colors">
                          {item.action}
                        </p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onSave={handleSaveProfile}
      />
    </>
  );
};