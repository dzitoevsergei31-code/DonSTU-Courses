import { Search, BookOpen, Clock, Star, Play } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { Course, AuthContextType } from '../@types';

export const Courses = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all');

  const { axios } = useContext(AuthContext) as AuthContextType;

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/courses/get-courses');

      console.log(data);

      if (data.success) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      } else {
        toast.error(
          data.message || 'Произошла ошибка при загрузке курсов'
        );
      }
    } catch (error) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  useEffect(() => {
    if (!courses.length) return;

    let filtered = [...courses];

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query)
      );
    }

    // Сортировка по рейтингу
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, sortBy]);

  useEffect(() => {
    loadCourses();
  }, []);

  // Skeleton Loader
  const CourseSkeleton = () => (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-[#718FDD]/20 animate-pulse">
      <div className="h-2 bg-gray-300"></div>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-4/5"></div>
        </div>
        <div className="flex justify-between mb-6">
          <div className="h-3 bg-gray-300 rounded w-16"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="h-12 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4 bg-linear-to-r from-[#003071] to-[#9C27B0] bg-clip-text text-transparent">
            Все курсы
          </h1>
          <p className="text-xl text-gray-600">Выберите курс для начала обучения</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto mt-6 lg:mt-0">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#718FDD] transition-colors" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent w-full lg:w-80 transition-all duration-300 group-hover:border-[#718FDD]/40"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#718FDD] focus:border-transparent transition-all duration-300"
          >
            <option value="all">Все курсы</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <CourseSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl border border-[#718FDD]/20 transition-all duration-500 hover:scale-105">
              <div className="relative overflow-hidden">
                <div className="h-2 bg-linear-to-r from-[#003071] via-[#9C27B0] to-[#718FDD] group-hover:from-[#718FDD] group-hover:via-[#9C27B0] group-hover:to-[#003071] transition-all duration-500"></div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-linear-to-br from-[#003071] to-[#365DA6] rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F0F0F] group-hover:text-[#003071] transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${
                              star <= Math.round(course.rating) 
                                ? 'fill-[#718FDD] text-[#718FDD]' 
                                : 'fill-gray-300 text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({course.rating})</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {course.shortDescription}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration} часов</span>
                  </div>
                </div>
                
                <a 
                  href={`/courses/${course.id}`} 
                  className="w-full group/btn bg-linear-to-r from-[#003071] to-[#365DA6] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 hover:from-[#365DA6] hover:to-[#003071] flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  Перейти
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};