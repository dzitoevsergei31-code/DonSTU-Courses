import { Menu, X, Bell, Search, BookOpen, MessageSquare, Award, Calendar } from 'lucide-react';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { AuthContextType, Course, Notification as NotificationType } from '../@types';

const NOTIFICATION_ICONS = {
  course: BookOpen,
  achievement: Award,
  reminder: Calendar,
  news: MessageSquare,
  system: Bell
};

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { logout, authUser, axios } = useContext(AuthContext) as AuthContextType;

  // Загрузка курсов для поиска
  useEffect(() => {
    if (authUser && isSearchOpen) {
      loadCourses();
    }
  }, [authUser, isSearchOpen]);

  // Загрузка уведомлений
  useEffect(() => {
    if (authUser) {
      loadNotifications();
    }
  }, [authUser]);

  // Закрытие меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadCourses = async (): Promise<void> => {
    try {
      const { data } = await axios.get('/api/courses/get-courses');
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    }
  };

  const loadNotifications = async (): Promise<void> => {
  try {
    setLoadingNotifications(true);
    const { data } = await axios.get('/api/notifications');
    
    if (data.success) {
      setNotifications(data.notifications || []);
    } else {
      // Не показываем ошибку пользователю, просто устанавливаем пустой массив
      console.log('No notifications found or API returned error');
      setNotifications([]);
    }
  } catch (error) {
      const err = error as Error & { response?: { status: number } };
      if (err.response?.status === 401) {
        console.log('User not authorized for notifications yet');
      } else if (err.response?.status === 404) {
        // API не найдено - игнорируем
        console.log('Notifications API not available');
      } else {
        console.error('Error loading notifications:', error);
      }
    setNotifications([]);
  } finally {
    setLoadingNotifications(false);
  }
};

  // Поиск курсов
  useEffect(() => {
    if (searchQuery.trim() && courses.length > 0) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.shortDescription && course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, courses]);

  // Закрытие поиска и уведомлений при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (isMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = (): void => {
    setIsSearchOpen(!isSearchOpen);
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    if (!isSearchOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleNotificationsToggle = async (): Promise<void> => {
    if (!isNotificationsOpen) {
      await loadNotifications();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const handleCourseSelect = (): void => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleNotificationClick = async (notificationId: string, actionUrl?: string): Promise<void> => {
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );

    if (actionUrl) {
      window.location.href = actionUrl;
    }
  } catch (error) {
    const err = error as Error & { response?: { status: number } };
    if (err.response?.status !== 401 && err.response?.status !== 404) {
      console.error('Error marking notification as read:', error);
    }
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }
};

  const markAllAsRead = async (): Promise<void> => {
  try {
    await axios.put('/api/notifications/read-all');
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    toast.success('Все уведомления прочитаны');
  } catch (error) {
    const err = error as Error & { response?: { status: number } };
    if (err.response?.status !== 401 && err.response?.status !== 404) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Ошибка при обновлении уведомлений');
    } else {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      toast.success('Все уведомления прочитаны');
    }
  }
};

  const getNotificationIcon = (iconType: keyof typeof NOTIFICATION_ICONS) => {
    return NOTIFICATION_ICONS[iconType] || Bell;
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-[#718FDD]/20 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Логотип и бренд */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/logoo.png" 
              alt="ДГТУ Курсы" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>

          {/* Десктопная навигация */}
          {authUser && 
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="/" className="group relative text-[#0F0F0F] font-medium hover:text-[#003071] transition-all duration-300 text-sm xl:text-base">
                Главная
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#003071] to-[#9C27B0] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/courses" className="group relative text-[#0F0F0F] font-medium hover:text-[#003071] transition-all duration-300 text-sm xl:text-base">
                Курсы
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#003071] to-[#9C27B0] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/achievements" className="group relative text-[#0F0F0F] font-medium hover:text-[#003071] transition-all duration-300 text-sm xl:text-base">
                Достижения
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#003071] to-[#9C27B0] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/profile" className="group relative text-[#0F0F0F] font-medium hover:text-[#003071] transition-all duration-300 text-sm xl:text-base">
                Профиль
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#003071] to-[#9C27B0] group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>
          }

          {/* Правая часть с элементами управления */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {authUser && 
            <>
              {/* Поисковая строка - адаптивная */}
              <div ref={searchRef} className="relative">
                <div className={`flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-[#718FDD]/20 transition-all duration-300 ease-in-out overflow-hidden ${
                  isSearchOpen 
                    ? 'w-48 sm:w-64 md:w-80 shadow-lg' 
                    : 'w-10 sm:w-12 hover:w-14 sm:hover:w-16'
                } hover:shadow-lg hover:border-[#718FDD]/40`}>
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 transition-all duration-300 group flex-shrink-0"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#718FDD] group-hover:text-[#9C27B0] transition-colors" />
                  </button>
                  
                  <div className={`transition-all duration-300 flex-1 ${
                    isSearchOpen ? 'opacity-100' : 'opacity-0 w-0'
                  }`}>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Поиск курсов..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 bg-transparent focus:outline-none text-[#0F0F0F] placeholder-gray-400 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Результаты поиска - адаптивные */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#718FDD]/20 animate-in slide-in-from-top duration-300 z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      {searchResults.map((course) => (
                        <a
                          key={course.id}
                          href={`/courses/${course.id}`}
                          onClick={handleCourseSelect}
                          className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-[#003071]/5 transition-all duration-300 group"
                        >
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#003071] to-[#718FDD] rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#0F0F0F] group-hover:text-[#003071] transition-colors truncate text-sm sm:text-base">
                              {course.title}
                            </h4>
                            <p className="text-gray-600 truncate text-xs sm:text-sm">
                              {course.shortDescription || course.description || 'Описание отсутствует'}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Сообщения для разных состояний поиска */}
                {isSearchOpen && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#718FDD]/20 animate-in slide-in-from-top duration-300 z-50">
                    <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
                      Курсы не найдены
                    </div>
                  </div>
                )}

                {isSearchOpen && courses.length === 0 && !searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#718FDD]/20 animate-in slide-in-from-top duration-300 z-50">
                    <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
                      Загрузка курсов...
                    </div>
                  </div>
                )}
              </div>

              {/* Уведомления - адаптивные */}
              <div ref={notificationsRef} className="relative">
                <button 
                  onClick={handleNotificationsToggle}
                  className="relative p-2 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl hover:shadow-lg transition-all duration-300 group"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#718FDD] group-hover:text-[#9C27B0] transition-colors" />
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#9C27B0] rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs text-white font-semibold">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    </div>
                  )}
                </button>

                {/* Окно уведомлений - адаптивное */}
                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#718FDD]/20 animate-in slide-in-from-top duration-300 z-50 max-h-80 sm:max-h-96 overflow-hidden">
                    {/* Заголовок */}
                    <div className="p-3 sm:p-4 border-b border-[#718FDD]/20">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#0F0F0F] text-sm sm:text-base">Уведомления</h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotificationsCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-xs text-[#003071] hover:text-[#718FDD] transition-colors"
                            >
                              Прочитать все
                            </button>
                          )}
                          <span className="text-xs sm:text-sm text-gray-500">
                            {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} новых` : 'Нет новых'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Список уведомлений */}
                    <div className="overflow-y-auto max-h-64 sm:max-h-80">
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                          Загрузка уведомлений...
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const IconComponent = getNotificationIcon(notification.iconType as keyof typeof NOTIFICATION_ICONS);
                          
                          return (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                              className={`p-3 sm:p-4 border-b border-[#718FDD]/10 last:border-b-0 hover:bg-[#003071]/5 transition-all duration-300 cursor-pointer group ${
                                !notification.isRead ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${notification.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${notification.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <h4 className={`font-semibold text-xs sm:text-sm ${
                                      !notification.isRead 
                                        ? 'text-[#003071]' 
                                        : 'text-[#0F0F0F] group-hover:text-[#003071]'
                                    } transition-colors`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-[#9C27B0] rounded-full ml-2 flex-shrink-0 mt-1"></div>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 sm:p-8 text-center">
                          <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                          <p className="text-gray-500 text-sm">У вас пока нет уведомлений</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Кнопка выхода - адаптивная */}
              <button 
                onClick={() => logout()} 
                className="hidden sm:flex cursor-pointer border border-[#718FDD] bg-white text-[#718FDD] px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Выйти
              </button>
            </>
            }
            
            {/* Кнопка мобильного меню */}
            <button 
              className="lg:hidden p-2 bg-white/80 backdrop-blur-sm border border-[#718FDD]/20 rounded-xl hover:shadow-lg transition-all duration-300 mobile-menu-container"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню - улучшенное */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-[#718FDD]/20 p-4 sm:p-6 animate-in slide-in-from-top duration-300 mobile-menu-container">
            <nav className="flex flex-col space-y-3 sm:space-y-4">
              <a 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0F0F0F] font-medium hover:text-[#003071] transition-colors py-2 border-b border-[#718FDD]/10 text-sm sm:text-base"
              >
                Главная
              </a>
              <a 
                href="/courses" 
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0F0F0F] font-medium hover:text-[#003071] transition-colors py-2 border-b border-[#718FDD]/10 text-sm sm:text-base"
              >
                Курсы
              </a>
              <a 
                href="/achievements" 
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0F0F0F] font-medium hover:text-[#003071] transition-colors py-2 border-b border-[#718FDD]/10 text-sm sm:text-base"
              >
                Достижения
              </a>
              <a 
                href="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0F0F0F] font-medium hover:text-[#003071] transition-colors py-2 border-b border-[#718FDD]/10 text-sm sm:text-base"
              >
                Профиль
              </a>
              
              {/* Кнопка выхода в мобильном меню */}
              {authUser && (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }} 
                  className="sm:hidden mt-2 cursor-pointer border border-[#718FDD] bg-white text-[#718FDD] px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                >
                  Выйти
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};