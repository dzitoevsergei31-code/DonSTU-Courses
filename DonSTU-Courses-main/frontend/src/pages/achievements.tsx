import { Trophy, Star, Award, Target, Zap, Flame, Crown } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { Achievement, AchievementStats, AuthContextType } from './../@types/index.ts';

export const Achievements = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    total: 0,
    earned: 0,
    progress: 0,
    totalXP: 0,
    byRarity: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }
  });

  const { axios } = useContext(AuthContext) as AuthContextType;

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/achievements');

      if (data.success) {
        setAchievements(data.achievements);
        setStats(data.stats);
      } else {
        toast.error(data.message || 'Произошла ошибка при загрузке достижений');
      }
    } catch (error) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const getAchievementIcon = (type: string, earned: boolean) => {
    const iconProps = {
      className: `w-8 h-8 ${earned ? 'text-white' : 'text-gray-400'}`,
      size: 32
    };

    switch (type) {
      case 'course_completion':
        return <Trophy {...iconProps} />;
      case 'perfect_score':
        return <Star {...iconProps} />;
      case 'speed_run':
        return <Zap {...iconProps} />;
      case 'streak':
        return <Flame {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const getRarityColor = (rarity: string, earned: boolean) => {
    if (!earned) {
      return 'from-gray-400 to-gray-500';
    }

    switch (rarity) {
      case 'common':
        return 'from-blue-500 to-blue-600';
      case 'rare':
        return 'from-purple-500 to-purple-600';
      case 'epic':
        return 'from-pink-500 to-pink-600';
      case 'legendary':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    const rarityNames: Record<string, string> = {
      common: 'Обычное',
      rare: 'Редкое',
      epic: 'Эпическое',
      legendary: 'Легендарное'
    };
    return rarityNames[rarity] || rarity;
  };

  const AchievementSkeleton = () => (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-300 rounded w-32"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
          <div className="h-10 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4 bg-linear-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
          Мои достижения
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Коллекционируйте награды и отслеживайте ваш прогресс в обучении
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#718FDD]/20">
          <div className="w-16 h-16 bg-linear-to-br from-[#003071] to-[#718FDD] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F0F0F] mb-1">{stats.earned}</h3>
          <p className="text-gray-600 text-sm">Получено достижений</p>
          <div className="mt-2 text-xs text-gray-500">
            из {stats.total}
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#9C27B0]/20">
          <div className="w-16 h-16 bg-linear-to-br from-[#9C27B0] to-[#BA68C8] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F0F0F] mb-1">{stats.byRarity.legendary}</h3>
          <p className="text-gray-600 text-sm">Легендарных</p>
          <div className="mt-2 text-xs text-gray-500">
            наивысшая редкость
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#718FDD]/20">
          <div className="w-16 h-16 bg-linear-to-br from-[#718FDD] to-[#365DA6] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F0F0F] mb-1">{stats.progress}%</h3>
          <p className="text-gray-600 text-sm">Общий прогресс</p>
          <div className="mt-2 text-xs text-gray-500">
            выполнено
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#365DA6]/20">
          <div className="w-16 h-16 bg-linear-to-br from-[#365DA6] to-[#003071] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F0F0F] mb-1">{stats.totalXP}</h3>
          <p className="text-gray-600 text-sm">Всего опыта</p>
          <div className="mt-2 text-xs text-gray-500">
            получено
          </div>
        </div>
      </div>

      {/* Список достижений */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <AchievementSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border transition-all duration-500 hover:scale-105 ${
                achievement.earned 
                  ? 'border-[#718FDD]/20 hover:shadow-2xl' 
                  : 'border-gray-200/50 opacity-75'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 bg-linear-to-br ${getRarityColor(achievement.rarity, achievement.earned)} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                  !achievement.earned && 'grayscale'
                }`}>
                  {getAchievementIcon(achievement.type, achievement.earned)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${
                      achievement.earned ? 'text-[#0F0F0F]' : 'text-gray-400'
                    }`}>
                      {achievement.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      achievement.rarity === 'common' ? 'bg-blue-100 text-blue-600' :
                      achievement.rarity === 'rare' ? 'bg-purple-100 text-purple-600' :
                      achievement.rarity === 'epic' ? 'bg-pink-100 text-pink-600' :
                      achievement.rarity === 'legendary' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getRarityName(achievement.rarity)}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    achievement.earned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Прогресс */}
                  {!achievement.earned && achievement.progressPercentage && achievement.progressPercentage > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Прогресс</span>
                        <span>{achievement.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-linear-to-r from-[#003071] to-[#718FDD] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                      achievement.earned 
                        ? 'bg-linear-to-r from-[#003071] to-[#718FDD] text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {achievement.earned ? 'Получено' : 'Не получено'}
                    </div>
                    
                    {achievement.earned && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>+{achievement.xpReward} XP</span>
                      </div>
                    )}
                  </div>

                  {achievement.earned && achievement.earnedAt && (
                    <div className="mt-2 text-xs text-gray-400">
                      Получено: {new Date(achievement.earnedAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Сообщение если нет достижений */}
      {!loading && achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            Достижения не найдены
          </h3>
          <p className="text-gray-400">
            Начните обучение, чтобы получать достижения
          </p>
        </div>
      )}
    </div>
  );
};